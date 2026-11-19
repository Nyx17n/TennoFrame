import type { MarketCatalogItem, MarketOrder } from '@shared/schemas/market.schema'
import type {
  ArcaneFlipRow,
  EndoModRow,
  PrimeSetFlipRow,
  ProfitScanRequest,
  ProfitScanResponse
} from '@shared/schemas/pro-tools.schema'
import type { CacheService } from './CacheService'
import type { MarketApiService } from './MarketApiService'
import type { SetCalculatorService } from './SetCalculatorService'

const DEFAULT_ARCANE_SLUGS: readonly string[] = [
  'arcane_energize',
  'molt_augmented',
  'molt_efficiency',
  'arcane_aegis',
  'arcane_fury',
  'arcane_avenger',
  'arcane_strike',
  'arcane_grace',
  'cascadia_flare',
  'eternal_eradicate',
  'primary_merciless',
  'secondary_enervate'
]

const DEFAULT_ENDO_MODS: ReadonlyArray<{
  slug: string
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary'
}> = [
  { slug: 'primed_continuity', rarity: 'Legendary' },
  { slug: 'primed_flow', rarity: 'Legendary' },
  { slug: 'primed_reach', rarity: 'Legendary' },
  { slug: 'primed_pressure_point', rarity: 'Legendary' },
  { slug: 'primed_ravage', rarity: 'Legendary' },
  { slug: 'primed_target_cracker', rarity: 'Legendary' },
  { slug: 'galvanized_chamber', rarity: 'Rare' },
  { slug: 'galvanized_diffusion', rarity: 'Rare' },
  { slug: 'blind_rage', rarity: 'Rare' },
  { slug: 'narrow_minded', rarity: 'Rare' },
  { slug: 'transient_fortitude', rarity: 'Rare' },
  { slug: 'serration', rarity: 'Uncommon' }
]

const DEFAULT_PRIME_SET_SLUGS: readonly string[] = [
  'gauss_prime_set',
  'wisp_prime_set',
  'revenant_prime_set',
  'saryn_prime_set',
  'proteus_prime_set',
  'xaku_prime_set',
  'sevagoth_prime_set'
]

const ENDO_BY_RARITY_R10: Readonly<Record<'Common' | 'Uncommon' | 'Rare' | 'Legendary', number>> = {
  Common: 10_230,
  Uncommon: 20_460,
  Rare: 30_690,
  Legendary: 40_920
}

const CREDITS_BY_RARITY_R10: Readonly<
  Record<'Common' | 'Uncommon' | 'Rare' | 'Legendary', number>
> = {
  Common: 493_096,
  Uncommon: 986_193,
  Rare: 1_479_290,
  Legendary: 1_972_386
}

function getActiveIngameOrOnlineSells(orders: readonly MarketOrder[]): MarketOrder[] {
  const ingame = orders
    .filter((o) => o.type === 'sell' && o.user?.status === 'ingame')
    .sort((a, b) => a.platinum - b.platinum)
  if (ingame.length > 0) return ingame
  return orders
    .filter((o) => o.type === 'sell' && o.user?.status === 'online')
    .sort((a, b) => a.platinum - b.platinum)
}

export class ProfitScannerService {
  private customArcanes: string[] = []
  private customEndoMods: Array<{
    slug: string
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary'
  }> = []
  private customPrimeSets: string[] = []

  constructor(
    private readonly marketApi: MarketApiService,
    private readonly setCalculator: SetCalculatorService,
    private readonly cache: CacheService
  ) {}

