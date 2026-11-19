import * as React from 'react'
import { Sparkles, TrendingUp } from 'lucide-react'
import type { CodexItemDetail } from '@shared/schemas/codex.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CodexDropsAndCraftSection } from '@/components/codex/CodexDropsAndCraftSection'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function CodexArcaneDetailSection({
  detail
}: {
  detail: CodexItemDetail
}): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const info = detail.arcaneInfo

  if (!info) {
    return <CodexDropsAndCraftSection detail={detail} />
  }

  const levels =
    lang === 'fr' && info.levelStatsFr.length > 0
      ? info.levelStatsFr
      : info.levelStatsEn.length > 0
        ? info.levelStatsEn
        : info.levelStatsFr

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Progression des Rangs (R0 → R{info.maxRank})
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/40 text-primary">
              {info.copiesForMaxRank}× Rang 0 = 1× Rang {info.maxRank}
            </Badge>
            {detail.isTradable && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigateActive({ kind: 'profit-scanner' }, 'Scanner de Profits')}
              >
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span>Comparer Fusion R0 → R{info.maxRank}</span>
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-1.5">
          {levels.map((statText, rankIdx) => {
            const isMax = rankIdx === levels.length - 1
            return (
              <div
                key={rankIdx}
                className={`flex items-start gap-3 rounded-md border px-3 py-2 text-xs ${
                  isMax
                    ? 'border-primary/50 bg-primary/10 font-medium text-foreground'
                    : 'border-border/60 bg-background/40 text-muted-foreground'
                }`}
              >
                <Badge
                  variant={isMax ? 'default' : 'outline'}
                  className="mt-0.5 shrink-0 font-mono text-[10px]"
                >
                  Rang {rankIdx}
                </Badge>
                <span className="leading-relaxed">{statText}</span>
              </div>
            )
          })}
        </div>

        {info.vosforHintFr && (
          <div className="rounded-md border border-border/60 bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
            <strong className="text-foreground">Dissolution Vosfor :</strong> {info.vosforHintFr}
          </div>
        )}
      </Card>

      <CodexDropsAndCraftSection detail={detail} />
    </div>
  )
}
