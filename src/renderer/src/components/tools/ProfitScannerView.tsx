import * as React from 'react'
import { Coins, Layers, Plus, RefreshCw, Sparkles, TrendingUp, Zap } from 'lucide-react'
import type {
  PrimeSetFlipRow,
  ProfitScanResponse,
  ProfitScanTab
} from '@shared/schemas/pro-tools.schema'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArcaneFlipTable,
  EndoModTable,
  PrimeSetFlipTable
} from '@/components/tools/ProfitScannerTables'
import { getProToolsStrings } from '@/lib/i18n/pro-tools-i18n'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { notify } from '@/stores/useNotificationStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function ProfitScannerView(): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const copy = getProToolsStrings(lang)
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const addToCart = useMarketStore((s) => s.addToCart)

  const [activeTab, setActiveTab] = React.useState<ProfitScanTab>('arcanes')
  const [data, setData] = React.useState<ProfitScanResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [minProfit, setMinProfit] = React.useState<number>(0)
  const [customSlug, setCustomSlug] = React.useState('')

  const runScan = React.useCallback(
    async (opts?: { forceRefresh?: boolean; addSlug?: string }) => {
      setLoading(true)
      setErrorMsg(null)
      try {
        const res = await ipcClient.proTools.profitScan({
          tab: activeTab,
          customSlug: opts?.addSlug,
          forceRefresh: Boolean(opts?.forceRefresh)
        })
        setData(res)
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Erreur lors du scan Warframe Market')
      } finally {
        setLoading(false)
      }
    },
    [activeTab]
  )

  React.useEffect(() => {
    void runScan()
  }, [runScan])

  const handleAddCustom = (e: React.FormEvent): void => {
    e.preventDefault()
    const clean = customSlug.trim()
    if (!clean) return
    setCustomSlug('')
    void runScan({ addSlug: clean, forceRefresh: true })
  }

  const handleAddSingleToCart = (slug: string, qty: number, rank?: number): void => {
    void addToCart({ slug, quantity: Math.min(99, qty), desiredRank: rank }).then(() => {
      notify({
        kind: 'success',
        title: 'Ajouté au Panier & Bundler',
        message: `${qty}× ${slug.replace(/_/g, ' ')} prêt pour l’achat groupé.`
      })
    })
  }

  const handleAddPrimePartsToCart = (row: PrimeSetFlipRow): void => {
    void (async () => {
      for (const part of row.parts) {
        await addToCart({ slug: part.slug, quantity: part.quantityInSet })
      }
      notify({
        kind: 'success',
        title: 'Pièces du Set ajoutées au Panier',
        message: `${row.parts.length} références ajoutées. Ouvrez le Panier pour grouper les vendeurs.`
      })
    })()
  }

  const filteredArcanes = (data?.arcanes ?? []).filter((r) => (r.netProfitPlat ?? -9999) >= minProfit)
  const filteredEndo = (data?.endoMods ?? []).filter((r) => (r.netGainPlat ?? -9999) >= minProfit)
  const filteredSets = (data?.primeSets ?? []).filter((r) => (r.netMarginPlat ?? -9999) >= minProfit)

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h1 className="text-sm font-bold">{copy.scannerTitle}</h1>
          </div>
          <p className="text-xs text-muted-foreground">{copy.scannerSubtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigateActive({ kind: 'platinum-ledger' }, copy.navLedger)}
          >
            <Coins className="h-3.5 w-3.5 text-primary" />
            <span>{copy.navLedger}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={() => void runScan({ forceRefresh: true })}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{copy.scanRefreshBtn}</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-card/60 p-1">
          <Button
            size="sm"
            variant={activeTab === 'arcanes' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('arcanes')}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{copy.tabArcanes}</span>
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'endo-mods' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('endo-mods')}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{copy.tabEndoMods}</span>
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'prime-sets' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('prime-sets')}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{copy.tabPrimeSets}</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Profit min :</span>
            <select
              value={minProfit}
              onChange={(e) => setMinProfit(Number(e.target.value))}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground"
            >
              <option value={-500}>Tous</option>
              <option value={0}>≥ 0p</option>
              <option value={15}>≥ +15p</option>
              <option value={30}>≥ +30p</option>
              <option value={50}>≥ +50p</option>
            </select>
          </label>
          <form onSubmit={handleAddCustom} className="flex items-center gap-1.5">
            <Input
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder={copy.customSlugPlaceholder}
              className="h-8 w-52 text-xs"
            />
            <Button type="submit" size="sm" variant="secondary" disabled={loading}>
              <Plus className="h-3.5 w-3.5" />
              <span>{copy.customAddBtn}</span>
            </Button>
          </form>
        </div>
      </div>

      {errorMsg && (
        <Card className="border-destructive/50 p-4 text-xs text-destructive">{errorMsg}</Card>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : activeTab === 'arcanes' ? (
        <ArcaneFlipTable
          rows={filteredArcanes}
          lang={lang}
          onOpenItem={(slug, label) => navigateActive({ kind: 'market-item', slug }, label)}
          onAddCart={handleAddSingleToCart}
        />
      ) : activeTab === 'endo-mods' ? (
        <EndoModTable
          rows={filteredEndo}
          lang={lang}
          onOpenItem={(slug, label) => navigateActive({ kind: 'market-item', slug }, label)}
          onAddCart={handleAddSingleToCart}
        />
      ) : (
        <PrimeSetFlipTable
          rows={filteredSets}
          lang={lang}
          onOpenItem={(slug, label) => navigateActive({ kind: 'market-item', slug }, label)}
          onAddPartsToCart={handleAddPrimePartsToCart}
        />
      )}
    </main>
  )
}
