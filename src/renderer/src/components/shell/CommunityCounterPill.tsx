import * as React from 'react'
import { MessageCircle, RefreshCw, Users, WifiOff } from 'lucide-react'
import { DISCORD_INVITE_URL } from '@shared/constants'
import { getLanguageMeta } from '@shared/data/languages'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { useUiTranslations } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { ipcClient } from '@/services/ipc-client'
import { useCommunityStatsStore } from '@/stores/useCommunityStatsStore'

export interface CommunityCounterPillProps {
  variant: 'titlebar' | 'statusbar'
  isCompact: boolean
}

function formatNumberLocale(value: number, intlLocale: string): string {
  return new Intl.NumberFormat(intlLocale).format(value)
}

function formatCompactCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.0', '')}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace('.0', '')}k`
  return String(value)
}

function formatUpdatedTime(iso: string, intlLocale: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString(intlLocale, { hour: '2-digit', minute: '2-digit' })
}

export function CommunityCounterPill({
  variant,
  isCompact
}: CommunityCounterPillProps): React.JSX.Element {
  const { lang, t } = useUiTranslations()
  const intlLocale = getLanguageMeta(lang).intlLocale
  const stats = useCommunityStatsStore((s) => s.stats)
  const isLoading = useCommunityStatsStore((s) => s.isLoading)
  const isRefreshing = useCommunityStatsStore((s) => s.isRefreshing)
  const error = useCommunityStatsStore((s) => s.error)
  const fetchStats = useCommunityStatsStore((s) => s.fetchStats)
  const ensurePolling = useCommunityStatsStore((s) => s.ensurePolling)

  React.useEffect(() => {
    ensurePolling()
  }, [ensurePolling])

  const installedLabel = stats
    ? isCompact
      ? formatCompactCount(stats.installedUsersCount)
      : formatNumberLocale(stats.installedUsersCount, intlLocale)
    : '1'
  const onlineLabel = stats
    ? isCompact
      ? formatCompactCount(stats.onlineCount)
      : formatNumberLocale(stats.onlineCount, intlLocale)
    : '1'
  const isOffline = Boolean(stats?.fromOfflineCache || error)

  const tooltipText = stats
    ? `${formatNumberLocale(stats.installedUsersCount, intlLocale)} ${t.shell.installedShort} · ${formatNumberLocale(stats.onlineCount, intlLocale)} ${t.shell.onlineShort}`
    : t.shell.communityTitle

  return (
    <Popover>
      <PopoverTrigger asChild>
        {variant === 'titlebar' ? (
          <button
            type="button"
            title={tooltipText}
            aria-label={t.shell.communityTitle}
            className={cn(
              'inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium transition-colors',
              isOffline
                ? 'border-amber-500/40 bg-amber-500/10 text-foreground hover:bg-amber-500/20'
                : 'border-primary/35 bg-primary/10 text-foreground hover:border-primary/60 hover:bg-primary/20'
            )}
          >
            {isLoading && !stats ? (
              <Skeleton className="h-3 w-20 rounded-full" />
            ) : (
              <>
                <Users className="h-3 w-3 shrink-0 text-primary" />
                <span className="font-semibold tabular-nums">
                  {installedLabel}
                  {!isCompact && ` ${t.shell.installedShort}`}
                </span>
                <span className="text-muted-foreground/70">·</span>
                <span
                  className={cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full',
                    isOffline ? 'bg-amber-400' : 'bg-emerald-400'
                  )}
                />
                <span className="tabular-nums text-emerald-300">
                  {onlineLabel}
                  {!isCompact && ` ${t.shell.onlineShort}`}
                </span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            title={tooltipText}
            aria-label={t.shell.communityTitle}
            className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] text-foreground/85 transition-colors hover:bg-secondary/80 hover:text-foreground"
          >
            {isLoading && !stats ? (
              <Skeleton className="h-2.5 w-16 rounded" />
            ) : (
              <>
                <Users className="h-2.5 w-2.5 shrink-0 text-primary" />
                <span className="font-medium tabular-nums">
                  {installedLabel}
                  {!isCompact && ` ${t.shell.installedShort}`}
                </span>
                <span className="text-muted-foreground">·</span>
                <span
                  className={cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full',
                    isOffline ? 'bg-amber-400' : 'bg-emerald-400'
                  )}
                />
                <span className="tabular-nums text-emerald-400">
                  {onlineLabel}
                  {!isCompact && ` ${t.shell.onlineShort}`}
                </span>
              </>
            )}
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side={variant === 'statusbar' ? 'top' : 'bottom'}
        className={cn('space-y-3 p-3.5', isCompact ? 'w-64' : 'w-72')}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              <h4 className="truncate text-xs font-semibold text-foreground">
                {t.shell.communityTitle}
              </h4>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {stats ? formatUpdatedTime(stats.updatedAt, intlLocale) : '...'}
            </p>
          </div>
          <button
            type="button"
            disabled={isRefreshing || isLoading}
            onClick={() => void fetchStats(true)}
            title={t.shell.refresh}
            className="inline-flex h-6 items-center gap-1 rounded border border-border bg-secondary/70 px-2 text-[10px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3 w-3', (isRefreshing || isLoading) && 'animate-spin')} />
            <span>{t.shell.refresh}</span>
          </button>
        </div>

        {isOffline && (
          <div className="flex items-center justify-between gap-2 rounded border border-amber-500/35 bg-amber-500/10 px-2.5 py-1.5 text-[10px] text-amber-200">
            <span className="inline-flex items-center gap-1.5">
              <WifiOff className="h-3 w-3 shrink-0 text-amber-400" />
              <span>{error ? error : t.shell.offlineCache}</span>
            </span>
          </div>
        )}

        {isLoading && !stats ? (
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-14 rounded-md" />
            <Skeleton className="h-14 rounded-md" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-primary/30 bg-primary/10 p-2.5">
              <div className="text-[10px] text-muted-foreground">{t.shell.installedUsers}</div>
              <div className="mt-0.5 text-base font-bold tabular-nums text-foreground">
                {formatNumberLocale(stats.installedUsersCount, intlLocale)}
              </div>
              <div className="text-[9px] text-primary/90">{t.shell.activeBase}</div>
            </div>

            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2.5">
              <div className="text-[10px] text-muted-foreground">{t.shell.onlineLabel}</div>
              <div className="mt-0.5 text-base font-bold tabular-nums text-emerald-300">
                {formatNumberLocale(stats.onlineCount, intlLocale)}
              </div>
              <div className="truncate text-[9px] text-emerald-300/80">
                {stats.discordMemberCount > 0
                  ? `${formatNumberLocale(stats.discordMemberCount, intlLocale)} Discord`
                  : t.shell.onlineShort}
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-end border-t border-border pt-2 text-[10px]">
          <button
            type="button"
            onClick={() => void ipcClient.window.openExternalUrl(DISCORD_INVITE_URL)}
            className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
          >
            <MessageCircle className="h-3 w-3" />
            <span>{t.shell.joinDiscord}</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
