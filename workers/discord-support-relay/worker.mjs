/**
 * TennoFrame — Cloudflare Worker Support Relay (5-Layer Anti-Spam + Zero-Risk Image CDR Edition)
 *
 * Security & Anti-Spam Layers:
 *   1. Persistent Client DPAPI Quota + Skia `nativeImage` Pixel Re-Encoding (EXIF/polyglot stripped)
 *   2. Persistent Server Quota in Cloudflare KV (`SUPPORT_KV`) by IP Hash + Device Hash (10 min cooldown, max 3 / 24h)
 *   3. Single-Use HMAC-SHA256 Challenge Token (`/v1/challenge`, min 3.5s human write time, replay-protected)
 *   4. Smart Content & Anti-Promo Filter + Binary PNG/JPEG Header+Trailer Verification (`IEND` / `FFD9`)
 *   5. Permanent Ban System (`ban:usr_xxxxxxxx` in `SUPPORT_KV`, Sender ID shown in Discord Embed footer)
 */

const ALLOWED_DISCORD_HOSTS = new Set([
  'discord.com',
  'discordapp.com',
  'canary.discord.com',
  'ptb.discord.com'
])

const CATEGORY_META = {
  bug: {
    secretKey: 'DISCORD_WEBHOOK_BUG',
    botName: 'TennoFrame — Bug Report',
    label: '🐛 BUG REPORT',
    color: 0xef4444,
    forumPrefix: 'BUG'
  },
  feature: {
    secretKey: 'DISCORD_WEBHOOK_SUGGESTION',
    botName: 'TennoFrame — Suggestion',
    label: '💡 SUGGESTION',
    color: 0xf59e0b,
    forumPrefix: 'IDEA'
  },
  help: {
    secretKey: 'DISCORD_WEBHOOK_HELP',
    botName: 'TennoFrame — Question / Help',
    label: '❓ QUESTION / HELP',
    color: 0x5865f2,
    forumPrefix: 'HELP'
  }
}

const COOLDOWN_MS = 10 * 60_000 // 10 minutes between two tickets
const WINDOW_24H_MS = 24 * 3_600_000 // Rolling 24h window
const DAILY_MAX = 3 // Max 3 tickets per 24h
const CHALLENGE_MIN_AGE_MS = 3_500 // Minimum 3.5s human typing delay
const CHALLENGE_MAX_AGE_MS = 15 * 60_000 // Challenge valid for 15 minutes
const MAX_JSON_BODY_BYTES = 3_800_000 // Max HTTP JSON payload (~2.5 MB image in base64 + text)
const MAX_TEXT_ONLY_BYTES = 16_384 // Strict ceiling when no image attachment is included
const MAX_IMAGE_BYTES = 2_621_440 // 2.5 MiB binary image ceiling
const MAX_IMAGE_DIM = 4_096 // Max width/height after client CDR
const MAX_IMAGE_PIXELS = 12_000_000 // Max total pixels

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  })
}

function toHex(bytes) {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function sha256Hex(input) {
  const data = typeof input === 'string' ? new TextEncoder().encode(input) : input
  const digest = await crypto.subtle.digest('SHA-256', data)
  return toHex(digest)
}

async function hmacSignHex(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return toHex(sig)
}

function sanitizeField(str, maxLen) {
  return String(str || '')
    .replace(/\u0000/g, '')
    .replace(/@(everyone|here)/gi, '@\u200b$1')
    .trim()
    .slice(0, maxLen)
}

function detectSpamContent(subject, message) {
  const combined = `${subject} ${message}`

  if (/(.)\1{7,}/i.test(combined)) {
    return 'Repeated character spam detected.'
  }

  const words = message.split(/\s+/).filter((w) => w.length >= 2)
  const distinctLetters = new Set(
    message.toLowerCase().replace(/[^a-z\u00c0-\u024f\u0400-\u04ff]/g, '')
  )
  if (words.length < 3 || (distinctLetters.size > 0 && distinctLetters.size < 4)) {
    return 'Please write a clear, complete sentence (minimum 3 words).'
  }

  if (/\b(\w{2,})\b(?:\s+\1\b){3,}/i.test(combined)) {
    return 'Repeated word spam detected.'
  }

  const inviteMatches =
    combined.match(/(?:discord\.gg|discord(?:app)?\.com\/invite)\/([a-z0-9-]+)/gi) || []
  for (const inv of inviteMatches) {
    if (!inv.toLowerCase().endsWith('/dhgwhpf82n')) {
      return 'External Discord server invites are not allowed.'
    }
  }

  if (/free\s+nitro|steamcommunlty|dlscord\.com/i.test(combined)) {
    return 'Suspicious promotional or phishing content blocked.'
  }

  const urlCount = (combined.match(/https?:\/\//gi) || []).length
  if (urlCount > 2) {
    return 'Too many external URLs in a single message (max 2).'
  }

  return null
}

function decodeBase64Strict(b64) {
  if (typeof b64 !== 'string' || b64.length < 32 || b64.length > 3_550_000) {
    return null
  }
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64) || b64.length % 4 !== 0) {
    return null
  }
  try {
    const bin = atob(b64)
    const out = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) {
      out[i] = bin.charCodeAt(i)
    }
    return out
  } catch {
    return null
  }
}

