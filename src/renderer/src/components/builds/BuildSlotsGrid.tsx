import * as React from 'react'
import { Check, Dna, Flame, Package, Plus, Sparkles, X } from 'lucide-react'
import { toWfAssetUrl } from '@shared/schemas/market.schema'
import type {
  ArchonShardSlot,
  BuildArcaneCatalogEntry,
  BuildArcaneSlot,
  BuildCatalogPayload,
  BuildModCatalogEntry,
  BuildModSlot,
  SavedBuild
} from '@shared/schemas/pro-tools.schema'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import {
  computeSlotDrain,
  POLARITY_CYCLE,
  POLARITY_SHORT_LABEL
} from '@/components/builds/build-capacity-math'
import type { PickerTarget } from '@/components/builds/BuildPickerModal'

const SHARD_COLORS: ReadonlyArray<{ id: ArchonShardSlot['color']; label: string; dotClass: string }> = [
  { id: 'none', label: 'Vide', dotClass: 'bg-muted-foreground/30' },
  { id: 'crimson', label: 'Écarlate (Puissance/Crit)', dotClass: 'bg-rose-500' },
  { id: 'amber', label: 'Ambre (Vitesse Cast/Énergie)', dotClass: 'bg-amber-400' },
  { id: 'azure', label: 'Azur (Énergie/Armure)', dotClass: 'bg-sky-400' },
  { id: 'emerald', label: 'Émeraude (Corrosif/Toxine)', dotClass: 'bg-emerald-400' },
  { id: 'topaz', label: 'Topaze (Rad/Bouclier)', dotClass: 'bg-orange-400' },
  { id: 'violet', label: 'Violet (Crit Mêlée/Élec)', dotClass: 'bg-purple-400' }
]

function rarityBorderClass(rarity: string | undefined): string {
  switch (rarity) {
    case 'Legendary':
      return 'border-purple-400/60 bg-purple-950/25'
    case 'Rare':
      return 'border-amber-400/60 bg-amber-950/25'
    case 'Uncommon':
      return 'border-sky-400/50 bg-sky-950/20'
    default:
      return 'border-border bg-secondary/40'
  }
}

