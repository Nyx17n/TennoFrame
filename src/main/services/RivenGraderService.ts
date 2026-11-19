import {
  evaluateRivenOffline,
  normalizeWfmRivenTypeToFamily
} from '@shared/data/riven-grader-rules'
import type { RivenGradeInput, RivenGradeResult } from '@shared/schemas/pro-tools.schema'
import type { RivenAuctionCard } from '@shared/schemas/tools.schema'
import type { CacheService } from './CacheService'
import type { TradingToolsService } from './TradingToolsService'

function computeMedian(values: readonly number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? Math.round(((sorted[mid - 1]! + sorted[mid]!) / 2))
    : sorted[mid]!
}

export class RivenGraderService {
  constructor(
    private readonly tradingTools: TradingToolsService,
    private readonly cache: CacheService
  ) {}

  public async gradeRiven(input: RivenGradeInput): Promise<RivenGradeResult> {
    const weapons = await this.tradingTools.getRivenWeapons()
    const weapon = weapons.find((w) => w.slug === input.weaponSlug)
    const family = normalizeWfmRivenTypeToFamily(weapon?.rivenType ?? 'rifle')
    const disposition = input.dispositionOverride ?? weapon?.disposition ?? 1.0

    const evaluation = evaluateRivenOffline({
      family,
      disposition,
      stats: input.stats
    })

    if (!input.fetchLiveEstimate) {
      return {
        weaponSlug: input.weaponSlug,
        weaponNameFr: weapon?.nameFr ?? input.weaponSlug,
        weaponNameEn: weapon?.nameEn ?? input.weaponSlug,
        rivenFamily: family,
        disposition,
        grade: evaluation.grade,
        score: evaluation.score,
        avgRollQualityPct: evaluation.avgRollQualityPct,
        gradedStats: evaluation.gradedStats,
        summaryReasonsFr: evaluation.summaryReasonsFr,
        summaryReasonsEn: evaluation.summaryReasonsEn,
        priceEstimate: null
      }
    }

    let auctions: RivenAuctionCard[] = []
    const cacheKey = `pro:riven-auctions:${input.weaponSlug}`
    const cachedAuctions = this.cache.get<RivenAuctionCard[]>(cacheKey)
    if (cachedAuctions) {
      auctions = cachedAuctions
    } else {
      try {
        auctions = await this.tradingTools.searchRivens({
          weaponSlug: input.weaponSlug,
          buyoutPolicy: 'direct',
          polarity: 'all',
          sortBy: 'price_asc'
        })
        this.cache.set(cacheKey, auctions, 120)
      } catch {
        auctions = []
      }
    }

    const priced = auctions.filter(
      (a): a is RivenAuctionCard & { buyoutPrice: number } =>
        a.buyoutPrice !== null && a.buyoutPrice > 0
    )

    const anyFloorPlat = priced[0]?.buyoutPrice ?? null
    const unrolled = priced.filter((a) => a.reRolls === 0)
    const unrolledFloorPlat = unrolled[0]?.buyoutPrice ?? anyFloorPlat

    const positiveWanted = new Set(
      input.stats.filter((s) => !s.isNegative).map((s) => s.statSlug)
    )
    const minMatch = Math.min(2, positiveWanted.size)

    const similar = priced.filter((a) => {
      const posMatches = a.attributes.filter(
        (attr) => attr.positive && positiveWanted.has(attr.slug)
      ).length
      return posMatches >= minMatch
    })

    const similarPrices = similar.map((a) => a.buyoutPrice)
    const similarMedianPlat = computeMedian(similarPrices)

    let recommendedRangeMinPlat: number | null = null
    let recommendedRangeMaxPlat: number | null = null

    if (anyFloorPlat !== null) {
      const baseAnchor = similarMedianPlat ?? anyFloorPlat
      const gradeMultipliers: Record<RivenGradeResult['grade'], [number, number]> = {
        'S+': [2.2, 4.0],
        S: [1.5, 2.5],
        A: [1.1, 1.7],
        B: [0.9, 1.25],
        C: [0.85, 1.05],
        Reroll: [0.9, 1.05]
      }
      const [loMult, hiMult] = gradeMultipliers[evaluation.grade]
      const anchor = evaluation.grade === 'Reroll' ? (unrolledFloorPlat ?? anyFloorPlat) : baseAnchor
      recommendedRangeMinPlat = Math.max(anyFloorPlat, Math.round((anchor * loMult) / 5) * 5)
      recommendedRangeMaxPlat = Math.max(
        recommendedRangeMinPlat + 10,
        Math.round((anchor * hiMult) / 5) * 5
      )
    }

    const comparableSource = similar.length > 0 ? similar : priced
    const comparableAuctions = comparableSource.slice(0, 5)

    return {
      weaponSlug: input.weaponSlug,
      weaponNameFr: weapon?.nameFr ?? input.weaponSlug,
      weaponNameEn: weapon?.nameEn ?? input.weaponSlug,
      rivenFamily: family,
      disposition,
      grade: evaluation.grade,
      score: evaluation.score,
      avgRollQualityPct: evaluation.avgRollQualityPct,
      gradedStats: evaluation.gradedStats,
      summaryReasonsFr: evaluation.summaryReasonsFr,
      summaryReasonsEn: evaluation.summaryReasonsEn,
      priceEstimate: {
        activeAuctionCount: priced.length,
        unrolledFloorPlat,
        anyFloorPlat,
        similarMedianPlat,
        recommendedRangeMinPlat,
        recommendedRangeMaxPlat,
        comparableAuctions
      }
    }
  }
}