function hasEmbeddedExecutableOrScript(bytes) {
  if (bytes[0] === 0x4d && bytes[1] === 0x5a) return true // MZ (PE/EXE/DLL)
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) return true // ZIP
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return true // GIF

  let head = ''
  const scanLen = Math.min(512, bytes.byteLength)
  for (let i = 0; i < scanLen; i++) {
    head += String.fromCharCode(bytes[i])
  }
  const lower = head.toLowerCase()
  return (
    lower.includes('<svg') ||
    lower.includes('<html') ||
    lower.includes('<!doc') ||
    lower.includes('<script') ||
    lower.includes('<?xml') ||
    lower.startsWith('%pdf-')
  )
}

function verifyStrictPngBytes(bytes) {
  if (bytes.byteLength < 45) return null
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  for (let i = 0; i < sig.length; i++) {
    if (bytes[i] !== sig[i]) return null
  }
  // Must start with IHDR chunk at 12..15
  if (
    bytes[12] !== 0x49 ||
    bytes[13] !== 0x48 ||
    bytes[14] !== 0x44 ||
    bytes[15] !== 0x52
  ) {
    return null
  }
  // Must end with exact 12-byte IEND chunk (blocks trailing polyglot ZIP/EXE payloads!)
  const iend = [0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]
  const tailStart = bytes.byteLength - iend.length
  for (let i = 0; i < iend.length; i++) {
    if (bytes[tailStart + i] !== iend[i]) return null
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const width = view.getUint32(16, false)
  const height = view.getUint32(20, false)
  return { width, height }
}

function verifyStrictJpegBytes(bytes) {
  if (bytes.byteLength < 32) return null
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return null
  // Must end with exact JPEG EOI marker FF D9 (blocks trailing polyglot payloads!)
  if (bytes[bytes.byteLength - 2] !== 0xff || bytes[bytes.byteLength - 1] !== 0xd9) {
    return null
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let offset = 2
  while (offset + 9 < bytes.byteLength) {
    if (bytes[offset] !== 0xff) {
      offset += 1
      continue
    }
    while (offset < bytes.byteLength && bytes[offset] === 0xff) {
      offset += 1
    }
    if (offset >= bytes.byteLength) break
    const marker = bytes[offset]
    offset += 1

    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      continue
    }
    if (offset + 2 > bytes.byteLength) break
    const segLen = view.getUint16(offset, false)
    if (segLen < 2 || offset + segLen > bytes.byteLength) break

    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    if (isSof && offset + 7 <= bytes.byteLength) {
      const height = view.getUint16(offset + 3, false)
      const width = view.getUint16(offset + 5, false)
      return { width, height }
    }
    offset += segLen
  }
  return null
}

async function verifyAttachmentPayload(rawAtt, ticketId) {
  if (rawAtt == null) {
    return { ok: true, attachment: null }
  }
  if (typeof rawAtt !== 'object') {
    return { ok: false, error: 'Invalid attachment structure.' }
  }
  const mimeType = rawAtt.mimeType
  if (mimeType !== 'image/png' && mimeType !== 'image/jpeg') {
    return { ok: false, error: 'Only sanitized PNG or JPEG images are accepted.' }
  }

  const bytes = decodeBase64Strict(rawAtt.dataBase64)
  if (!bytes || bytes.byteLength < 32 || bytes.byteLength > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'Invalid or oversized image payload (max 2.5 MB).' }
  }

  if (hasEmbeddedExecutableOrScript(bytes)) {
    return { ok: false, error: 'Blocked unsafe or executable content signature.' }
  }

  const dims = mimeType === 'image/png' ? verifyStrictPngBytes(bytes) : verifyStrictJpegBytes(bytes)
  if (!dims) {
    return {
      ok: false,
      error: 'Corrupted image or trailing polyglot data detected. Only pure PNG/JPEG images are allowed.'
    }
  }

  if (
    dims.width < 8 ||
    dims.height < 8 ||
    dims.width > MAX_IMAGE_DIM ||
    dims.height > MAX_IMAGE_DIM ||
    dims.width * dims.height > MAX_IMAGE_PIXELS
  ) {
    return { ok: false, error: `Image dimensions (${dims.width}x${dims.height}) exceed safe bounds.` }
  }

  const ext = mimeType === 'image/png' ? 'png' : 'jpg'
  const fileName = `screenshot-${ticketId}.${ext}`
  const imgDigest = (await sha256Hex(bytes)).slice(0, 16)

  return {
    ok: true,
    attachment: {
      mimeType,
      bytes,
      fileName,
      imgDigest
    }
  }
}

