import * as React from 'react'
import { Search, X } from 'lucide-react'
import { toWfAssetUrl } from '@shared/schemas/market.schema'
import type {
  BuildArcaneCatalogEntry,
  BuildCatalogPayload,
  BuildEquipmentCatalogEntry,
  BuildModCatalogEntry
} from '@shared/schemas/pro-tools.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { normalizeSearchText } from '@/stores/useMarketStore'

export type PickerTarget =
  | { mode: 'equipment' }
  | { mode: 'mod'; targetSlot: 'aura' | 'exilus' | number }
  | { mode: 'arcane'; slotIndex: number }

export function BuildPickerModal({
  target,
  catalog,
  onSelectEquipment,
  onSelectMod,
  onSelectArcane,
  onClose
}: {
  target: PickerTarget
  catalog: BuildCatalogPayload
  onSelectEquipment: (eq: BuildEquipmentCatalogEntry) => void
  onSelectMod: (mod: BuildModCatalogEntry) => void
  onSelectArcane: (arc: BuildArcaneCatalogEntry) => void
  onClose: () => void
}): React.JSX.Element {
  const [query, setQuery] = React.useState('')
  const [eqFilter, setEqFilter] = React.useState<'all' | 'warframes' | 'weapons'>('all')
  const q = normalizeSearchText(query)

  const filteredEquipment = React.useMemo(() => {
    if (target.mode !== 'equipment') return []
    return catalog.equipment
      .filter((eq) => {
        if (eqFilter !== 'all' && eq.category !== eqFilter) return false
        if (!q) return true
        return normalizeSearchText(eq.nameFr).includes(q) || normalizeSearchText(eq.nameEn).includes(q)
      })
      .slice(0, 60)
  }, [target.mode, catalog.equipment, eqFilter, q])

  const filteredMods = React.useMemo(() => {
    if (target.mode !== 'mod') return []
    return catalog.mods
      .filter((m) => {
        if (!q) return true
        return (
          normalizeSearchText(m.nameFr).includes(q) ||
          normalizeSearchText(m.nameEn).includes(q) ||
          normalizeSearchText(m.statsSummary).includes(q) ||
          normalizeSearchText(m.compatName).includes(q)
        )
      })
      .slice(0, 60)
  }, [target.mode, catalog.mods, q])

  const filteredArcanes = React.useMemo(() => {
    if (target.mode !== 'arcane') return []
    return catalog.arcanes
      .filter((a) => {
        if (!q) return true
        return normalizeSearchText(a.nameFr).includes(q) || normalizeSearchText(a.nameEn).includes(q)
      })
      .slice(0, 60)
  }, [target.mode, catalog.arcanes, q])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <Card className="flex max-h-[80vh] w-full max-w-2xl flex-col gap-3 p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">
            {target.mode === 'equipment'
              ? 'Choisir une Warframe ou une Arme'
              : target.mode === 'arcane'
                ? 'Choisir un Arcane'
                : 'Choisir un Mod du Codex'}
          </h2>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-primary" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par nom FR / EN ou statistique…"
              className="pl-8 text-xs"
            />
          </div>
          {target.mode === 'equipment' && (
            <div className="inline-flex gap-1">
              {(['all', 'warframes', 'weapons'] as const).map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={eqFilter === cat ? 'default' : 'outline'}
                  onClick={() => setEqFilter(cat)}
                >
                  {cat === 'all' ? 'Tout' : cat === 'warframes' ? 'Warframes' : 'Armes'}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="grid max-h-[55vh] gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
          {target.mode === 'equipment' &&
            filteredEquipment.map((eq) => (
              <button
                key={`${eq.category}:${eq.id}`}
                type="button"
                onClick={() => onSelectEquipment(eq)}
                className="flex items-center gap-2.5 rounded-md border border-border bg-card/60 p-2 text-left text-xs hover:border-primary/50 hover:bg-secondary/40"
              >
                <SafeAssetImage src={eq.imageUrl} alt={eq.nameFr} className="h-9 w-9 rounded object-contain" />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{eq.nameFr}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {eq.category === 'warframes' ? 'Warframe' : eq.weaponType ?? 'Arme'}
                  </div>
                </div>
              </button>
            ))}

          {target.mode === 'mod' &&
            filteredMods.map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => onSelectMod(mod)}
                className="flex flex-col justify-between gap-1 rounded-md border border-border bg-card/60 p-2 text-left text-xs hover:border-primary/50 hover:bg-secondary/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold">{mod.nameFr}</span>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    Drain {Math.abs(mod.baseDrain) + mod.maxRank} · {mod.polarity}
                  </Badge>
                </div>
                <div className="line-clamp-2 text-[11px] text-muted-foreground">
                  {mod.statsSummary || mod.typeLabel}
                </div>
              </button>
            ))}

          {target.mode === 'arcane' &&
            filteredArcanes.map((arc) => (
              <button
                key={arc.slug}
                type="button"
                onClick={() => onSelectArcane(arc)}
                className="flex items-center gap-2.5 rounded-md border border-border bg-card/60 p-2 text-left text-xs hover:border-primary/50 hover:bg-secondary/40"
              >
                <SafeAssetImage
                  src={toWfAssetUrl(arc.thumb)}
                  alt={arc.nameFr}
                  className="h-8 w-8 rounded object-contain"
                />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{arc.nameFr}</div>
                  <div className="text-[11px] text-muted-foreground">Rang max R{arc.maxRank}</div>
                </div>
              </button>
            ))}
        </div>
      </Card>
    </div>
  )
}
