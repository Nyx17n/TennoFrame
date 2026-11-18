import { createHash, randomBytes } from 'node:crypto'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { app, safeStorage } from 'electron'
import { z } from 'zod'
import { DEFAULT_SUPPORT_RELAY_URL } from '@shared/constants'
import {
  SUPPORT_COOLDOWN_SECONDS,
  SUPPORT_DAILY_MAX,
  SupportRawAttachmentInputSchema,
  SupportTicketInputSchema,
  type SupportErrorCode,
  type SupportPrepareAttachmentResult,
  type SupportRawAttachmentInput,
  type SupportSanitizedAttachment,
  type SupportStatus,
  type SupportTicketInput,
  type SupportTicketResult
} from '@shared/schemas/support.schema'
import {
  HttpStatusError,
  type RateLimitedHttpClient
} from '../infrastructure/http/RateLimitedHttpClient'
import { sanitizeSupportImageBuffer } from './supportImageSanitizer'
import type { StorageService } from './StorageService'
import type { WindowOverlayService } from './WindowOverlayService'

const WINDOW_24H_MS = 24 * 3_600_000
const CHALLENGE_MAX_AGE_MS = 12 * 60_000

const PersistedSupportQuotaSchema = z.object({
  deviceToken: z.string().min(16).max(64),
  timestamps: z.array(z.number().int().positive()).max(20).default([]),
  lastDigest: z.string().default(''),
  lastTicketId: z.string().nullable().default(null)
})
type PersistedSupportQuota = z.infer<typeof PersistedSupportQuotaSchema>

const ChallengeResponseSchema = z.object({
  ok: z.boolean(),
  challengeToken: z.string().min(16),
  minDelayMs: z.number().int().nonnegative().default(3500)
})

const RelayTicketResponseSchema = z.object({
  ok: z.boolean(),
  ticketId: z.string().min(3).max(32).optional(),
  cooldownRemainingSec: z.number().int().nonnegative().optional(),
  dailyRemaining: z.number().int().min(0).max(SUPPORT_DAILY_MAX).optional()
})

const DISCORD_HOSTS = new Set([
  'discord.com',
  'discordapp.com',
  'canary.discord.com',
  'ptb.discord.com'
])