async function postDiscordTicket(webhookUrl, basePayload, verifiedAttachment) {
  if (!verifiedAttachment) {
    return fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(basePayload)
    })
  }

  const payloadWithAttachment = {
    ...basePayload,
    attachments: [
      {
        id: 0,
        filename: verifiedAttachment.fileName,
        description: 'TennoFrame In-App Support Screenshot'
      }
    ],
    embeds: basePayload.embeds.map((emb, idx) =>
      idx === 0
        ? { ...emb, image: { url: `attachment://${verifiedAttachment.fileName}` } }
        : emb
    )
  }

  const form = new FormData()
  form.append('payload_json', JSON.stringify(payloadWithAttachment))
  form.append(
    'files[0]',
    new Blob([verifiedAttachment.bytes], { type: verifiedAttachment.mimeType }),
    verifiedAttachment.fileName
  )

  return fetch(webhookUrl, {
    method: 'POST',
    body: form
  })
}

function validateWebhookUrl(rawUrl) {
  const parsed = new URL(rawUrl)
  if (parsed.protocol !== 'https:') throw new Error('Webhook must use https://')
  if (!ALLOWED_DISCORD_HOSTS.has(parsed.hostname.toLowerCase())) {
    throw new Error('Invalid Discord host')
  }
  if (!parsed.pathname.startsWith('/api/webhooks/')) {
    throw new Error('Invalid Discord webhook path')
  }
  parsed.searchParams.set('wait', 'true')
  return parsed.toString()
}

