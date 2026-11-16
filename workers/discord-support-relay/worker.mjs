/**
 * TennoFrame — Cloudflare Worker Support Relay (5-Layer Anti-Spam Edition)
 *
 * 5 Anti-Spam Layers:
 *   1. Persistent Client DPAPI Quota (enforced in TennoFrame Main Process)
 *   2. Persistent Server Quota in Cloudflare KV (`SUPPORT_KV`) by IP Hash + Device Hash (10 min cooldown, max 3 / 24h)
 *   3. Single-Use HMAC-SHA256 Challenge Token (`/v1/challenge`, min 3.5s human write time, replay-protected)
 *   4. Smart Content & Anti-Promo Filter (blocks keyboard smash, duplicate messages, external Discord invites & phishing)
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
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
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

  // 1. Repeated single character smash (e.g. "aaaaaaaaaa", "!!!!!!!!!!")
  if (/(.)\1{7,}/i.test(combined)) {
    return 'Repeated character spam detected.'
  }

  // 2. Minimum meaningful words & distinct letters
  const words = message.split(/\s+/).filter((w) => w.length >= 2)
  const distinctLetters = new Set(message.toLowerCase().replace(/[^a-z\u00c0-\u024f\u0400-\u04ff]/g, ''))
  if (words.length < 3 || (distinctLetters.size > 0 && distinctLetters.size < 4)) {
    return 'Please write a clear, complete sentence (minimum 3 words).'
  }

  // 3. Repeated identical word spam ("test test test test")
  if (/\b(\w{2,})\b(?:\s+\1\b){3,}/i.test(combined)) {
    return 'Repeated word spam detected.'
  }

  // 4. External Discord invite / scam URLs (allow official TennoFrame invite DhGwHPf82n)
  const inviteMatches = combined.match(/(?:discord\.gg|discord(?:app)?\.com\/invite)\/([a-z0-9-]+)/gi) || []
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
    if (contentLength > 8192) {
      return jsonResponse(413, { ok: false, errorCode: 'VALIDATION_ERROR', error: 'Payload too large' })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return jsonResponse(400, { ok: false, errorCode: 'VALIDATION_ERROR', error: 'Invalid JSON' })
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

    // Layer 4 — Smart Anti-Garbage & Anti-Promo Filter
    const spamReason = detectSpamContent(subject, message)
    if (spamReason) {
      return jsonResponse(400, {
        ok: false,
        errorCode: 'SPAM_CONTENT',
        error: spamReason
      })
    }

    // Layer 2 — Persistent KV Quota (10 min cooldown + Max 3 / 24h + Anti-Duplicate)
    const msgDigest = (
      await sha256Hex(`${subject.toLowerCase().trim()}::${message.toLowerCase().replace(/\s+/g, ' ').trim()}`)
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
      const oldest = Math.min(
        ipQuota.timestamps[0] ?? now,
        devQuota.timestamps[0] ?? now
      )
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
    let dcRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    })

    if (!dcRes.ok) {
      const errText = await dcRes.text()
      if (dcRes.status === 400 && errText.includes('220001')) {
        dcRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...discordPayload,
            thread_name: `[${meta.forumPrefix} #${ticketId}] ${subject}`.slice(0, 98)
          })
        })
      }
    }

    if (!dcRes.ok) {
      return jsonResponse(502, { ok: false, errorCode: 'NETWORK_ERROR', error: 'Discord delivery failed' })
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
