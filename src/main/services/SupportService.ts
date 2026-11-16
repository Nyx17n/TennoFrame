import { randomBytes } from 'node:crypto'
import { app } from 'electron'
import { z } from 'zod'
import { DEFAULT_SUPPORT_RELAY_URL } from '@shared/constants'
import {
  SUPPORT_COOLDOWN_SECONDS,
  SupportTicketInputSchema,
  type SupportStatus,
  type SupportTicketInput,
  type SupportTicketResult
} from '@shared/schemas/support.schema'
import {
  HttpStatusError,
  type RateLimitedHttpClient
} from '../infrastructure/http/RateLimitedHttpClient'
import type { StorageService } from './StorageService'
import type { WindowOverlayService } from './WindowOverlayService'

const RelaySuccessResponseSchema = z.object({
  ok: z.boolean(),
  ticketId: z.string().min(3).max(32).optional()
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
    if (parsed.protocol !== 'https:') {
      return null
    }
    // Security invariant: NEVER allow a raw Discord Webhook URL inside the desktop client.
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

function generateLocalTicketId(): string {
  return `TF-${randomBytes(2).toString('hex').toUpperCase()}`
}

export class SupportService {
  private nextAllowedAtMs = 0
  private lastTicketId: string | null = null

  public constructor(
    private readonly httpClient: RateLimitedHttpClient,
    private readonly storageService: StorageService,
    private readonly windowService: WindowOverlayService
  ) {}

  public getCooldownRemainingSec(): number {
    const diffMs = this.nextAllowedAtMs - Date.now()
    return diffMs > 0 ? Math.ceil(diffMs / 1000) : 0
  }

  public getStatus(): SupportStatus {
    return {
      relayConfigured: resolveConfiguredRelayUrl() !== null,
      cooldownRemainingSec: this.getCooldownRemainingSec(),
      lastTicketId: this.lastTicketId
    }
  }

  public async sendTicket(rawInput: SupportTicketInput): Promise<SupportTicketResult> {
    const parsed = SupportTicketInputSchema.safeParse(rawInput)
    if (!parsed.success) {
      return {
        ok: false,
        ticketId: null,
        cooldownRemainingSec: this.getCooldownRemainingSec(),
        errorCode: 'VALIDATION_ERROR',
        errorMessage: parsed.error.issues[0]?.message ?? 'Invalid support ticket payload'
      }
    }

    const cooldownSec = this.getCooldownRemainingSec()
    if (cooldownSec > 0) {
      return {
        ok: false,
        ticketId: this.lastTicketId,
        cooldownRemainingSec: cooldownSec,
        errorCode: 'COOLDOWN'
      }
    }

    const relayUrl = resolveConfiguredRelayUrl()
    if (!relayUrl) {
      return {
        ok: false,
        ticketId: null,
        cooldownRemainingSec: 0,
        errorCode: 'NOT_CONFIGURED'
      }
    }

    const input = parsed.data
    const clientTicketId = generateLocalTicketId()

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
      const response = await this.httpClient.sendJson(
        'POST',
        relayUrl,
        RelaySuccessResponseSchema,
        {
          bypassRateLimit: true,
          timeoutMs: 10_000,
          headers: {
            'X-TennoFrame-Client': `TennoFrame/${app.getVersion()}`
          },
          bodyJson: {
            ticketId: clientTicketId,
            category: input.category,
            subject: input.subject,
            message: input.message,
            contact: input.contact || '',
            diagnostics
          }
        }
      )

      if (!response.ok) {
        return {
          ok: false,
          ticketId: null,
          cooldownRemainingSec: 0,
          errorCode: 'NETWORK_ERROR'
        }
      }

      const finalTicketId = response.ticketId ?? clientTicketId
      this.lastTicketId = finalTicketId
      this.nextAllowedAtMs = Date.now() + SUPPORT_COOLDOWN_SECONDS * 1000

      return {
        ok: true,
        ticketId: finalTicketId,
        cooldownRemainingSec: SUPPORT_COOLDOWN_SECONDS
      }
    } catch (err) {
      if (err instanceof HttpStatusError && err.status === 429) {
        this.nextAllowedAtMs = Date.now() + 60_000
        return {
          ok: false,
          ticketId: null,
          cooldownRemainingSec: 60,
          errorCode: 'RATE_LIMITED'
        }
      }
      return {
        ok: false,
        ticketId: null,
        cooldownRemainingSec: 0,
        errorCode: 'NETWORK_ERROR',
        errorMessage: err instanceof Error ? err.message.slice(0, 140) : 'Network error'
      }
    }
  }
}