  public async scan(input: ProfitScanRequest): Promise<ProfitScanResponse> {
    const cleanCustom = input.customSlug?.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (cleanCustom) {
      if (input.tab === 'arcanes' && !this.customArcanes.includes(cleanCustom)) {
        this.customArcanes = [cleanCustom, ...this.customArcanes].slice(0, 8)
      } else if (
        input.tab === 'endo-mods' &&
        !this.customEndoMods.some((m) => m.slug === cleanCustom)
      ) {
        const inferredRarity: 'Legendary' | 'Rare' =
          cleanCustom.startsWith('primed_') || cleanCustom.startsWith('archon_')
            ? 'Legendary'
            : 'Rare'
        this.customEndoMods = [{ slug: cleanCustom, rarity: inferredRarity }, ...this.customEndoMods].slice(0, 8)
      } else if (input.tab === 'prime-sets') {
        const setSlug = cleanCustom.endsWith('_set') ? cleanCustom : `${cleanCustom}_set`
        if (!this.customPrimeSets.includes(setSlug)) {
          this.customPrimeSets = [setSlug, ...this.customPrimeSets].slice(0, 8)
        }
      }
    }

    const cacheKey = `pro:profit-scan:${input.tab}:${this.customArcanes.join(',')}:${this.customEndoMods.map((m) => m.slug).join(',')}:${this.customPrimeSets.join(',')}`
    if (!input.forceRefresh && !cleanCustom) {
      const cached = this.cache.get<ProfitScanResponse>(cacheKey)
      if (cached) return cached
    }

    const catalog = await this.marketApi.getCatalog(false)
    const catalogBySlug = new Map<string, MarketCatalogItem>(catalog.map((c) => [c.slug, c]))

    let arcanes: ArcaneFlipRow[] = []
    let endoMods: EndoModRow[] = []
    let primeSets: PrimeSetFlipRow[] = []

    if (input.tab === 'arcanes') {
      arcanes = await this.scanArcanes(catalogBySlug, input.forceRefresh)
    } else if (input.tab === 'endo-mods') {
      endoMods = await this.scanEndoMods(catalogBySlug, input.forceRefresh)
    } else {
      primeSets = await this.scanPrimeSets(catalogBySlug, input.forceRefresh)
    }

    const result: ProfitScanResponse = {
      tab: input.tab,
      scannedAtIso: new Date().toISOString(),
      arcanes,
      endoMods,
      primeSets
    }

    this.cache.set(cacheKey, result, 300)
    return result
  }

  private async scanArcanes(
    catalogBySlug: Map<string, MarketCatalogItem>,
    forceRefresh: boolean
  ): Promise<ArcaneFlipRow[]> {
    const slugs = Array.from(new Set([...this.customArcanes, ...DEFAULT_ARCANE_SLUGS])).filter(
      (s) => catalogBySlug.has(s)
    )
    const rows: ArcaneFlipRow[] = []

    for (const slug of slugs) {
      const cat = catalogBySlug.get(slug)
      if (!cat) continue
      const maxRank = cat.maxRank ?? 5
      const unitsNeeded = maxRank === 5 ? 21 : maxRank === 3 ? 10 : maxRank + 1

      try {
        const orders = await this.marketApi.getItemOrders(slug, forceRefresh)
        const activeSells = getActiveIngameOrOnlineSells(orders)
        const r0Sells = activeSells
          .filter((o) => (o.rank ?? 0) === 0)
          .sort((a, b) => a.platinum - b.platinum)
        const rMaxSells = activeSells
          .filter((o) => o.rank === maxRank)
          .sort((a, b) => a.platinum - b.platinum)

        let remaining = unitsNeeded
        let cumulativeCost = 0
        let totalAvailableR0 = 0
        for (const ord of r0Sells) {
          totalAvailableR0 += ord.quantity
          if (remaining > 0) {
            const take = Math.min(remaining, ord.quantity)
            cumulativeCost += take * ord.platinum
            remaining -= take
          }
        }

        const r0MinUnitPrice = r0Sells[0]?.platinum ?? null
        const totalR0BuyCost =
          remaining === 0
            ? cumulativeCost
            : r0MinUnitPrice !== null
              ? cumulativeCost + remaining * r0MinUnitPrice
              : null
        const r5MinSellPrice = rMaxSells[0]?.platinum ?? null
        const netProfitPlat =
          r5MinSellPrice !== null && totalR0BuyCost !== null
            ? r5MinSellPrice - totalR0BuyCost
            : null
        const roiPercent =
          netProfitPlat !== null && totalR0BuyCost && totalR0BuyCost > 0
            ? Math.round((netProfitPlat / totalR0BuyCost) * 100)
            : null

        rows.push({
          slug,
          nameFr: cat.nameFr,
          nameEn: cat.nameEn,
          thumb: cat.thumb,
          maxRank,
          unitsNeeded,
          availableR0Units: totalAvailableR0,
          r0MinUnitPrice,
          totalR0BuyCost,
          r5MinSellPrice,
          r5SellerCount: rMaxSells.length,
          netProfitPlat,
          roiPercent
        })
      } catch {
        // Ignore transient item error to keep table resilient
      }
    }

    return rows.sort((a, b) => (b.netProfitPlat ?? -9999) - (a.netProfitPlat ?? -9999))
  }

