import * as React from 'react'
import { Calculator, Clock, Minus, Plus, Target } from 'lucide-react'
import type { LedgerEntry, LedgerState, UpdateLedgerMetaInput } from '@shared/schemas/pro-tools.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const CREDIT_TAX_PRESETS: ReadonlyArray<{ id: string; label: string; unitCredits: number }> = [
  { id: 'legendary', label: 'Mod Accru (Primed) / Arcane Légendaire', unitCredits: 1_000_000 },
  { id: 'rare_prime', label: 'Pièce Prime / Mod Rare / Mod Riven', unitCredits: 8_000 },
  { id: 'uncommon', label: 'Mod Inhabituel / Relique', unitCredits: 4_000 },
  { id: 'common', label: 'Mod Commun / Scène Captura', unitCredits: 2_000 },
  { id: 'plat_rx', label: 'Platinum reçu (500 Cr par Platine)', unitCredits: 500 }
]

export function LedgerAnalyticsWidgets({
  state,
  netAllTimePlat,
  onUpdateMeta
}: {
  state: LedgerState
  netAllTimePlat: number
  onUpdateMeta: (patch: UpdateLedgerMetaInput) => void
}): React.JSX.Element {
  const [goalLabel, setGoalLabel] = React.useState(state.goal.label)
  const [goalTarget, setGoalTarget] = React.useState(String(state.goal.targetPlatinum))
  const [taxPresetId, setTaxPresetId] = React.useState('legendary')
  const [taxQty, setTaxQty] = React.useState(1)
  const [clanTaxPct, setClanTaxPct] = React.useState(0)

  React.useEffect(() => {
    setGoalLabel(state.goal.label)
    setGoalTarget(String(state.goal.targetPlatinum))
  }, [state.goal.label, state.goal.targetPlatinum])

  const maxDailyTrades = Math.max(0, state.masteryRank)
  const remainingTrades = Math.max(0, maxDailyTrades - state.dailyTradesUsed)
  const goalPct = Math.max(
    0,
    Math.min(100, Math.round((Math.max(0, netAllTimePlat) / Math.max(1, state.goal.targetPlatinum)) * 100))
  )

  const selectedTax = CREDIT_TAX_PRESETS.find((p) => p.id === taxPresetId) ?? CREDIT_TAX_PRESETS[0]!
  const baseCredits = selectedTax.unitCredits * Math.max(1, taxQty)
  const totalCreditsWithClan = Math.round(baseCredits * (1 + Math.max(0, clanTaxPct) / 100))

  const dailyBuckets = React.useMemo(() => {
    const days: Array<{ key: string; shortLabel: string; net: number }> = []
    const now = new Date()
    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i))
      const key = d.toISOString().slice(0, 10)
      days.push({ key, shortLabel: key.slice(5), net: 0 })
    }
    const map = new Map(days.map((d) => [d.key, d]))
    for (const e of state.entries as readonly LedgerEntry[]) {
      const dayKey = e.createdAtIso.slice(0, 10)
      const b = map.get(dayKey)
      if (b) {
        b.net += e.type === 'sell' ? e.totalPlatinum : -e.totalPlatinum
      }
    }
    return days
  }, [state.entries])

  const maxAbsDay = Math.max(20, ...dailyBuckets.map((d) => Math.abs(d.net)))

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <Card className="space-y-2.5 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold">Courbe Net 14 Jours (UTC)</span>
          <Badge variant="outline" className="text-[10px]">
            Reset 00:00 UTC
          </Badge>
        </div>
        <div className="flex h-28 items-end gap-1 pt-2">
          {dailyBuckets.map((b) => {
            const pct = Math.max(8, Math.round((Math.abs(b.net) / maxAbsDay) * 100))
            const pos = b.net >= 0
            return (
              <div
                key={b.key}
                title={`${b.key} : ${b.net >= 0 ? `+${b.net}` : b.net}p`}
                className="flex flex-1 flex-col items-center justify-end gap-1"
              >
                <div
                  style={{ height: `${b.net === 0 ? 4 : pct}%` }}
                  className={`w-full rounded-t transition-all ${
                    b.net === 0
                      ? 'bg-muted'
                      : pos
                        ? 'bg-emerald-500/85'
                        : 'bg-rose-500/80'
                  }`}
                />
                <span className="text-[9px] text-muted-foreground">{b.shortLabel.slice(3)}</span>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="space-y-3 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Quotas d’Échanges & Objectif</span>
          </div>
          <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>MR</span>
            <input
              type="number"
              min={2}
              max={35}
              value={state.masteryRank}
              onChange={(e) =>
                onUpdateMeta({ masteryRank: Math.max(2, Math.min(35, Number(e.target.value) || 2)) })
              }
              className="h-6 w-12 rounded border border-input bg-background px-1.5 text-center text-xs text-foreground"
            />
          </label>
        </div>

        <div className="flex items-center justify-between rounded-md bg-secondary/40 px-2.5 py-1.5">
          <div>
            <div className="text-[11px] text-muted-foreground">Échanges restants aujourd’hui</div>
            <div className="text-sm font-bold text-primary">
              {remainingTrades} <span className="text-xs font-normal text-muted-foreground">/ {maxDailyTrades}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0"
              onClick={() =>
                onUpdateMeta({ dailyTradesUsed: Math.max(0, state.dailyTradesUsed - 1) })
              }
              title="Restaurer 1 échange"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0"
              onClick={() =>
                onUpdateMeta({
                  dailyTradesUsed: Math.min(maxDailyTrades, state.dailyTradesUsed + 1)
                })
              }
              title="Consommer 1 échange"
            >
              <Minus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 font-medium">
              <Target className="h-3 w-3 text-primary" />
              {state.goal.label}
            </span>
            <span className="font-semibold">
              {Math.max(0, netAllTimePlat)}p / {state.goal.targetPlatinum}p ({goalPct}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary transition-all" style={{ width: `${goalPct}%` }} />
          </div>
          <div className="flex gap-1.5 pt-0.5">
            <Input
              value={goalLabel}
              onChange={(e) => setGoalLabel(e.target.value)}
              onBlur={() => {
                if (goalLabel.trim()) onUpdateMeta({ goalLabel: goalLabel.trim() })
              }}
              className="h-7 text-[11px]"
              placeholder="Nom de l’objectif"
            />
            <Input
              type="number"
              min={10}
              value={goalTarget}
              onChange={(e) => setGoalTarget(e.target.value)}
              onBlur={() => {
                const n = Number(goalTarget)
                if (Number.isFinite(n) && n >= 10) onUpdateMeta({ goalTargetPlatinum: Math.round(n) })
              }}
              className="h-7 w-24 text-[11px]"
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-2.5 p-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <Calculator className="h-3.5 w-3.5 text-primary" />
          <span>Calculateur Taxe Crédits Dojo</span>
        </div>
        <select
          value={taxPresetId}
          onChange={(e) => setTaxPresetId(e.target.value)}
          className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
        >
          {CREDIT_TAX_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <label className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground">Quantité / Platine</span>
            <Input
              type="number"
              min={1}
              max={9999}
              value={taxQty}
              onChange={(e) => setTaxQty(Math.max(1, Number(e.target.value) || 1))}
              className="h-7 text-xs"
            />
          </label>
          <label className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground">Taxe Clan (%)</span>
            <Input
              type="number"
              min={0}
              max={100}
              value={clanTaxPct}
              onChange={(e) => setClanTaxPct(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              className="h-7 text-xs"
            />
          </label>
        </div>
        <div className="rounded-md bg-secondary/40 px-2.5 py-1.5 text-xs">
          <span className="text-muted-foreground">Crédits requis : </span>
          <span className="font-bold text-amber-400">
            {totalCreditsWithClan.toLocaleString()} Crédits
          </span>
        </div>
      </Card>
    </div>
  )
}
