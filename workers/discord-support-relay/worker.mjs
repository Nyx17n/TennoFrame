/**
 * TennoFrame — Cloudflare Worker Support Relay (100% Free Tier · Zero Dependencies)
 *
 * Security guarantees:
 * 1. Keeps `DISCORD_SUPPORT_WEBHOOK_URL` strictly server-side (never exposed in TennoFrame.exe).
 * 2. Enforces per-IP rate limiting (salted SHA-256 hash — raw IP is never persisted).
 * 3. Hardcodes `allowed_mentions: { parse: [] }` so `@everyone` / `@here` / role pings are impossible.
 * 4. Supports both classic Discord Text channels and Discord Forum channels automatically.
 */

const ALLOWED_DISCORD_HOSTS = new Set([
  'discord.com',
  'discordapp.com',
  'canary.discord.com',
  'ptb.discord.com'
])

const CATEGORY_META = {
  bug: { label: '🐛 BUG REPORT', color: 0xef4444, forumPrefix: 'BUG' },
  feature: { label: '💡 SUGGESTION', color: 0xf59e0b, forumPrefix: 'IDEA' },
  help: { label: '❓ SUPPORT / QUESTION', color: 0x5865f2, forumPrefix: 'HELP' }
}

const ipWindowMap = new Map()
const COOLDOWN_MS = 180_000 // 1 ticket per 3 minutes per IP
const HOURLY_MAX = 4

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  })
}

async function hashClientIp(ip, salt) {
  const data = new TextEncoder().encode(`${salt}:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function checkRateLimit(ipHash) {
  const now = Date.now()
  const hourAgo = now - 3_600_000
  const prev = (ipWindowMap.get(ipHash) || []).filter((ts) => ts > hourAgo)

  const latest = prev[prev.length - 1] || 0
  if (now - latest < COOLDOWN_MS || prev.length >= HOURLY_MAX) {
    ipWindowMap.set(ipHash, prev)
    return false
  }

  prev.push(now)
  ipWindowMap.set(ipHash, prev)
  if (ipWindowMap.size > 5000) {
    const firstKey = ipWindowMap.keys().next().value
    if (firstKey) ipWindowMap.delete(firstKey)
  }
  return true
}

function sanitizeField(str, maxLen) {
  return String(str || '')
    .replace(/\u0000/g, '')
    .replace(/@(everyone|here)/gi, '@\u200b$1')
    .trim()
    .slice(0, maxLen)
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'GET' && url.pathname === '/health') {
      return jsonResponse(200, { ok: true, service: 'tennoframe-support-relay' })
    }

    if (request.method !== 'POST' || url.pathname !== '/v1/ticket') {
      return jsonResponse(404, { ok: false, error: 'Not found' })
    }

    const contentLength = Number(request.headers.get('content-length') || '0')
    if (contentLength > 8192) {
      return jsonResponse(413, { ok: false, error: 'Payload too large' })
    }

    const webhookRaw = String(env.DISCORD_SUPPORT_WEBHOOK_URL || '').trim()
    if (!webhookRaw) {
      return jsonResponse(503, { ok: false, error: 'Support webhook secret not configured' })
    }

    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown'
    const ipHash = await hashClientIp(clientIp, webhookRaw.slice(-16))
    if (!checkRateLimit(ipHash)) {
      return jsonResponse(429, { ok: false, error: 'Too many tickets, please wait a few minutes.' })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return jsonResponse(400, { ok: false, error: 'Invalid JSON' })
    }

    const category = Object.prototype.hasOwnProperty.call(CATEGORY_META, body?.category)
      ? body.category
      : null
    const subject = sanitizeField(body?.subject, 90)
    const message = sanitizeField(body?.message, 1500)
    const contact = sanitizeField(body?.contact, 48)
    const rawId = sanitizeField(body?.ticketId, 16)
    const ticketId = /^TF-[A-F0-9]{4,8}$/i.test(rawId)
      ? rawId.toUpperCase()
      : `TF-${Math.random().toString(16).slice(2, 6).toUpperCase()}`

    if (!category || subject.length < 5 || message.length < 15) {
      return jsonResponse(400, { ok: false, error: 'Validation failed' })
    }

    const meta = CATEGORY_META[category]
    const fields = [
      {
        name: '👤 Contact',
        value: contact || '*Anonyme (non renseigné)*',
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
          name: '⚙ Diagnostic Technique',
          value: `\`${diagSummary.slice(0, 240)}\``,
          inline: false
        })
      }
    }

    const discordPayload = {
      username: 'TennoFrame — Support',
      allowed_mentions: { parse: [] },
      embeds: [
        {
          author: { name: `${meta.label} · #${ticketId}` },
          title: subject,
          description: message,
          color: meta.color,
          fields,
          footer: { text: `TennoFrame In-App Support · ID #${ticketId}` },
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
      // Automatic fallback if the target channel is a Discord Forum channel (code 220001)
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
      return jsonResponse(502, { ok: false, error: 'Discord delivery failed' })
    }

    return jsonResponse(200, { ok: true, ticketId })
  }
}
