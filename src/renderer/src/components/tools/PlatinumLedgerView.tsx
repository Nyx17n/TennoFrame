import * as React from 'react'
import { Coins, Download, Plus, Trash2, TrendingUp } from 'lucide-react'
import type { LedgerEntryType, LedgerState } from '@shared/schemas/pro-tools.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { LedgerAnalyticsWidgets } from '@/components/tools/PlatinumLedgerWidgets'
import { getProToolsStrings } from '@/lib/i18n/pro-tools-i18n'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { notify } from '@/stores/useNotificationStore'
import { useTabsStore } from '@/stores/useTabsStore'

type PeriodFilter = 'today' | '7d' | '30d' | 'all'

export function PlatinumLedgerView(): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const copy = getProToolsStrings(lang)
  const navigateActive = useTabsStore((s) => s.navigateActive)

  const [state, setState] = React.useState<LedgerState | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [period, setPeriod] = React.useState<PeriodFilter>('30d')

  const [entryType, setEntryType] = React.useState<LedgerEntryType>('sell')
  const [itemName, setItemName] = React.useState('')
  const [unitPlat, setUnitPlat] = React.useState('')
  const [quantity, setQuantity] = React.useState('1')
  const [counterparty, setCounterparty] = React.useState('')

  React.useEffect(() => {
    void ipcClient.proTools
      .ledgerGet()
      .then(setState)
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const plat = Number(unitPlat)
    const qty = Math.max(1, Number(quantity) || 1)
    if (!itemName.trim() || !Number.isFinite(plat) || plat < 0) return

    const next = await ipcClient.proTools.ledgerAddEntry({
      type: entryType,
      itemName: itemName.trim(),
      unitPlatinum: Math.round(plat),
      quantity: qty,
      counterparty: counterparty.trim(),
      consumeDailyTrade: true
    })
    setState(next)
    setItemName('')
    setUnitPlat('')
    setQuantity('1')
    setCounterparty('')
    notify({
      kind: 'success',
      title: entryType === 'sell' ? 'Vente enregistrée' : 'Achat enregistré',
      message: `${qty}× ${itemName.trim()} (${Math.round(plat) * qty}p)`
    })
  }

  const filteredEntries = React.useMemo(() => {
    if (!state) return []
    if (period === 'all') return state.entries
    const now = Date.now()
    const cutoffMs =
      period === 'today'
        ? Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`)
        : now - (period === '7d' ? 7 : 30) * 86_400_000
    return state.entries.filter((e) => Date.parse(e.createdAtIso) >= cutoffMs)
  }, [state, period])

  const kpis = React.useMemo(() => {
    let sales = 0
    let purchases = 0
    let bestSale = 0
    for (const e of filteredEntries) {
      if (e.type === 'sell') {
        sales += e.totalPlatinum
        if (e.totalPlatinum > bestSale) bestSale = e.totalPlatinum
      } else {
        purchases += e.totalPlatinum
      }
    }
    return { sales, purchases, net: sales - purchases, bestSale }
  }, [filteredEntries])

  const netAllTime = React.useMemo(() => {
    if (!state) return 0
    return state.entries.reduce(
      (acc, e) => acc + (e.type === 'sell' ? e.totalPlatinum : -e.totalPlatinum),
      0
    )
  }, [state])

  if (loading || !state) {
    return (
      <main className="mx-auto max-w-6xl space-y-4 p-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-44 w-full rounded-lg" />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            <h1 className="text-sm font-bold">{copy.ledgerTitle}</h1>
          </div>
          <p className="text-xs text-muted-foreground">{copy.ledgerSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md border border-border bg-card/60 p-0.5 text-xs">
            {(['today', '7d', '30d', 'all'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded px-2.5 py-1 font-medium ${
                  period === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p === 'today' ? 'Aujourd’hui' : p === '7d' ? '7j' : p === '30d' ? '30j' : 'Tout'}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigateActive({ kind: 'profit-scanner' }, copy.navProfitScanner)}
          >
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span>{copy.navProfitScanner}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              void ipcClient.proTools.ledgerExportCsv().then((ok) => {
                if (ok) notify({ kind: 'success', title: 'Export CSV terminé', message: 'Livre de comptes exporté.' })
              })
            }}
          >
            <Download className="h-3.5 w-3.5" />
            <span>{copy.ledgerExportCsv}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3">
          <div className="text-[11px] text-muted-foreground">{copy.ledgerSales}</div>
          <div className="text-lg font-bold text-emerald-400">+{kpis.sales}p</div>
        </Card>
        <Card className="p-3">
          <div className="text-[11px] text-muted-foreground">{copy.ledgerPurchases}</div>
          <div className="text-lg font-bold text-rose-400">-{kpis.purchases}p</div>
        </Card>
        <Card className="p-3">
          <div className="text-[11px] text-muted-foreground">{copy.ledgerNetProfit}</div>
          <div className={`text-lg font-bold ${kpis.net >= 0 ? 'text-primary' : 'text-rose-400'}`}>
            {kpis.net >= 0 ? `+${kpis.net}` : kpis.net}p
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-[11px] text-muted-foreground">Plus grosse vente</div>
          <div className="text-lg font-bold">+{kpis.bestSale}p</div>
        </Card>
      </div>

      <LedgerAnalyticsWidgets
        state={state}
        netAllTimePlat={netAllTime}
        onUpdateMeta={(patch) => void ipcClient.proTools.ledgerUpdateMeta(patch).then(setState)}
      />

      <Card className="p-3">
        <form onSubmit={(e) => void handleAdd(e)} className="flex flex-wrap items-end gap-2">
          <div className="inline-flex rounded-md border border-border p-0.5">
            <button
              type="button"
              onClick={() => setEntryType('sell')}
              className={`rounded px-2.5 py-1 text-xs font-semibold ${
                entryType === 'sell' ? 'bg-emerald-600 text-white' : 'text-muted-foreground'
              }`}
            >
              + Vente
            </button>
            <button
              type="button"
              onClick={() => setEntryType('buy')}
              className={`rounded px-2.5 py-1 text-xs font-semibold ${
                entryType === 'buy' ? 'bg-rose-600 text-white' : 'text-muted-foreground'
              }`}
            >
              - Achat
            </button>
          </div>
          <Input
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Objet échangé (ex: Gauss Prime Set, Torid Riven…)"
            className="h-8 min-w-[200px] flex-1 text-xs"
          />
          <Input
            type="number"
            min={0}
            value={unitPlat}
            onChange={(e) => setUnitPlat(e.target.value)}
            placeholder="Prix u. (p)"
            className="h-8 w-28 text-xs"
          />
          <Input
            type="number"
            min={1}
            max={999}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Qté"
            className="h-8 w-16 text-xs"
          />
          <Input
            value={counterparty}
            onChange={(e) => setCounterparty(e.target.value)}
            placeholder="Joueur (optionnel)"
            className="h-8 w-36 text-xs"
          />
          <Button type="submit" size="sm">
            <Plus className="h-3.5 w-3.5" />
            <span>Ajouter</span>
          </Button>
        </form>
      </Card>

      {filteredEntries.length === 0 ? (
        <Card className="p-6 text-center text-xs text-muted-foreground">
          Aucune transaction sur cette période. Vos ventes validées via « ✓ Vendu -1 » dans Mon Profil WFM s’ajoutent ici automatiquement !
        </Card>
      ) : (
        <div className="space-y-1.5">
          {filteredEntries.slice(0, 120).map((entry) => (
            <Card key={entry.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <Badge
                  variant={entry.type === 'sell' ? 'default' : 'secondary'}
                  className={entry.type === 'sell' ? 'bg-emerald-600/90 text-white' : 'bg-rose-600/85 text-white'}
                >
                  {entry.type === 'sell' ? 'VENTE' : 'ACHAT'}
                </Badge>
                {entry.source === 'wfm-auto' && (
                  <Badge variant="outline" className="border-primary/40 text-[10px] text-primary">
                    WFM Auto
                  </Badge>
                )}
                <span className="font-semibold">
                  {entry.quantity > 1 ? `${entry.quantity}× ` : ''}
                  {entry.itemNameFr}
                  {entry.rank !== undefined ? ` (R${entry.rank})` : ''}
                </span>
                {entry.counterparty && (
                  <span className="text-muted-foreground">· @{entry.counterparty}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-muted-foreground">
                  {new Date(entry.createdAtIso).toLocaleString()}
                </span>
                <span className={`font-bold ${entry.type === 'sell' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {entry.type === 'sell' ? `+${entry.totalPlatinum}` : `-${entry.totalPlatinum}`}p
                </span>
                <button
                  type="button"
                  onClick={() => void ipcClient.proTools.ledgerDeleteEntry(entry.id).then(setState)}
                  className="text-muted-foreground hover:text-destructive"
                  title="Supprimer cette ligne"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
