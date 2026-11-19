import * as React from 'react'
import { Coins, ExternalLink, Pin, RefreshCw, ShoppingCart } from 'lucide-react'
import type {
  BuildModCatalogEntry,
  BuildPriceQuote,
  SavedBuild
} from '@shared/schemas/pro-tools.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ipcClient } from '@/services/ipc-client'
import { useFarmOverlayStore } from '@/stores/useFarmOverlayStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { notify } from '@/stores/useNotificationStore'

export function BuildCostSidebar({
  build,
  modById,
  quote,
  loadingQuote,
  onRunPriceCheck
}: {
  build: SavedBuild
  modById: ReadonlyMap<string, BuildModCatalogEntry>
  quote: BuildPriceQuote | null
  loadingQuote: boolean
  onRunPriceCheck: (forceRefresh?: boolean) => void
}): React.JSX.Element {
  const addToCart = useMarketStore((s) => s.addToCart)
  const toggleOverlayEntry = useFarmOverlayStore((s) => s.toggleEntry)

  const handleAddMissingToCart = async (): Promise<void> => {
    if (!quote) return
    const missing = quote.lines.filter((l) => !l.owned && l.marketSlug)
    for (const item of missing) {
      await addToCart({
        slug: item.marketSlug!,
        quantity: 1,
        desiredRank: Math.min(10, item.targetRank)
      })
    }
    notify({
      kind: 'success',
      title: 'Manquants envoyés au Panier',
      message: `${missing.length} Mods/Arcanes ajoutés au Bundler Warframe Market.`
    })
  }

  const handlePinMissingModsToOverlay = async (): Promise<void> => {
    const allSlots = [build.auraOrStanceSlot, build.exilusSlot, ...build.mainSlots]
    let pinnedCount = 0
    for (const slot of allSlots) {
      if (!slot.modId || slot.owned) continue
      const mod = modById.get(slot.modId)
      if (!mod || mod.topSources.length === 0) continue
      await toggleOverlayEntry(
        {
          entryId: `mods:${mod.id}:main`,
          itemKey: `mods:${mod.id}`,
          category: 'mods',
          itemId: mod.id,
          itemNameFr: mod.nameFr,
          partKey: null,
          labelFr: mod.nameFr,
          groupLabelFr: `Build · ${build.equipmentNameFr}`,
          imageUrl: mod.imageUrl,
          isResource: false,
          requiredCount: 1,
          obtained: false,
          sources: mod.topSources
        },
        true
      )
      pinnedCount += 1
    }
    notify({
      kind: 'info',
      title: 'Épinglé sur l’Overlay Farm (Alt+O)',
      message:
        pinnedCount > 0
          ? `${pinnedCount} Mod(s) manquants ajoutés à votre HUD en jeu.`
          : 'Tous les Mods équipés sont déjà cochés ou sans source Codex.'
    })
  }

  return (
    <Card className="space-y-3 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <Coins className="h-4 w-4 text-primary" />
          <span>Coût Platinum Live (WFM)</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={loadingQuote}
          onClick={() => onRunPriceCheck(true)}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingQuote ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </Button>
      </div>

      {quote ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-secondary/40 p-2">
              <div className="text-[10px] uppercase text-muted-foreground">Valeur Totale</div>
              <div className="text-sm font-bold">{quote.totalPlatAllItems}p</div>
            </div>
            <div className="rounded-md border border-primary/30 bg-primary/10 p-2">
              <div className="text-[10px] uppercase text-muted-foreground">Reste à Acheter</div>
              <div className="text-sm font-extrabold text-primary">{quote.remainingPlatToBuy}p</div>
            </div>
          </div>

          <div className="max-h-56 space-y-1 overflow-y-auto pr-1 text-xs">
            {quote.lines.map((ln) => (
              <div
                key={ln.key}
                className={`flex items-center justify-between gap-2 rounded px-2 py-1 ${
                  ln.owned ? 'opacity-50 line-through' : 'bg-secondary/25'
                }`}
              >
                <span className="truncate">
                  {ln.nameFr} <span className="text-[10px] text-muted-foreground">(R{ln.targetRank})</span>
                </span>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {ln.unitPlat !== null ? `${ln.unitPlat}p` : ln.tradable ? '—' : 'Non échangeable'}
                </Badge>
              </div>
            ))}
          </div>

          <div className="grid gap-1.5 pt-1">
            <Button size="sm" onClick={() => void handleAddMissingToCart()}>
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Acheter les manquants (Bundler)</span>
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void handlePinMissingModsToOverlay()}>
              <Pin className="h-3.5 w-3.5 text-primary" />
              <span>Farmer les Mods (Overlay Alt+O)</span>
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>
            Cochez « Possédé » sur vos Mods/Arcanes déjà acquis, puis lancez le chiffrage temps réel sur Warframe Market.
          </p>
          <Button size="sm" className="w-full" disabled={loadingQuote} onClick={() => onRunPriceCheck(false)}>
            <Coins className="h-3.5 w-3.5" />
            <span>{loadingQuote ? 'Chiffrage WFM en cours…' : 'Calculer le Coût Platinum Live'}</span>
          </Button>
        </div>
      )}

      <div className="border-t border-border pt-2">
        <Button
          size="sm"
          variant="ghost"
          className="w-full justify-between text-xs text-muted-foreground"
          onClick={() =>
            void ipcClient.window.openExternalUrl('https://overframe.gg/')
          }
        >
          <span>Consulter les classements Overframe.gg</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  )
}