export function BuildSlotsGrid({
  build,
  catalog,
  modById,
  onChange,
  onOpenPicker
}: {
  build: SavedBuild
  catalog: BuildCatalogPayload
  modById: ReadonlyMap<string, BuildModCatalogEntry>
  onChange: (next: SavedBuild) => void
  onOpenPicker: (target: PickerTarget) => void
}): React.JSX.Element {
  const arcaneBySlug = React.useMemo(() => {
    const map = new Map<string, BuildArcaneCatalogEntry>()
    for (const a of catalog.arcanes) map.set(a.slug, a)
    return map
  }, [catalog.arcanes])

  const renderModCard = (
    label: string,
    slot: BuildModSlot,
    isAura: boolean,
    targetKey: 'aura' | 'exilus' | number,
    updateSlot: (patch: Partial<BuildModSlot>) => void
  ): React.JSX.Element => {
    const mod = slot.modId ? modById.get(slot.modId) : undefined
    const drain = computeSlotDrain(mod, slot.formaPolarity, slot.useMaxRank, isAura)

    const cyclePol = (): void => {
      const idx = POLARITY_CYCLE.indexOf(slot.formaPolarity)
      const nextPol = POLARITY_CYCLE[(idx + 1) % POLARITY_CYCLE.length] ?? 'none'
      updateSlot({ formaPolarity: nextPol })
    }

    return (
      <Card className="flex flex-col justify-between gap-2 p-2.5 text-xs">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={cyclePol}
              className="rounded border border-border bg-secondary/50 px-1.5 py-0.5 text-[10px] font-semibold hover:border-primary"
              title="Changer la polarité Forma de cet emplacement"
            >
              {POLARITY_SHORT_LABEL[slot.formaPolarity]}
            </button>
            {mod && (
              <Badge variant="outline" className="text-[10px]">
                {isAura ? `+${Math.abs(drain)}` : drain}
              </Badge>
            )}
          </div>
        </div>

        {mod ? (
          <div className="space-y-2">
            <div className="flex items-start gap-2.5">
              <button
                type="button"
                onClick={() => onOpenPicker({ mode: 'mod', targetSlot: targetKey })}
                className={`shrink-0 overflow-hidden rounded-md border p-0.5 transition-transform hover:scale-105 ${rarityBorderClass(mod.rarity)}`}
                title={`Changer ${mod.nameFr}`}
              >
                <SafeAssetImage
                  src={mod.imageUrl}
                  alt={mod.nameFr}
                  className="h-12 w-10 rounded object-cover"
                  fallback={
                    <div className="flex h-12 w-10 items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  }
                />
              </button>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-start justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => onOpenPicker({ mode: 'mod', targetSlot: targetKey })}
                    className="truncate text-left font-bold hover:text-primary"
                  >
                    {mod.nameFr}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSlot({ modId: null })}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                  {mod.statsSummary.replace(/\\n/g, ' · ')}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <button
                type="button"
                onClick={() => updateSlot({ useMaxRank: !slot.useMaxRank })}
                className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium"
              >
                {slot.useMaxRank ? `Max (R${mod.maxRank})` : 'Rang 0'}
              </button>
              <button
                type="button"
                onClick={() => updateSlot({ owned: !slot.owned })}
                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                  slot.owned ? 'bg-emerald-600/85 text-white' : 'bg-secondary text-muted-foreground'
                }`}
              >
                <Check className="h-2.5 w-2.5" />
                <span>{slot.owned ? 'Possédé' : 'À acheter'}</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpenPicker({ mode: 'mod', targetSlot: targetKey })}
            className="flex h-16 items-center justify-center gap-1 rounded border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Choisir un Mod</span>
          </button>
        )}
      </Card>
    )
  }

  const updateArcane = (idx: number, patch: Partial<BuildArcaneSlot>): void => {
    const nextArcanes = build.arcaneSlots.map((a, i) => (i === idx ? { ...a, ...patch } : a))
    onChange({ ...build, arcaneSlots: nextArcanes })
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {renderModCard(
          build.equipmentCategory === 'warframes' ? 'Emplacement Aura' : 'Posture (Mêlée)',
          build.auraOrStanceSlot,
          true,
          'aura',
          (patch) => onChange({ ...build, auraOrStanceSlot: { ...build.auraOrStanceSlot, ...patch } })
        )}
        {renderModCard('Emplacement Exilus', build.exilusSlot, false, 'exilus', (patch) =>
          onChange({ ...build, exilusSlot: { ...build.exilusSlot, ...patch } })
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {build.mainSlots.map((slot, idx) => (
          <React.Fragment key={idx}>
            {renderModCard(`Slot ${idx + 1}`, slot, false, idx, (patch) =>
              onChange({
                ...build,
                mainSlots: build.mainSlots.map((s, i) => (i === idx ? { ...s, ...patch } : s))
              })
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {build.arcaneSlots.map((arc, idx) => {
          const meta = arc.marketSlug ? arcaneBySlug.get(arc.marketSlug) : undefined
          const arcImg = meta?.imageUrl ?? toWfAssetUrl(meta?.thumb)
          return (
            <Card key={idx} className="flex items-center justify-between gap-3 p-2.5 text-xs">
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                {arc.marketSlug && (
                  <button
                    type="button"
                    onClick={() => onOpenPicker({ mode: 'arcane', slotIndex: idx })}
                    className={`shrink-0 rounded-md border p-1 ${rarityBorderClass(meta?.rarity)}`}
                  >
                    <SafeAssetImage
                      src={arcImg}
                      alt={arc.nameFr || arc.marketSlug}
                      className="h-9 w-9 object-contain"
                      fallback={
                        <div className="flex h-9 w-9 items-center justify-center">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                      }
                    />
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                    Arcane {idx + 1}
                  </div>
                  {arc.marketSlug ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onOpenPicker({ mode: 'arcane', slotIndex: idx })}
                        className="truncate text-left font-bold text-primary hover:underline"
                      >
                        {meta?.nameFr ?? (arc.nameFr || arc.marketSlug)}
                      </button>
                      {meta?.statsSummary && (
                        <p className="line-clamp-1 text-[10px] text-muted-foreground">
                          {meta.statsSummary}
                        </p>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenPicker({ mode: 'arcane', slotIndex: idx })}
                      className="text-muted-foreground hover:text-primary"
                    >
                      + Choisir un Arcane
                    </button>
                  )}
                </div>
              </div>
              {arc.marketSlug && (
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateArcane(idx, { useMaxRank: !arc.useMaxRank })}
                    className="rounded bg-secondary px-1.5 py-0.5 text-[10px]"
                  >
                    {arc.useMaxRank ? `R${meta?.maxRank ?? 5}` : 'R0'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateArcane(idx, { owned: !arc.owned })}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      arc.owned ? 'bg-emerald-600/85 text-white' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {arc.owned ? 'Possédé' : 'À acheter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateArcane(idx, { marketSlug: null, nameFr: '', nameEn: '' })}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {build.equipmentCategory === 'warframes' && (
        <Card className="grid gap-3 p-3 text-xs md:grid-cols-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold">
              <Dna className="h-3.5 w-3.5 text-primary" />
              <span>Infusion Helminth (Compétence Subsumée)</span>
            </div>
            <div className="flex gap-2">
              <select
                value={build.subsumedWarframeId ?? ''}
                onChange={(e) =>
                  onChange({ ...build, subsumedWarframeId: e.target.value || null })
                }
                className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="">Aucune compétence infusée</option>
                {catalog.subsumedAbilities.map((sub) => (
                  <option key={sub.warframeId} value={sub.warframeId}>
                    {sub.abilityNameFr} ({sub.warframeNameFr}){sub.isMeta ? ' ★ Meta' : ''}
                  </option>
                ))}
              </select>
              <select
                value={build.replacedAbilitySlot ?? 4}
                onChange={(e) =>
                  onChange({ ...build, replacedAbilitySlot: Number(e.target.value) })
                }
                className="h-8 w-24 rounded-md border border-input bg-background px-2 text-xs"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    Sur Pouvoir {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold">
              <Flame className="h-3.5 w-3.5 text-primary" />
              <span>5 Fragments d’Archonte (Cliquer pour changer)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 5 }, (_, idx) => {
                const shard = build.archonShards[idx] ?? {
                  color: 'none' as const,
                  tauforged: false,
                  buffLabel: ''
                }
                const meta = SHARD_COLORS.find((c) => c.id === shard.color) ?? SHARD_COLORS[0]!
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const nextIdx =
                        (SHARD_COLORS.findIndex((c) => c.id === shard.color) + 1) %
                        SHARD_COLORS.length
                      const nextColor = SHARD_COLORS[nextIdx]?.id ?? 'none'
                      const padded = Array.from({ length: 5 }, (__, i) =>
                        build.archonShards[i] ?? { color: 'none' as const, tauforged: false, buffLabel: '' }
                      )
                      padded[idx] = { ...shard, color: nextColor }
                      onChange({ ...build, archonShards: padded })
                    }}
                    className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-2 py-1 text-[11px] hover:border-primary"
                    title={meta.label}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${meta.dotClass}`} />
                    <span>#{idx + 1}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
