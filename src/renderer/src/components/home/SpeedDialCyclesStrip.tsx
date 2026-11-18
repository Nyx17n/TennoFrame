import * as React from 'react'
import { Globe, RefreshCw, WifiOff } from 'lucide-react'
import type { WorldstateHubPayload } from '@shared/schemas/worldstate.schema'
import { Skeleton } from '@/components/ui/skeleton'
import { openHubSection } from '@/lib/hub-navigation'
import type { LayoutErgonomicsStrings } from '@/lib/i18n/layout-ergonomics-i18n'
import { ipcClient } from '@/services/ipc-client'

interface SpeedDialCyclesStripProps {
  readonly strings: LayoutErgonomicsStrings
}

function formatRemainingShort(isoExpiry: string): string {
  const diffSec = Math.max(0, Math.floor((new Date(isoExpiry).getTime() - Date.now()) / 1000))
  const d = Math.floor(diffSec / 86400)
  const h = Math.floor((diffSec % 86400) / 3600)
  const m = Math.floor((diffSec % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${m}m`
}

export function SpeedDialCyclesStrip({ strings }: SpeedDialCyclesStripProps): React.JSX.Element {
  const [payload, setPayload] = React.useState<WorldstateHubPayload | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)

  const loadCycles = React.useCallback(async (force = false): Promise<void> => {
    setIsLoading(true)
    setHasError(false)
    try {
      const data = await ipcClient.worldstate.getCurrent(force)
      setPayload(data)
    } catch {
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadCycles(false)
  }, [loadCycles])

  const shownCycles = React.useMemo(() => {
    if (!payload) return []
    const wanted = new Set(['cetus', 'vallis', 'cambion', 'duviri'])
    return payload.cycles.filter((c) => wanted.has(c.key))
  }, [payload])

  return (
    <div className="wf-glow-surface rounded-lg border border-border/80 bg-card/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Globe className="h-3.5 w-3.5" />
          <span>{strings.speedDialCyclesTitle}</span>
        </span>
        <button
          type="button"
          onClick={() => void loadCycles(true)}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-11 w-full" />
          ))}
        </div>
      ) : hasError || !payload ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          <span className="inline-flex items-center gap-1.5">
            <WifiOff className="h-3.5 w-3.5 text-amber-400" />
            <span>{strings.speedDialCyclesOffline}</span>
          </span>
          <button
            type="button"
            onClick={() => void loadCycles(true)}
            className="rounded border border-amber-400/40 px-2 py-0.5 text-[11px] font-semibold hover:bg-amber-500/20"
          >
            ↻
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {shownCycles.map((cycle) => (
            <button
              key={cycle.key}
              type="button"
              onClick={() => openHubSection(cycle.key === 'duviri' ? 'duviri' : 'planets')}
              className="wf-card-lift flex flex-col justify-between rounded-md border border-border/75 bg-background/60 px-2.5 py-1.5 text-left transition-colors hover:border-primary/50"
            >
              <span className="truncate text-[10px] font-medium text-muted-foreground">
                {cycle.zoneFr}
              </span>
              <div className="flex items-baseline justify-between gap-1">
                <span className="truncate text-xs font-bold text-foreground">
                  {cycle.stateLabelFr}
                </span>
                <span className="font-mono text-[10px] tabular-nums text-primary">
                  {formatRemainingShort(cycle.expiry)}
                </span>
              </div>
            </button>
          ))}

          <button
            type="button"
            onClick={() => openHubSection('baro')}
            className="wf-card-lift flex flex-col justify-between rounded-md border border-border/75 bg-background/60 px-2.5 py-1.5 text-left transition-colors hover:border-primary/50"
          >
            <span className="truncate text-[10px] font-medium text-muted-foreground">
              Baro Ki’Teer
            </span>
            <div className="flex items-baseline justify-between gap-1">
              <span className="truncate text-xs font-bold text-foreground">
                {payload.voidTrader.active ? ' Relay' : '—'}
              </span>
              <span className="font-mono text-[10px] tabular-nums text-primary">
                {formatRemainingShort(
                  payload.voidTrader.active
                    ? payload.voidTrader.expiry
                    : payload.voidTrader.activation
                )}
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
