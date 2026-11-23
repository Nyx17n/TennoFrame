import * as React from 'react'
import { ArrowUpRight, ChevronDown, Swords } from 'lucide-react'
import type { CodexItemDetail } from '@shared/schemas/codex.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { ChanceBadgeWithUnderBar } from '@/components/codex/ChanceBadgeWithUnderBar'
import { WarframeLocationRich } from '@/components/codex/CodexLocationVisuals'
import { useTabsStore } from '@/stores/useTabsStore'

export function CodexResourceMobsCard({
  detail
}: {
  detail: CodexItemDetail
}): React.JSX.Element | null {
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)
  const [limit, setLimit] = React.useState(8)

  React.useEffect(() => {
    setLimit(8)
  }, [detail.id])

  const mobDrops = detail.resourceMobDrops ?? []
  if (mobDrops.length === 0) {
    return null
  }

  const shown = mobDrops.slice(0, limit)
  const remaining = Math.max(0, mobDrops.length - shown.length)

  return (
    <Card className="space-y-3 border-emerald-500/35 bg-emerald-950/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
          <Swords className="h-3.5 w-3.5" />
          <span>Ennemis & Mobs qui lâchent cette ressource — et où les trouver</span>
        </h2>
        <Badge variant="outline" className="border-emerald-500/40 text-emerald-200">
          {mobDrops.length} mob{mobDrops.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-2">
        {shown.map((mob, idx) => (
          <div
            key={`${mob.mobId ?? mob.nameEn}-${idx}`}
            className="flex flex-col gap-2 rounded-lg border border-border/65 bg-background/65 px-3 py-2.5 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <SafeAssetImage
                  src={mob.imageUrl}
                  alt={mob.nameFr}
                  className="h-8 w-8 shrink-0 rounded border border-border/60 bg-card object-contain p-0.5"
                  fallback={
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border/60 bg-card">
                      <Swords className="h-3.5 w-3.5 text-emerald-300" />
                    </div>
                  }
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-foreground">{mob.nameFr}</span>
                    {mob.nameEn && mob.nameEn !== mob.nameFr && (
                      <span className="text-[10px] text-muted-foreground">({mob.nameEn})</span>
                    )}
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                      {mob.factionLabelFr}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {mob.mobId && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-[10px]"
                    onClick={(e) => {
                      const route = {
                        kind: 'codex-detail' as const,
                        category: 'mobs' as const,
                        slug: mob.mobId!
                      }
                      if (e.ctrlKey || e.metaKey) {
                        openTab(route, { title: `Mob : ${mob.nameFr}` })
                      } else {
                        navigateActive(route, `Mob : ${mob.nameFr}`)
                      }
                    }}
                  >
                    <ArrowUpRight className="h-3 w-3 text-emerald-300" />
                    <span>Fiche Mob</span>
                  </Button>
                )}
                <ChanceBadgeWithUnderBar
                  chancePct={mob.dropChancePct}
                  isGuaranteed={mob.dropChancePct >= 99.9}
                  compact
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 border-t border-border/45 pt-1.5 text-[11px]">
              <span className="font-medium text-emerald-300/90">Où trouver ce mob :</span>
              {mob.spawns.map((sp, spIdx) => (
                <span
                  key={`${sp.locationFr}-${spIdx}`}
                  className="inline-flex flex-wrap items-center gap-1"
                >
                  {spIdx > 0 && <span className="text-muted-foreground">·</span>}
                  <WarframeLocationRich text={sp.locationFr} compact />
                  {sp.spawnChancePct !== null && (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      (Spawn {sp.spawnChancePct}%)
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {remaining > 0 && (
        <div className="flex justify-center pt-1">
          <Button size="sm" variant="outline" onClick={() => setLimit((prev) => prev + 12)}>
            <ChevronDown className="h-3.5 w-3.5 text-emerald-300" />
            <span>
              Afficher plus ({remaining} mob{remaining > 1 ? 's' : ''} restant
              {remaining > 1 ? 's' : ''})
            </span>
          </Button>
        </div>
      )}
    </Card>
  )
}