function resolveConfiguredRelayUrl(): string | null {
  const raw = (
    import.meta.env.MAIN_VITE_SUPPORT_RELAY_URL ||
    process.env.TENNOFRAME_SUPPORT_RELAY_URL ||
    DEFAULT_SUPPORT_RELAY_URL ||
    ''
  ).trim()

  if (!raw) return null

  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'https:') return null
    if (
      DISCORD_HOSTS.has(parsed.hostname.toLowerCase()) &&
      parsed.pathname.startsWith('/api/webhooks/')
    ) {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

function deriveChallengeUrl(ticketRelayUrl: string): string {
  const u = new URL(ticketRelayUrl)
  u.pathname = u.pathname.replace(/\/ticket\/?$/, '/challenge')
  return u.toString()
}

function validateHumanContent(subject: string, message: string): string | null {
  const combined = `${subject} ${message}`
  if (/(.)\1{7,}/i.test(combined)) {
    return 'Repeated character spam is not allowed.'
  }
  const words = message.split(/\s+/).filter((w) => w.length >= 2)
  if (words.length < 3) {
    return 'Please write at least 3 complete words describing your issue.'
  }
  if (/\b(\w{2,})\b(?:\s+\1\b){3,}/i.test(combined)) {
    return 'Repeated word spam is not allowed.'
  }
  const invites = combined.match(/(?:discord\.gg|discord(?:app)?\.com\/invite)\/([a-z0-9-]+)/gi) ?? []
  for (const inv of invites) {
    if (!inv.toLowerCase().endsWith('/dhgwhpf82n')) {
      return 'External Discord server invites are not allowed.'
    }
  }
  if (/free\s+nitro|steamcommunlty|dlscord\.com/i.test(combined)) {
    return 'Suspicious promotional link blocked.'
  }
  if ((combined.match(/https?:\/\//gi) ?? []).length > 2) {
    return 'Maximum 2 URLs allowed per support message.'
  }
  return null
}

function computeMessageDigest(subject: string, message: string, imageHash = ''): string {
  const norm = `${subject.toLowerCase().trim()}::${message.toLowerCase().replace(/\s+/g, ' ').trim()}::${imageHash}`
  return createHash('sha256').update(norm).digest('hex').slice(0, 24)
}

export class SupportService {
  private readonly quotaFilePath: string
  private loaded = false
  private state: PersistedSupportQuota = {
    deviceToken: randomBytes(16).toString('hex'),
    timestamps: [],
    lastDigest: '',
    lastTicketId: null
  }
  private cachedChallenge: { token: string; fetchedAt: number; minDelayMs: number } | null = null

  public constructor(
    private readonly httpClient: RateLimitedHttpClient,
    private readonly storageService: StorageService,
    private readonly windowService: WindowOverlayService,
    userDataPath: string
  ) {
    this.quotaFilePath = join(userDataPath, 'support-quota.bin')
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return
    this.loaded = true
    try {
      const buf = await fs.readFile(this.quotaFilePath)
      const jsonStr = safeStorage.isEncryptionAvailable()
        ? safeStorage.decryptString(buf)
        : buf.toString('utf8')
      const parsed = PersistedSupportQuotaSchema.safeParse(JSON.parse(jsonStr))
      if (parsed.success) {
        this.state = parsed.data
      }
    } catch {
      await this.persistState()
    }
  }

  private async persistState(): Promise<void> {
    try {
      const jsonStr = JSON.stringify(this.state)
      const payload = safeStorage.isEncryptionAvailable()
        ? safeStorage.encryptString(jsonStr)
        : Buffer.from(jsonStr, 'utf8')
      const tmp = `${this.quotaFilePath}.tmp`
      await fs.writeFile(tmp, payload)
      await fs.rename(tmp, this.quotaFilePath)
    } catch {
      // Ignore transient disk lock
    }
  }

  private pruneWindow(now = Date.now()): number[] {
    this.state.timestamps = this.state.timestamps.filter((t) => now - t < WINDOW_24H_MS)
    return this.state.timestamps
  }

  private computeQuotaMetrics(now = Date.now()): {
    cooldownRemainingSec: number
    dailyRemaining: number
  } {
    const active = this.pruneWindow(now)
    const dailyRemaining = Math.max(0, SUPPORT_DAILY_MAX - active.length)
    if (dailyRemaining === 0 && active[0]) {
      const resetSec = Math.max(1, Math.ceil((active[0] + WINDOW_24H_MS - now) / 1000))
      return { cooldownRemainingSec: resetSec, dailyRemaining: 0 }
    }
    const lastSent = active[active.length - 1] ?? 0
    const elapsedSec = Math.floor((now - lastSent) / 1000)
    const cooldownRemainingSec =
      lastSent > 0 && elapsedSec < SUPPORT_COOLDOWN_SECONDS
        ? SUPPORT_COOLDOWN_SECONDS - elapsedSec
        : 0
    return { cooldownRemainingSec, dailyRemaining }
  }

  private async ensureChallengeToken(relayUrl: string): Promise<{ token: string; waitMs: number }> {
    const now = Date.now()
    if (!this.cachedChallenge || now - this.cachedChallenge.fetchedAt > CHALLENGE_MAX_AGE_MS) {
      const challengeRes = await this.httpClient.getJson(
        deriveChallengeUrl(relayUrl),
        ChallengeResponseSchema,
        { bypassRateLimit: true, timeoutMs: 8_000 }
      )
      this.cachedChallenge = {
        token: challengeRes.challengeToken,
        fetchedAt: Date.now(),
        minDelayMs: challengeRes.minDelayMs
      }
    }
    const ageMs = Date.now() - this.cachedChallenge.fetchedAt
    const waitMs = Math.max(0, this.cachedChallenge.minDelayMs + 250 - ageMs)
    return { token: this.cachedChallenge.token, waitMs }
  }

  public async getStatus(): Promise<SupportStatus> {
    await this.ensureLoaded()
    const relayUrl = resolveConfiguredRelayUrl()
    if (relayUrl) {
      void this.ensureChallengeToken(relayUrl).catch(() => undefined)
    }
    const { cooldownRemainingSec, dailyRemaining } = this.computeQuotaMetrics()
    return {
      relayConfigured: relayUrl !== null,
      cooldownRemainingSec,
      dailyRemaining,
      dailyMax: SUPPORT_DAILY_MAX,
      lastTicketId: this.state.lastTicketId
    }
  }

  public prepareAttachment(rawInput: unknown): SupportPrepareAttachmentResult {
    const parsed = SupportRawAttachmentInputSchema.safeParse(rawInput)
    if (!parsed.success) {
      return {
        ok: false,
        errorMessage: parsed.error.issues[0]?.message ?? 'Invalid image file.'
      }
    }
    const _rawData: SupportRawAttachmentInput = parsed.data
    return sanitizeSupportImageBuffer(_rawData.bytes)
  }

  public async sendTicket(rawInput: SupportTicketInput): Promise<SupportTicketResult> {
    await this.ensureLoaded()
    const metrics = this.computeQuotaMetrics()

    const parsed = SupportTicketInputSchema.safeParse(rawInput)
    if (!parsed.success) {
      return {
        ok: false,
        ticketId: null,
        cooldownRemainingSec: metrics.cooldownRemainingSec,
        dailyRemaining: metrics.dailyRemaining,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: parsed.error.issues[0]?.message ?? 'Invalid support ticket'
      }
    }

    if (metrics.dailyRemaining <= 0) {
      return {
        ok: false,
        ticketId: this.state.lastTicketId,
        cooldownRemainingSec: metrics.cooldownRemainingSec,
        dailyRemaining: 0,
        errorCode: 'DAILY_LIMIT',
        errorMessage: `Daily limit reached (${SUPPORT_DAILY_MAX}/${SUPPORT_DAILY_MAX} per 24h).`
      }
    }

    if (metrics.cooldownRemainingSec > 0) {
      return {
        ok: false,
        ticketId: this.state.lastTicketId,
        cooldownRemainingSec: metrics.cooldownRemainingSec,
        dailyRemaining: metrics.dailyRemaining,
        errorCode: 'COOLDOWN'
      }
    }

    const input = parsed.data
    const spamReason = validateHumanContent(input.subject, input.message)
    if (spamReason) {
      return {
        ok: false,
        ticketId: null,
        cooldownRemainingSec: 0,
        dailyRemaining: metrics.dailyRemaining,
        errorCode: 'SPAM_CONTENT',
        errorMessage: spamReason
      }
    }

    let verifiedAttachment: SupportSanitizedAttachment | null = null
    let imageHash = ''
    if (input.attachment) {
      const reSanitized = sanitizeSupportImageBuffer(
        new Uint8Array(Buffer.from(input.attachment.dataBase64, 'base64'))
      )
      if (!reSanitized.ok || !reSanitized.attachment) {
        return {
          ok: false,
          ticketId: null,
          cooldownRemainingSec: 0,
          dailyRemaining: metrics.dailyRemaining,
          errorCode: 'INVALID_IMAGE',
          errorMessage: reSanitized.errorMessage ?? 'Invalid or unsafe image attachment.'
        }
      }
      verifiedAttachment = reSanitized.attachment
      imageHash = createHash('sha256')
        .update(verifiedAttachment.dataBase64)
        .digest('hex')
        .slice(0, 16)
    }

    const digest = computeMessageDigest(input.subject, input.message, imageHash)
    if (this.state.lastDigest && this.state.lastDigest === digest) {
      return {
        ok: false,
        ticketId: null,
        cooldownRemainingSec: 0,
        dailyRemaining: metrics.dailyRemaining,
        errorCode: 'DUPLICATE',
        errorMessage: 'This exact message was already sent.'
      }
    }

    const relayUrl = resolveConfiguredRelayUrl()
    if (!relayUrl) {
      return {
        ok: false,
        ticketId: null,
        cooldownRemainingSec: 0,
        dailyRemaining: metrics.dailyRemaining,
        errorCode: 'NOT_CONFIGURED'
      }
    }

    const clientTicketId = `TF-${randomBytes(2).toString('hex').toUpperCase()}`
    let diagnostics: Record<string, string> | null = null
    if (input.includeDiagnostics) {
      const [settings, winState] = await Promise.all([
        this.storageService.getSettings(),
        this.windowService.getState()
      ])
      diagnostics = {
        appVersion: `v${app.getVersion()}`,
        os: `${process.platform} ${process.arch}`,
        language: settings.market.language,
        visualStyle: settings.appearance.glassModeEnabled
          ? settings.appearance.glassStyle
          : 'opaque',
        fontFamily: settings.appearance.fontFamily,
        windowMode: winState.isCompactMode ? 'Compact (460x660)' : 'Desktop',
        route: input.activeRoute || 'wf://market'
      }
    }

    try {
      const challenge = await this.ensureChallengeToken(relayUrl)
      if (challenge.waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, challenge.waitMs))
      }
      this.cachedChallenge = null

      const response = await this.httpClient.sendJson(
        'POST',
        relayUrl,
        RelayTicketResponseSchema,
        {
          bypassRateLimit: true,
          timeoutMs: verifiedAttachment ? 25_000 : 12_000,
          headers: { 'X-TennoFrame-Client': `TennoFrame/${app.getVersion()}` },
          bodyJson: {
            ticketId: clientTicketId,
            challengeToken: challenge.token,
            deviceToken: this.state.deviceToken,
            category: input.category,
            subject: input.subject,
            message: input.message,
            contact: input.contact || '',
            diagnostics,
            ...(verifiedAttachment
              ? {
                  attachment: {
                    mimeType: verifiedAttachment.mimeType,
                    dataBase64: verifiedAttachment.dataBase64
                  }
                }
              : {})
          }
        }
      )

      if (!response.ok) {
        return {
          ok: false,
          ticketId: null,
          cooldownRemainingSec: 0,
          dailyRemaining: metrics.dailyRemaining,
          errorCode: 'NETWORK_ERROR'
        }
      }

      const finalTicketId = response.ticketId ?? clientTicketId
      this.state.timestamps.push(Date.now())
      this.state.lastDigest = digest
      this.state.lastTicketId = finalTicketId
      await this.persistState()

      const updated = this.computeQuotaMetrics()
      return {
        ok: true,
        ticketId: finalTicketId,
        cooldownRemainingSec: response.cooldownRemainingSec ?? updated.cooldownRemainingSec,
        dailyRemaining: response.dailyRemaining ?? updated.dailyRemaining
      }
    } catch (err) {
      if (err instanceof HttpStatusError) {
        const code: SupportErrorCode =
          err.status === 403
            ? 'BANNED'
            : err.status === 409
              ? 'DUPLICATE'
              : err.status === 400
                ? 'SPAM_CONTENT'
                : err.status === 429
                  ? 'RATE_LIMITED'
                  : 'NETWORK_ERROR'
        return {
          ok: false,
          ticketId: null,
          cooldownRemainingSec: err.status === 429 ? 60 : 0,
          dailyRemaining: metrics.dailyRemaining,
          errorCode: code,
          errorMessage: err.detailMessage || err.message.slice(0, 140)
        }
      }
      return {
        ok: false,
        ticketId: null,
        cooldownRemainingSec: 0,
        dailyRemaining: metrics.dailyRemaining,
        errorCode: 'NETWORK_ERROR',
        errorMessage: err instanceof Error ? err.message.slice(0, 140) : 'Network error'
      }
    }
  }
}
