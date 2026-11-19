import * as React from 'react'
import { Coins, Sparkles } from 'lucide-react'
import type { RivenGradeResult } from '@shared/schemas/pro-tools.schema'
import type { AppLanguage } from '@shared/schemas/settings.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useMarketStore } from '@/stores/useMarketStore'

const GRADE_STYLE_MAP: Readonly<Record<RivenGradeResult['grade'], string>> = {
  'S+': 'bg-amber-500 text-black border-amber-300',
  S: 'bg-emerald-500 text-black border-emerald-300',
  A: 'bg-sky-500 text-black border-sky-300',
  B: 'bg-violet-500 text-white border-violet-400',
  C: 'bg-zinc-600 text-white border-zinc-500',
  Reroll: 'bg-rose-600 text-white border-rose-400'
}

export function RivenGraderResultCard({
  result,
  lang
}: {
  result: RivenGradeResult
  lang: AppLanguage
}): React.JSX.Element {
  const triggerWhisper = useMarketStore((s) => s.triggerWhisper)
  const reasons = lang === 'fr' ? result.summaryReasonsFr : result.summaryReasonsEn

  return (
    <div className="space-y-3">
      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 text-xl font-black shadow ${GRADE_STYLE_MAP[result.grade]}`}
            >
              {result.grade}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">
                  {lang === 'fr' ? result.weaponNameFr : result.weaponNameEn}
                </span>
                <Badge variant="outline">Dispo {result.disposition.toFixed(2)}×</Badge>
                <Badge variant="secondary">Score {result.score}/100</Badge>
                {result.avgRollQualityPct !== null && (
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    Roll {result.avgRollQualityPct}%
                  </Badge>
                )}
              </div>
              <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                {reasons.map((r, idx) => (
                  <li key={idx}>• {r}</li>
                ))}
              </ul>
            </div>
          </div>

          {result.priceEstimate && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-2 text-right">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Fourchette Recommandée
              </div>
              <div className="text-base font-extrabold text-primary">
                {result.priceEstimate.recommendedRangeMinPlat !== null &&
                result.priceEstimate.recommendedRangeMaxPlat !== null
                  ? `${result.priceEstimate.recommendedRangeMinPlat}p – ${result.priceEstimate.recommendedRangeMaxPlat}p`
                  : 'Données enchères insuffisantes'}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Plancher Unrolled : {result.priceEstimate.unrolledFloorPlat ?? '—'}p · Médiane Similaire :{' '}
                {result.priceEstimate.similarMedianPlat ?? '—'}p
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {result.gradedStats.map((st, idx) => (
            <div
              key={`${st.statSlug}-${idx}`}
              className={`rounded-md border p-2.5 text-xs ${
                st.isNegative ? 'border-rose-500/30 bg-rose-500/5' : 'border-border bg-secondary/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">
                  {st.isNegative ? '− ' : '+ '}
                  {lang === 'fr' ? st.labelFr : st.labelEn}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {st.tierBadge}
                </Badge>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  Plage Rang 8 : [{st.minAbs}
                  {st.unit} … {st.maxAbs}
                  {st.unit}]
                </span>
                {st.rollQualityPct !== null && (
                  <span className="font-semibold text-primary">Qualité : {st.rollQualityPct}%</span>
                )}
              </div>
              {st.rollQualityPct !== null && (
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${st.rollQualityPct}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {result.priceEstimate && result.priceEstimate.comparableAuctions.length > 0 && (
        <Card className="space-y-2 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Contrats WFM comparables en direct ({result.priceEstimate.activeAuctionCount} actifs)</span>
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {result.priceEstimate.comparableAuctions.map((auc) => (
              <div
                key={auc.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-card/50 px-2.5 py-1.5 text-xs"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold">
                    {auc.weaponNameFr} {auc.rivenName} · <span className="text-muted-foreground">{auc.reRolls} rolls</span>
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {auc.attributes
                      .map((a) => `${a.positive ? '+' : '-'}${Math.abs(a.value)} ${a.labelFr}`)
                      .join(' · ')}
                  </div>
                </div>
                {auc.buyoutPrice !== null && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() =>
                      void triggerWhisper({
                        ingameName: auc.owner.ingameName,
                        itemNameEn: `${auc.weaponNameEn} ${auc.rivenName} (Riven)`,
                        itemNameFr: `${auc.weaponNameFr} ${auc.rivenName} (Riven)`,
                        platinum: auc.buyoutPrice!
                      })
                    }
                  >
                    <Coins className="h-3 w-3 text-primary" />
                    <span>{auc.buyoutPrice}p</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
