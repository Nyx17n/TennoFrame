import * as React from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  RefreshCw,
  ShieldAlert
} from 'lucide-react'
import { DISCORD_INVITE_URL } from '@shared/constants'
import type { SupportTicketResult } from '@shared/schemas/support.schema'
import { Button } from '@/components/ui/button'
import type { FontAndSupportStrings } from '@/lib/i18n/typography-support-i18n'

interface SupportTicketResultBannerProps {
  readonly result: SupportTicketResult | null
  readonly cooldownSec: number
  readonly dailyRemaining: number
  readonly strings: FontAndSupportStrings
  readonly isSending: boolean
  readonly canRetry: boolean
  readonly onRetry: () => void
  readonly onCopyAndOpenDiscord: () => void
  readonly onOpenDiscordOnly: () => void
}

export function formatCooldown(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return m > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`
}

export function SupportTicketResultBanner({
  result,
  cooldownSec,
  dailyRemaining,
  strings,
  isSending,
  canRetry,
  onRetry,
  onCopyAndOpenDiscord,
  onOpenDiscordOnly
}: SupportTicketResultBannerProps): React.JSX.Element | null {
  if (!result && cooldownSec <= 0 && dailyRemaining > 0) return null

  if (result?.ok) {
    return (
      <div className="space-y-2 rounded-lg border border-emerald-500/45 bg-emerald-500/10 p-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{strings.supportSuccessTitle}</span>
          </span>
          {result.ticketId && (
            <span className="rounded border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-200">
              #{result.ticketId}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-200/85">
          {cooldownSec > 0 && (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {strings.supportCooldownHint} {formatCooldown(cooldownSec)}
              </span>
            </span>
          )}
          <button
            type="button"
            onClick={onOpenDiscordOnly}
            title={DISCORD_INVITE_URL}
            className="inline-flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Discord</span>
          </button>
        </div>
      </div>
    )
  }

  const isAntiSpamRejection =
    result &&
    !result.ok &&
    (result.errorCode === 'SPAM_CONTENT' ||
      result.errorCode === 'DUPLICATE' ||
      result.errorCode === 'BANNED' ||
      result.errorCode === 'DAILY_LIMIT' ||
      result.errorCode === 'COOLDOWN' ||
      result.errorCode === 'RATE_LIMITED')

  if (isAntiSpamRejection) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-red-500/45 bg-red-500/10 p-3 text-xs text-red-200">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
        <div className="space-y-0.5">
          <p className="font-semibold">{strings.supportSpamBlockedTitle}</p>
          <p className="text-[11px] text-red-200/90">
            {result.errorCode === 'DAILY_LIMIT'
              ? strings.supportDailyLimitReached
              : result.errorMessage ?? strings.supportCooldownHint}
          </p>
        </div>
      </div>
    )
  }

  if (result && !result.ok) {
    return (
      <div className="space-y-2.5 rounded-lg border border-amber-500/45 bg-amber-500/10 p-3 text-xs">
        <div className="flex items-start gap-2 text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div className="space-y-1">
            <p className="font-medium">{strings.supportFallbackHint}</p>
            {result.errorMessage && (
              <p className="font-mono text-[10px] text-amber-300/80">{result.errorMessage}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {result.errorCode !== 'NOT_CONFIGURED' && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isSending || !canRetry || cooldownSec > 0 || dailyRemaining <= 0}
              onClick={onRetry}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </Button>
          )}
          <Button type="button" size="sm" onClick={onCopyAndOpenDiscord}>
            <Copy className="h-3.5 w-3.5" />
            <span>{strings.supportCopyOpenDiscordBtn}</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-3 py-2 text-[11px] tabular-nums text-muted-foreground">
      <Clock className="h-3.5 w-3.5 text-primary" />
      <span>
        {dailyRemaining <= 0
          ? `${strings.supportDailyLimitReached} (${formatCooldown(cooldownSec)})`
          : `${strings.supportCooldownHint} ${formatCooldown(cooldownSec)}`}
      </span>
    </div>
  )
}
