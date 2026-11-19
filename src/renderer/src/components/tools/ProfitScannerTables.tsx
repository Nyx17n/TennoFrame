import * as React from 'react'
import { ExternalLink, ShoppingCart, Sparkles } from 'lucide-react'
import { pickMarketText } from '@shared/data/languages'
import { toWfAssetUrl } from '@shared/schemas/market.schema'
import type {
  ArcaneFlipRow,
  EndoModRow,
  PrimeSetFlipRow
} from '@shared/schemas/pro-tools.schema'
import type { AppLanguage } from '@shared/schemas/settings.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'

function ProfitBadge({ value, suffix = 'p' }: { value: number | null; suffix?: string }): React.JSX.Element {
  if (value === null) return <span className="text-xs text-muted-foreground">—</span>
  const positive = value > 0
  return (
    <Badge variant={positive ? 'default' : 'secondary'} className={positive ? 'bg-emerald-600/90 text-white' : ''}>
      {positive ? `+${value}` : value}
      {suffix}
    </Badge>
  )
}

export function ArcaneFlipTable({
  rows,
  lang,
  onOpenItem,
  onAddCart
}: {
  rows: readonly ArcaneFlipRow[]
  lang: AppLanguage
  onOpenItem: (slug: string, label: string) => void
  onAddCart: (slug: string, qty: number, rank?: number) => void
}): React.JSX.Element {
  if (rows.length === 0) {
    return (
      <Card className="p-6 text-center text-xs text-muted-foreground">
        Aucun Arcane ne correspond au filtre de profit minimum actuel.
      </Card>
    )
  }

  return (
    <div className="grid gap-2">
      {rows.map((row) => {
        const label = pickMarketText(lang, row.nameFr, row.nameEn)
        const thumb = toWfAssetUrl(row.thumb)
        return (
          <Card
            key={row.slug}
            className="flex flex-wrap items-center justify-between gap-3 p-3 transition-colors hover:border-primary/40"
          >
            <div className="flex min-w-[190px] items-center gap-2.5">
              <SafeAssetImage src={thumb} alt={label} className="h-9 w-9 rounded bg-secondary/50 object-contain p-1" />
              <div>
                <button
                  type="button"
                  onClick={() => onOpenItem(row.slug, label)}
                  className="flex items-center gap-1 text-left text-xs font-semibold hover:text-primary"
                >
                  <span>{label}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </button>
                <p className="text-[11px] text-muted-foreground">
                  {row.unitsNeeded}× R0 dispo : {row.availableR0Units} u. · {row.r5SellerCount} vendeurs R{row.maxRank}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Coût {row.unitsNeeded}× R0</div>
                <div className="font-semibold">
                  {row.totalR0BuyCost !== null ? `${row.totalR0BuyCost}p` : '—'}{' '}
                  {row.r0MinUnitPrice !== null && (
                    <span className="text-[10px] text-muted-foreground">(min {row.r0MinUnitPrice}p/u)</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Revente R{row.maxRank}</div>
                <div className="font-semibold text-primary">
                  {row.r5MinSellPrice !== null ? `${row.r5MinSellPrice}p` : '—'}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <ProfitBadge value={row.netProfitPlat} />
                {row.roiPercent !== null && (
                  <span className="text-[11px] font-medium text-muted-foreground">
                    ({row.roiPercent > 0 ? `+${row.roiPercent}` : row.roiPercent}%)
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddCart(row.slug, row.unitsNeeded, 0)}
                title="Ajouter les unités Rang 0 au Panier & Bundler"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{row.unitsNeeded}× R0</span>
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export function EndoModTable({
  rows,
  lang,
  onOpenItem,
  onAddCart
}: {
  rows: readonly EndoModRow[]
  lang: AppLanguage
  onOpenItem: (slug: string, label: string) => void
  onAddCart: (slug: string, qty: number, rank?: number) => void
}): React.JSX.Element {
  if (rows.length === 0) {
    return (
      <Card className="p-6 text-center text-xs text-muted-foreground">
        Aucun Mod Rang 10 ne correspond au filtre actuel.
      </Card>
    )
  }

  return (
    <div className="grid gap-2">
      {rows.map((row) => {
        const label = pickMarketText(lang, row.nameFr, row.nameEn)
        const thumb = toWfAssetUrl(row.thumb)
        return (
          <Card
            key={row.slug}
            className="flex flex-wrap items-center justify-between gap-3 p-3 transition-colors hover:border-primary/40"
          >
            <div className="flex min-w-[190px] items-center gap-2.5">
              <SafeAssetImage src={thumb} alt={label} className="h-9 w-9 rounded bg-secondary/50 object-contain p-1" />
              <div>
                <button
                  type="button"
                  onClick={() => onOpenItem(row.slug, label)}
                  className="flex items-center gap-1 text-left text-xs font-semibold hover:text-primary"
                >
                  <span>{label}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </button>
                <p className="text-[11px] text-muted-foreground">
                  {row.rarity} · {row.endoRequired.toLocaleString()} Endo · {(row.creditsToMax / 1_000_000).toFixed(2)}M Cr
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Achat R0 → Vente R{row.maxRank}</div>
                <div className="font-semibold">
                  {row.r0MinPrice ?? '—'}p → <span className="text-primary">{row.rMaxMinPrice ?? '—'}p</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ProfitBadge value={row.netGainPlat} />
                {row.platPerThousandEndo !== null && (
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    <Sparkles className="mr-1 h-3 w-3" />
                    {row.platPerThousandEndo}p / 1k Endo
                  </Badge>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => onAddCart(row.slug, 1, 0)}>
                <ShoppingCart className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">R0</span>
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export function PrimeSetFlipTable({
  rows,
  lang,
  onOpenItem,
  onAddPartsToCart
}: {
  rows: readonly PrimeSetFlipRow[]
  lang: AppLanguage
  onOpenItem: (slug: string, label: string) => void
  onAddPartsToCart: (row: PrimeSetFlipRow) => void
}): React.JSX.Element {
  if (rows.length === 0) {
    return (
      <Card className="p-6 text-center text-xs text-muted-foreground">
        Aucun Set Prime rentable trouvé avec le filtre actuel.
      </Card>
    )
  }

  return (
    <div className="grid gap-2">
      {rows.map((row) => {
        const label = pickMarketText(lang, row.nameFr, row.nameEn)
        const thumb = toWfAssetUrl(row.thumb)
        return (
          <Card
            key={row.setSlug}
            className="flex flex-wrap items-center justify-between gap-3 p-3 transition-colors hover:border-primary/40"
          >
            <div className="flex min-w-[200px] items-center gap-2.5">
              <SafeAssetImage src={thumb} alt={label} className="h-9 w-9 rounded bg-secondary/50 object-contain p-1" />
              <div>
                <button
                  type="button"
                  onClick={() => onOpenItem(row.setSlug, label)}
                  className="flex items-center gap-1 text-left text-xs font-semibold hover:text-primary"
                >
                  <span>{label}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </button>
                <p className="text-[11px] text-muted-foreground">
                  {row.parts
                    .map((p) => `${p.quantityInSet > 1 ? `${p.quantityInSet}× ` : ''}${p.unitPrice ?? '?'}p`)
                    .join(' + ')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Somme Pièces → Set</div>
                <div className="font-semibold">
                  {row.partsSumPrice ?? '—'}p → <span className="text-primary">{row.bestSetPrice ?? '—'}p</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <ProfitBadge value={row.netMarginPlat} />
                {row.roiPercent !== null && (
                  <span className="text-[11px] text-muted-foreground">({row.roiPercent}%)</span>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => onAddPartsToCart(row)}>
                <ShoppingCart className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Acheter Pièces</span>
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