  private async scanEndoMods(
    catalogBySlug: Map<string, MarketCatalogItem>,
    forceRefresh: boolean
  ): Promise<EndoModRow[]> {
    const mergedMap = new Map<
      string,
      { slug: string; rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary' }
    >()
    for (const item of [...this.customEndoMods, ...DEFAULT_ENDO_MODS]) {
      if (catalogBySlug.has(item.slug) && !mergedMap.has(item.slug)) {
        mergedMap.set(item.slug, item)
      }
    }

    const rows: EndoModRow[] = []
    for (const entry of mergedMap.values()) {
      const cat = catalogBySlug.get(entry.slug)
      if (!cat) continue
      const maxRank = cat.maxRank ?? 10
      const endoRequired = ENDO_BY_RARITY_R10[entry.rarity]
      const creditsToMax = CREDITS_BY_RARITY_R10[entry.rarity]

      try {
        const orders = await this.marketApi.getItemOrders(entry.slug, forceRefresh)
        const activeSells = getActiveIngameOrOnlineSells(orders)
        const r0Sells = activeSells
          .filter((o) => (o.rank ?? 0) === 0)
          .sort((a, b) => a.platinum - b.platinum)
        const rMaxSells = activeSells
          .filter((o) => o.rank === maxRank)
          .sort((a, b) => a.platinum - b.platinum)

        const r0MinPrice = r0Sells[0]?.platinum ?? null
        const rMaxMinPrice = rMaxSells[0]?.platinum ?? null
        const netGainPlat =
          rMaxMinPrice !== null && r0MinPrice !== null ? rMaxMinPrice - r0MinPrice : null
        const platPerThousandEndo =
          netGainPlat !== null && endoRequired > 0
            ? Number(((netGainPlat / endoRequired) * 1000).toFixed(2))
            : null

        rows.push({
          slug: entry.slug,
          nameFr: cat.nameFr,
          nameEn: cat.nameEn,
          thumb: cat.thumb,
          rarity: entry.rarity,
          maxRank,
          endoRequired,
          creditsToMax,
          r0MinPrice,
          rMaxMinPrice,
          rMaxSellerCount: rMaxSells.length,
          netGainPlat,
          platPerThousandEndo
        })
      } catch {
        // Skip failed item safely
      }
    }

    return rows.sort(
      (a, b) => (b.platPerThousandEndo ?? -9999) - (a.platPerThousandEndo ?? -9999)
    )
  }

  private async scanPrimeSets(
    catalogBySlug: Map<string, MarketCatalogItem>,
    forceRefresh: boolean
  ): Promise<PrimeSetFlipRow[]> {
    const slugs = Array.from(new Set([...this.customPrimeSets, ...DEFAULT_PRIME_SET_SLUGS])).filter(
      (s) => catalogBySlug.has(s)
    )
    const rows: PrimeSetFlipRow[] = []

    for (const setSlug of slugs) {
      const cat = catalogBySlug.get(setSlug)
      if (!cat) continue
      try {
        const analysis = await this.setCalculator.analyzeSetVsParts(setSlug, forceRefresh)
        if (!analysis.hasSetComparison) continue

        const roiPercent =
          analysis.deltaPlatinum !== null &&
          analysis.totalPartsCost !== null &&
          analysis.totalPartsCost > 0
            ? Math.round((analysis.deltaPlatinum / analysis.totalPartsCost) * 100)
            : null

        rows.push({
          setSlug,
          nameFr: cat.nameFr,
          nameEn: cat.nameEn,
          thumb: cat.thumb,
          bestSetPrice: analysis.bestSetPrice,
          partsSumPrice: analysis.totalPartsCost,
          netMarginPlat: analysis.deltaPlatinum,
          roiPercent,
          parts: analysis.parts.map((p) => ({
            slug: p.slug,
            nameFr: p.nameFr,
            nameEn: p.nameEn,
            quantityInSet: p.quantityInSet,
            unitPrice: p.bestUnitPrice
          }))
        })
      } catch {
        // Ignore single set failure
      }
    }

    return rows.sort((a, b) => (b.netMarginPlat ?? -9999) - (a.netMarginPlat ?? -9999))
  }
}