async function readQuotaRecord(kv, key, now) {
  if (!kv) return { timestamps: [], lastDigest: '' }
  try {
    const raw = await kv.get(key, 'json')
    if (!raw || !Array.isArray(raw.timestamps)) {
      return { timestamps: [], lastDigest: '' }
    }
    return {
      timestamps: raw.timestamps.filter((t) => typeof t === 'number' && now - t < WINDOW_24H_MS),
      lastDigest: typeof raw.lastDigest === 'string' ? raw.lastDigest : ''
    }
  } catch {
    return { timestamps: [], lastDigest: '' }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const hmacSecret = String(
      env.CHALLENGE_HMAC_SECRET || env.DISCORD_WEBHOOK_BUG || 'tf-fallback-salt'
    ).slice(-32)

    if (request.method === 'GET' && url.pathname === '/health') {
      return jsonResponse(200, {
        ok: true,
        service: 'tennoframe-support-relay',
        antiSpamLayers: 5,
        imageCdrEnabled: true,
        dailyMax: DAILY_MAX,
        kvBound: Boolean(env.SUPPORT_KV),
        channelsConfigured: {
          bug: Boolean(env.DISCORD_WEBHOOK_BUG || env.DISCORD_SUPPORT_WEBHOOK_URL),
          suggestion: Boolean(env.DISCORD_WEBHOOK_SUGGESTION || env.DISCORD_SUPPORT_WEBHOOK_URL),
          help: Boolean(env.DISCORD_WEBHOOK_HELP || env.DISCORD_SUPPORT_WEBHOOK_URL)
        }
      })
    }

    // Layer 3 — Issue single-use HMAC challenge bound to client IP
    if (request.method === 'GET' && url.pathname === '/v1/challenge') {
      const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown'
      const ipHash = (await sha256Hex(`${hmacSecret}:ip:${clientIp}`)).slice(0, 20)
      const issuedAt = Date.now()
      const jti = toHex(crypto.getRandomValues(new Uint8Array(8)))
      const payload = `${jti}.${issuedAt}.${ipHash}`
      const sig = await hmacSignHex(hmacSecret, payload)
      return jsonResponse(200, {
        ok: true,
        challengeToken: `${payload}.${sig}`,
        minDelayMs: CHALLENGE_MIN_AGE_MS
      })
    }

    if (request.method !== 'POST' || url.pathname !== '/v1/ticket') {
      return jsonResponse(404, { ok: false, error: 'Not found' })
    }

    const contentLength = Number(request.headers.get('content-length') || '0')
    if (contentLength > MAX_JSON_BODY_BYTES) {
      return jsonResponse(413, {
        ok: false,
        errorCode: 'INVALID_IMAGE',
        error: 'Payload too large (maximum 2.5 MB image allowed).'
      })
    }

    let rawText
    try {
      rawText = await request.text()
    } catch {
      return jsonResponse(400, { ok: false, errorCode: 'VALIDATION_ERROR', error: 'Unreadable request body' })
    }

    if (rawText.length > MAX_JSON_BODY_BYTES) {
      return jsonResponse(413, {
        ok: false,
        errorCode: 'INVALID_IMAGE',
        error: 'Payload too large (maximum 2.5 MB image allowed).'
      })
    }

    let body
    try {
      body = JSON.parse(rawText)
    } catch {
      return jsonResponse(400, { ok: false, errorCode: 'VALIDATION_ERROR', error: 'Invalid JSON' })
    }

    if (!body?.attachment && rawText.length > MAX_TEXT_ONLY_BYTES) {
      return jsonResponse(413, { ok: false, errorCode: 'VALIDATION_ERROR', error: 'Text payload too large' })
    }

    const category = Object.prototype.hasOwnProperty.call(CATEGORY_META, body?.category)
      ? body.category
      : null
    if (!category) {
      return jsonResponse(400, { ok: false, errorCode: 'VALIDATION_ERROR', error: 'Invalid category' })
    }

    const meta = CATEGORY_META[category]
    const webhookRaw = String(env[meta.secretKey] || env.DISCORD_SUPPORT_WEBHOOK_URL || '').trim()
    if (!webhookRaw) {
      return jsonResponse(503, { ok: false, errorCode: 'NOT_CONFIGURED', error: 'Webhook not configured' })
    }

    const now = Date.now()
    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown'
    const ipHash = (await sha256Hex(`${hmacSecret}:ip:${clientIp}`)).slice(0, 20)
    const rawDevice = sanitizeField(body?.deviceToken, 64) || 'anon'
    const deviceHash = (await sha256Hex(`${hmacSecret}:dev:${rawDevice}`)).slice(0, 20)
    const senderId = `usr_${(await sha256Hex(`${ipHash}:${deviceHash}`)).slice(0, 8)}`

    // Layer 5 — Permanent Ban Check (`ban:usr_xxxxxxxx` or `ban:ip:<ipHash>`)
    if (env.SUPPORT_KV) {
      const [bannedSender, bannedIp] = await Promise.all([
        env.SUPPORT_KV.get(`ban:${senderId}`),
        env.SUPPORT_KV.get(`ban:ip:${ipHash}`)
      ])
      if (bannedSender || bannedIp) {
        return jsonResponse(403, {
          ok: false,
          errorCode: 'BANNED',
          error: 'Support access has been restricted for this installation.'
        })
      }
    }

    // Layer 3 — Verify HMAC Challenge Token, Human Typing Delay & Single-Use Nonce
    const rawChallenge = String(body?.challengeToken || '').trim()
    const parts = rawChallenge.split('.')
    if (parts.length !== 4) {
      return jsonResponse(403, {
        ok: false,
        errorCode: 'VALIDATION_ERROR',
        error: 'Missing or invalid security challenge token.'
      })
    }
    const [jti, issuedAtStr, tokenIpHash, tokenSig] = parts
    const issuedAt = Number(issuedAtStr)
    const expectedSig = await hmacSignHex(hmacSecret, `${jti}.${issuedAtStr}.${tokenIpHash}`)
    if (
      !Number.isFinite(issuedAt) ||
      tokenIpHash !== ipHash ||
      tokenSig !== expectedSig ||
      now - issuedAt < CHALLENGE_MIN_AGE_MS ||
      now - issuedAt > CHALLENGE_MAX_AGE_MS
    ) {
      return jsonResponse(429, {
        ok: false,
        errorCode: 'RATE_LIMITED',
        error: 'Security challenge expired or submitted too fast. Please wait a few seconds and retry.'
      })
    }

    if (env.SUPPORT_KV) {
      const usedNonce = await env.SUPPORT_KV.get(`nonce:${jti}`)
      if (usedNonce) {
        return jsonResponse(429, {
          ok: false,
          errorCode: 'RATE_LIMITED',
          error: 'Challenge token already used.'
        })
      }
    }

    const subject = sanitizeField(body?.subject, 90)
    const message = sanitizeField(body?.message, 1500)
    const contact = sanitizeField(body?.contact, 48)
    const rawId = sanitizeField(body?.ticketId, 16)
    const ticketId = /^TF-[A-F0-9]{4,8}$/i.test(rawId)
      ? rawId.toUpperCase()
      : `TF-${Math.random().toString(16).slice(2, 6).toUpperCase()}`

    if (subject.length < 5 || message.length < 15) {
      return jsonResponse(400, { ok: false, errorCode: 'VALIDATION_ERROR', error: 'Message too short' })
    }

    // Layer 4a — Smart Anti-Garbage & Anti-Promo Filter
    const spamReason = detectSpamContent(subject, message)
    if (spamReason) {
      return jsonResponse(400, {
        ok: false,
        errorCode: 'SPAM_CONTENT',
        error: spamReason
      })
    }

    // Layer 4b — Zero-Trust Binary Image Verification (Header + Trailer + Dimensions + Anti-Polyglot)
    const attCheck = await verifyAttachmentPayload(body?.attachment, ticketId)
    if (!attCheck.ok) {
      return jsonResponse(400, {
        ok: false,
        errorCode: 'INVALID_IMAGE',
        error: attCheck.error
      })
    }
    const verifiedAttachment = attCheck.attachment

    // Layer 2 — Persistent KV Quota (10 min cooldown + Max 3 / 24h + Anti-Duplicate)
    const msgDigest = (
      await sha256Hex(
        `${subject.toLowerCase().trim()}::${message
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .trim()}::${verifiedAttachment ? verifiedAttachment.imgDigest : ''}`
      )
    ).slice(0, 24)

    const [ipQuota, devQuota] = await Promise.all([
      readQuotaRecord(env.SUPPORT_KV, `rl:ip:${ipHash}`, now),
      readQuotaRecord(env.SUPPORT_KV, `rl:dev:${deviceHash}`, now)
    ])

    if (ipQuota.lastDigest === msgDigest || devQuota.lastDigest === msgDigest) {
      return jsonResponse(409, {
        ok: false,
        errorCode: 'DUPLICATE',
        error: 'This exact message was already sent recently.'
      })
    }

    const usedToday = Math.max(ipQuota.timestamps.length, devQuota.timestamps.length)
    if (usedToday >= DAILY_MAX) {
      const oldest = Math.min(ipQuota.timestamps[0] ?? now, devQuota.timestamps[0] ?? now)
      const resetSec = Math.max(60, Math.ceil((oldest + WINDOW_24H_MS - now) / 1000))
      return jsonResponse(429, {
        ok: false,
        errorCode: 'DAILY_LIMIT',
        cooldownRemainingSec: resetSec,
        dailyRemaining: 0,
        error: `Daily limit reached (${DAILY_MAX}/${DAILY_MAX} tickets in 24h).`
      })
    }

    const lastSentAt = Math.max(
      ipQuota.timestamps[ipQuota.timestamps.length - 1] || 0,
      devQuota.timestamps[devQuota.timestamps.length - 1] || 0
    )
    if (now - lastSentAt < COOLDOWN_MS) {
      const waitSec = Math.max(1, Math.ceil((COOLDOWN_MS - (now - lastSentAt)) / 1000))
      return jsonResponse(429, {
        ok: false,
        errorCode: 'COOLDOWN',
        cooldownRemainingSec: waitSec,
        dailyRemaining: Math.max(0, DAILY_MAX - usedToday),
        error: 'Please wait before sending another ticket.'
      })
    }

    const newUsedCount = usedToday + 1
    const dailyRemaining = Math.max(0, DAILY_MAX - newUsedCount)

    const fields = [
      {
        name: '👤 Contact',
        value: contact || '*Anonymous (not provided)*',
        inline: true
      },
      {
        name: '🛡️ Sender & Quota',
        value: `\`${senderId}\` · **${newUsedCount}/${DAILY_MAX}** (24h)`,
        inline: true
      }
    ]

    if (body?.diagnostics && typeof body.diagnostics === 'object') {
      const d = body.diagnostics
      const diagSummary = [
        sanitizeField(d.appVersion, 24),
        sanitizeField(d.os, 24),
        `Lang: ${sanitizeField(d.language, 12)}`,
        `Style: ${sanitizeField(d.visualStyle, 20)}`,
        `Font: ${sanitizeField(d.fontFamily, 20)}`,
        sanitizeField(d.windowMode, 24),
        sanitizeField(d.route, 80)
      ]
        .filter(Boolean)
        .join(' · ')

      if (diagSummary) {
        fields.push({
          name: '⚙ Technical Diagnostics',
          value: `\`${diagSummary.slice(0, 240)}\``,
          inline: false
        })
      }
    }

    const avatarUrl =
      'https://raw.githubusercontent.com/Nyx17n/TennoFrame/main/src/renderer/public/images/logo.png'

    const discordPayload = {
      username: meta.botName,
      avatar_url: avatarUrl,
      allowed_mentions: { parse: [] },
      embeds: [
        {
          author: { name: `${meta.label} · #${ticketId}` },
          title: subject,
          description: message,
          color: meta.color,
          fields,
          footer: {
            text: `TennoFrame Support · #${ticketId} · Sender: ${senderId} · ${newUsedCount}/${DAILY_MAX} today`
          },
          timestamp: new Date().toISOString()
        }
      ]
    }

    const webhookUrl = validateWebhookUrl(webhookRaw)
    let dcRes = await postDiscordTicket(webhookUrl, discordPayload, verifiedAttachment)

    if (!dcRes.ok) {
      const errText = await dcRes.text()
      if (dcRes.status === 400 && errText.includes('220001')) {
        dcRes = await postDiscordTicket(
          webhookUrl,
          {
            ...discordPayload,
            thread_name: `[${meta.forumPrefix} #${ticketId}] ${subject}`.slice(0, 98)
          },
          verifiedAttachment
        )
      }
    }

    if (!dcRes.ok) {
      return jsonResponse(502, {
        ok: false,
        errorCode: 'NETWORK_ERROR',
        error: 'Discord delivery failed'
      })
    }

    // Persist consumed nonce + updated IP & Device 24h quotas in Cloudflare KV
    if (env.SUPPORT_KV) {
      const nextIp = { timestamps: [...ipQuota.timestamps, now], lastDigest: msgDigest }
      const nextDev = { timestamps: [...devQuota.timestamps, now], lastDigest: msgDigest }
      await Promise.all([
        env.SUPPORT_KV.put(`nonce:${jti}`, '1', { expirationTtl: 960 }),
        env.SUPPORT_KV.put(`rl:ip:${ipHash}`, JSON.stringify(nextIp), { expirationTtl: 86400 }),
        env.SUPPORT_KV.put(`rl:dev:${deviceHash}`, JSON.stringify(nextDev), { expirationTtl: 86400 })
      ])
    }

    return jsonResponse(200, {
      ok: true,
      ticketId,
      cooldownRemainingSec: Math.floor(COOLDOWN_MS / 1000),
      dailyRemaining
    })
  }
}
