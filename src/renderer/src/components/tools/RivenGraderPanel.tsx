import * as React from 'react'
import { Dna, Sparkles } from 'lucide-react'
import {
  evaluateRivenOffline,
  normalizeWfmRivenTypeToFamily,
  RIVEN_ATTRIBUTE_CATALOG
} from '@shared/data/riven-grader-rules'
import type { RivenGradeResult } from '@shared/schemas/pro-tools.schema'
import type { AppLanguage } from '@shared/schemas/settings.schema'
import type { RivenWeaponSummary } from '@shared/schemas/tools.schema'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RivenGraderResultCard } from '@/components/tools/RivenGraderResultCard'
import { getProToolsStrings } from '@/lib/i18n/pro-tools-i18n'
import { ipcClient } from '@/services/ipc-client'

interface StatRowDraft {
  statSlug: string
  valueStr: string
}

export function RivenGraderPanel({
  weaponSlug,
  selectedWeapon,
  lang
}: {
  weaponSlug: string
  selectedWeapon: RivenWeaponSummary | null
  lang: AppLanguage
}): React.JSX.Element {
  const copy = getProToolsStrings(lang)
  const [hasThirdPos, setHasThirdPos] = React.useState(false)
  const [hasNegative, setHasNegative] = React.useState(true)

  const [pos1, setPos1] = React.useState<StatRowDraft>({ statSlug: 'critical_damage', valueStr: '' })
  const [pos2, setPos2] = React.useState<StatRowDraft>({ statSlug: 'multishot', valueStr: '' })
  const [pos3, setPos3] = React.useState<StatRowDraft>({ statSlug: 'critical_chance', valueStr: '' })
  const [neg, setNeg] = React.useState<StatRowDraft>({ statSlug: 'zoom', valueStr: '' })

  const [liveResult, setLiveResult] = React.useState<RivenGradeResult | null>(null)
  const [estimating, setEstimating] = React.useState(false)

  const buildStatInputs = React.useCallback(() => {
    const parseOpt = (s: string): number | null => {
      const trimmed = s.trim()
      if (!trimmed) return null
      const n = Number(trimmed.replace(',', '.'))
      return Number.isFinite(n) ? Math.abs(n) : null
    }
    const list = [
      { statSlug: pos1.statSlug, value: parseOpt(pos1.valueStr), isNegative: false },
      { statSlug: pos2.statSlug, value: parseOpt(pos2.valueStr), isNegative: false }
    ]
    if (hasThirdPos) {
      list.push({ statSlug: pos3.statSlug, value: parseOpt(pos3.valueStr), isNegative: false })
    }
    if (hasNegative) {
      list.push({ statSlug: neg.statSlug, value: parseOpt(neg.valueStr), isNegative: true })
    }
    return list
  }, [pos1, pos2, pos3, neg, hasThirdPos, hasNegative])

  // Instant offline preview whenever inputs change
  const instantResult: RivenGradeResult = React.useMemo(() => {
    const family = normalizeWfmRivenTypeToFamily(selectedWeapon?.rivenType ?? 'rifle')
    const disposition = selectedWeapon?.disposition ?? 1.0
    const stats = buildStatInputs()
    const offline = evaluateRivenOffline({ family, disposition, stats })
    return {
      weaponSlug,
      weaponNameFr: selectedWeapon?.nameFr ?? weaponSlug,
      weaponNameEn: selectedWeapon?.nameEn ?? weaponSlug,
      rivenFamily: family,
      disposition,
      grade: offline.grade,
      score: offline.score,
      avgRollQualityPct: offline.avgRollQualityPct,
      gradedStats: offline.gradedStats,
      summaryReasonsFr: offline.summaryReasonsFr,
      summaryReasonsEn: offline.summaryReasonsEn,
      priceEstimate:
        liveResult && liveResult.weaponSlug === weaponSlug ? liveResult.priceEstimate : null
    }
  }, [weaponSlug, selectedWeapon, buildStatInputs, liveResult])

  const runLivePriceEstimate = async (): Promise<void> => {
    setEstimating(true)
    try {
      const res = await ipcClient.proTools.rivenGrade({
        weaponSlug,
        stats: buildStatInputs(),
        fetchLiveEstimate: true
      })
      setLiveResult(res)
    } finally {
      setEstimating(false)
    }
  }

  const renderStatRow = (
    label: string,
    draft: StatRowDraft,
    onChange: (next: StatRowDraft) => void,
    isNeg = false
  ): React.JSX.Element => (
    <div className="grid grid-cols-[1fr_110px] items-center gap-2">
      <div className="space-y-1">
        <span className={`text-[11px] font-semibold ${isNeg ? 'text-rose-400' : 'text-emerald-400'}`}>
          {label}
        </span>
        <select
          value={draft.statSlug}
          onChange={(e) => onChange({ ...draft, statSlug: e.target.value })}
          className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
        >
          {RIVEN_ATTRIBUTE_CATALOG.map((attr) => (
            <option key={attr.slug} value={attr.slug}>
              {lang === 'fr' ? attr.labelFr : attr.labelEn} ({attr.unit})
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <span className="text-[11px] text-muted-foreground">Valeur Rang 8</span>
        <Input
          value={draft.valueStr}
          onChange={(e) => onChange({ ...draft, valueStr: e.target.value })}
          placeholder="Optionnel"
          className="h-8 text-xs"
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-3">
      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Dna className="h-4 w-4 text-primary" />
            <span>
              Structure du Riven ({hasThirdPos ? '3 Bonus' : '2 Bonus'}{' '}
              {hasNegative ? '+ 1 Malus' : 'sans Malus'})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={hasThirdPos ? 'default' : 'outline'}
              onClick={() => setHasThirdPos((v) => !v)}
            >
              3e Bonus {hasThirdPos ? 'Actif' : 'Non'}
            </Button>
            <Button
              size="sm"
              variant={hasNegative ? 'default' : 'outline'}
              onClick={() => setHasNegative((v) => !v)}
            >
              Malus (Curse) {hasNegative ? 'Actif' : 'Non'}
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {renderStatRow('+ Bonus 1', pos1, setPos1)}
          {renderStatRow('+ Bonus 2', pos2, setPos2)}
          {hasThirdPos && renderStatRow('+ Bonus 3', pos3, setPos3)}
          {hasNegative && renderStatRow('− Malus (Curse)', neg, setNeg, true)}
        </div>

        <div className="flex justify-end pt-1">
          <Button size="sm" disabled={estimating} onClick={() => void runLivePriceEstimate()}>
            <Sparkles className="h-3.5 w-3.5" />
            <span>{estimating ? 'Analyse des enchères WFM…' : copy.rivenEvaluateBtn}</span>
          </Button>
        </div>
      </Card>

      <RivenGraderResultCard result={instantResult} lang={lang} />
    </div>
  )
}
