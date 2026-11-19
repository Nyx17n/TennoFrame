import { z } from 'zod'
import { CodexOverlayPinnedSourceSchema } from './extensions.schema'
import { RivenAuctionCardSchema } from './tools.schema'

/* ============================================================================
 * 1. MODULE 24 — PLATINUM PROFIT SCANNER (wf://market/profit-scanner)
 * ============================================================================ */

export const ProfitScanTabSchema = z.enum(['arcanes', 'endo-mods', 'prime-sets'])
export type ProfitScanTab = z.infer<typeof ProfitScanTabSchema>

export const ProfitScanRequestSchema = z.object({
  tab: ProfitScanTabSchema,
  customSlug: z.string().max(120).optional(),
  forceRefresh: z.boolean().default(false)
})
export type ProfitScanRequest = z.infer<typeof ProfitScanRequestSchema>

export const ArcaneFlipRowSchema = z.object({
  slug: z.string().min(1),
  nameFr: z.string(),
  nameEn: z.string(),
  thumb: z.string().nullable(),
  maxRank: z.number().int().positive(),
  unitsNeeded: z.number().int().positive(),
  availableR0Units: z.number().int().nonnegative(),
  r0MinUnitPrice: z.number().nonnegative().nullable(),
  totalR0BuyCost: z.number().nonnegative().nullable(),
  r5MinSellPrice: z.number().nonnegative().nullable(),
  r5SellerCount: z.number().int().nonnegative(),
  netProfitPlat: z.number().nullable(),
  roiPercent: z.number().nullable()
})
export type ArcaneFlipRow = z.infer<typeof ArcaneFlipRowSchema>

export const EndoModRowSchema = z.object({
  slug: z.string().min(1),
  nameFr: z.string(),
  nameEn: z.string(),
  thumb: z.string().nullable(),
  rarity: z.enum(['Common', 'Uncommon', 'Rare', 'Legendary']),
  maxRank: z.number().int().positive(),
  endoRequired: z.number().int().positive(),
  creditsToMax: z.number().int().positive(),
  r0MinPrice: z.number().nonnegative().nullable(),
  rMaxMinPrice: z.number().nonnegative().nullable(),
  rMaxSellerCount: z.number().int().nonnegative(),
  netGainPlat: z.number().nullable(),
  platPerThousandEndo: z.number().nullable()
})
export type EndoModRow = z.infer<typeof EndoModRowSchema>

export const PrimeSetPartQuoteSchema = z.object({
  slug: z.string().min(1),
  nameFr: z.string(),
  nameEn: z.string(),
  quantityInSet: z.number().int().positive(),
  unitPrice: z.number().nonnegative().nullable()
})
export type PrimeSetPartQuote = z.infer<typeof PrimeSetPartQuoteSchema>

export const PrimeSetFlipRowSchema = z.object({
  setSlug: z.string().min(1),
  nameFr: z.string(),
  nameEn: z.string(),
  thumb: z.string().nullable(),
  bestSetPrice: z.number().nonnegative().nullable(),
  partsSumPrice: z.number().nonnegative().nullable(),
  netMarginPlat: z.number().nullable(),
  roiPercent: z.number().nullable(),
  parts: z.array(PrimeSetPartQuoteSchema)
})
export type PrimeSetFlipRow = z.infer<typeof PrimeSetFlipRowSchema>

export const ProfitScanResponseSchema = z.object({
  tab: ProfitScanTabSchema,
  scannedAtIso: z.string(),
  arcanes: z.array(ArcaneFlipRowSchema),
  endoMods: z.array(EndoModRowSchema),
  primeSets: z.array(PrimeSetFlipRowSchema)
})
export type ProfitScanResponse = z.infer<typeof ProfitScanResponseSchema>

/* ============================================================================
 * 2. MODULE 25 — PLATINUM LEDGER (wf://market/ledger)
 * ============================================================================ */

export const LedgerEntryTypeSchema = z.enum(['sell', 'buy'])
export type LedgerEntryType = z.infer<typeof LedgerEntryTypeSchema>

export const LedgerEntrySourceSchema = z.enum(['manual', 'wfm-auto'])
export type LedgerEntrySource = z.infer<typeof LedgerEntrySourceSchema>

export const LedgerEntrySchema = z.object({
  id: z.string().min(1).max(80),
  type: LedgerEntryTypeSchema,
  source: LedgerEntrySourceSchema.default('manual'),
  itemSlug: z.string().max(160).default(''),
  itemNameFr: z.string().min(1).max(200),
  itemNameEn: z.string().min(1).max(200),
  unitPlatinum: z.number().int().nonnegative(),
  quantity: z.number().int().positive().max(999),
  totalPlatinum: z.number().int().nonnegative(),
  rank: z.number().int().nonnegative().optional(),
  counterparty: z.string().max(80).default(''),
  notes: z.string().max(240).default(''),
  createdAtIso: z.string()
})
export type LedgerEntry = z.infer<typeof LedgerEntrySchema>

export const LedgerGoalSchema = z.object({
  label: z.string().min(1).max(120).default('Objectif Bundle / Riven'),
  targetPlatinum: z.number().int().positive().max(1_000_000).default(1000)
})
export type LedgerGoal = z.infer<typeof LedgerGoalSchema>

export const LedgerStateSchema = z.object({
  entries: z.array(LedgerEntrySchema).max(2000).default([]),
  masteryRank: z.number().int().min(0).max(40).default(16),
  dailyTradesUsed: z.number().int().nonnegative().max(60).default(0),
  dailyResetUtcDay: z.string().default(''),
  goal: LedgerGoalSchema.default({
    label: 'Objectif Bundle / Riven',
    targetPlatinum: 1000
  })
})
export type LedgerState = z.infer<typeof LedgerStateSchema>

export const AddLedgerEntryInputSchema = z.object({
  type: LedgerEntryTypeSchema,
  itemSlug: z.string().max(160).optional(),
  itemName: z.string().min(1).max(200),
  unitPlatinum: z.number().int().nonnegative().max(1_000_000),
  quantity: z.number().int().positive().max(999).default(1),
  rank: z.number().int().nonnegative().max(20).optional(),
  counterparty: z.string().max(80).optional(),
  notes: z.string().max(240).optional(),
  consumeDailyTrade: z.boolean().default(true)
})
export type AddLedgerEntryInput = z.infer<typeof AddLedgerEntryInputSchema>

export const UpdateLedgerMetaInputSchema = z.object({
  masteryRank: z.number().int().min(0).max(40).optional(),
  dailyTradesUsed: z.number().int().nonnegative().max(60).optional(),
  goalLabel: z.string().min(1).max(120).optional(),
  goalTargetPlatinum: z.number().int().positive().max(1_000_000).optional()
})
export type UpdateLedgerMetaInput = z.infer<typeof UpdateLedgerMetaInputSchema>

/* ============================================================================
 * 3. MODULE 26 — RIVEN GRADER & PRICE ESTIMATOR (wf://market/rivens)
 * ============================================================================ */

export const RivenStatInputSchema = z.object({
  statSlug: z.string().min(1).max(80),
  value: z.number().nullable().optional(),
  isNegative: z.boolean().default(false)
})
export type RivenStatInput = z.infer<typeof RivenStatInputSchema>

export const RivenGradeInputSchema = z.object({
  weaponSlug: z.string().min(1).max(120),
  dispositionOverride: z.number().min(0.4).max(1.75).optional(),
  stats: z.array(RivenStatInputSchema).min(2).max(4),
  fetchLiveEstimate: z.boolean().default(true)
})
export type RivenGradeInput = z.infer<typeof RivenGradeInputSchema>

export const RivenGradedStatSchema = z.object({
  statSlug: z.string(),
  labelFr: z.string(),
  labelEn: z.string(),
  unit: z.enum(['%', 'm', 's', 'x']),
  isNegative: z.boolean(),
  nominalAbs: z.number(),
  minAbs: z.number(),
  maxAbs: z.number(),
  enteredAbs: z.number().nullable(),
  rollQualityPct: z.number().nullable(),
  tierBadge: z.string()
})
export type RivenGradedStat = z.infer<typeof RivenGradedStatSchema>

export const RivenPriceEstimateSchema = z.object({
  activeAuctionCount: z.number().int().nonnegative(),
  unrolledFloorPlat: z.number().nonnegative().nullable(),
  anyFloorPlat: z.number().nonnegative().nullable(),
  similarMedianPlat: z.number().nonnegative().nullable(),
  recommendedRangeMinPlat: z.number().nonnegative().nullable(),
  recommendedRangeMaxPlat: z.number().nonnegative().nullable(),
  comparableAuctions: z.array(RivenAuctionCardSchema).max(6)
})
export type RivenPriceEstimate = z.infer<typeof RivenPriceEstimateSchema>

export const RivenGradeResultSchema = z.object({
  weaponSlug: z.string(),
  weaponNameFr: z.string(),
  weaponNameEn: z.string(),
  rivenFamily: z.enum(['rifle', 'shotgun', 'pistol', 'melee', 'archgun']),
  disposition: z.number(),
  grade: z.enum(['S+', 'S', 'A', 'B', 'C', 'Reroll']),
  score: z.number().min(0).max(100),
  avgRollQualityPct: z.number().nullable(),
  gradedStats: z.array(RivenGradedStatSchema),
  summaryReasonsFr: z.array(z.string()),
  summaryReasonsEn: z.array(z.string()),
  priceEstimate: RivenPriceEstimateSchema.nullable()
})
export type RivenGradeResult = z.infer<typeof RivenGradeResultSchema>

/* ============================================================================
 * 4. MODULE 27 — BUILD PLANNER STUDIO (wf://builds)
 * ============================================================================ */

export const PolarityKindSchema = z.enum([
  'none',
  'madurai',
  'vazarin',
  'naramon',
  'zenurik',
  'unairu',
  'penjaga',
  'umbra',
  'any'
])
export type PolarityKind = z.infer<typeof PolarityKindSchema>

export const ArchonShardSlotSchema = z.object({
  color: z.enum(['none', 'crimson', 'amber', 'azure', 'emerald', 'topaz', 'violet']).default('none'),
  tauforged: z.boolean().default(false),
  buffLabel: z.string().max(120).default('')
})
export type ArchonShardSlot = z.infer<typeof ArchonShardSlotSchema>

export const BuildModSlotSchema = z.object({
  slotIndex: z.number().int().min(0).max(9),
  modId: z.string().max(140).nullable().default(null),
  formaPolarity: PolarityKindSchema.default('none'),
  useMaxRank: z.boolean().default(true),
  owned: z.boolean().default(false)
})
export type BuildModSlot = z.infer<typeof BuildModSlotSchema>

export const BuildArcaneSlotSchema = z.object({
  slotIndex: z.number().int().min(0).max(1),
  marketSlug: z.string().max(160).nullable().default(null),
  nameFr: z.string().max(160).default(''),
  nameEn: z.string().max(160).default(''),
  useMaxRank: z.boolean().default(true),
  owned: z.boolean().default(false)
})
export type BuildArcaneSlot = z.infer<typeof BuildArcaneSlotSchema>

export const SavedBuildSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(120),
  equipmentCategory: z.enum(['warframes', 'weapons']),
  equipmentId: z.string().min(1).max(140),
  equipmentNameFr: z.string().min(1).max(160),
  equipmentNameEn: z.string().min(1).max(160),
  orokinReactorInstalled: z.boolean().default(true),
  auraOrStanceSlot: BuildModSlotSchema,
  exilusSlot: BuildModSlotSchema,
  mainSlots: z.array(BuildModSlotSchema).length(8),
  arcaneSlots: z.array(BuildArcaneSlotSchema).max(2),
  subsumedWarframeId: z.string().max(120).nullable().default(null),
  replacedAbilitySlot: z.number().int().min(1).max(4).nullable().default(null),
  archonShards: z.array(ArchonShardSlotSchema).max(5).default([]),
  notes: z.string().max(400).default(''),
  updatedAtIso: z.string()
})
export type SavedBuild = z.infer<typeof SavedBuildSchema>

export const BuildEquipmentCatalogEntrySchema = z.object({
  id: z.string(),
  category: z.enum(['warframes', 'weapons']),
  weaponSlot: z.string().nullable(),
  weaponType: z.string().nullable(),
  nameFr: z.string(),
  nameEn: z.string(),
  imageUrl: z.string().nullable(),
  isPrime: z.boolean(),
  auraPolarity: z.string().nullable(),
  innatePolarities: z.array(z.string())
})
export type BuildEquipmentCatalogEntry = z.infer<typeof BuildEquipmentCatalogEntrySchema>

export const BuildModCatalogEntrySchema = z.object({
  id: z.string(),
  nameFr: z.string(),
  nameEn: z.string(),
  imageUrl: z.string().nullable(),
  typeLabel: z.string(),
  compatName: z.string(),
  polarity: z.string(),
  rarity: z.string(),
  baseDrain: z.number().int(),
  maxRank: z.number().int().nonnegative(),
  tradable: z.boolean(),
  statsSummary: z.string(),
  topSources: z.array(CodexOverlayPinnedSourceSchema).max(4)
})
export type BuildModCatalogEntry = z.infer<typeof BuildModCatalogEntrySchema>

export const BuildArcaneCatalogEntrySchema = z.object({
  slug: z.string(),
  nameFr: z.string(),
  nameEn: z.string(),
  thumb: z.string().nullable(),
  maxRank: z.number().int().nonnegative()
})
export type BuildArcaneCatalogEntry = z.infer<typeof BuildArcaneCatalogEntrySchema>

export const BuildSubsumedCatalogEntrySchema = z.object({
  warframeId: z.string(),
  warframeNameFr: z.string(),
  abilityNameFr: z.string(),
  imageUrl: z.string().nullable(),
  isMeta: z.boolean()
})
export type BuildSubsumedCatalogEntry = z.infer<typeof BuildSubsumedCatalogEntrySchema>

export const BuildCatalogPayloadSchema = z.object({
  equipment: z.array(BuildEquipmentCatalogEntrySchema),
  mods: z.array(BuildModCatalogEntrySchema),
  arcanes: z.array(BuildArcaneCatalogEntrySchema),
  subsumedAbilities: z.array(BuildSubsumedCatalogEntrySchema)
})
export type BuildCatalogPayload = z.infer<typeof BuildCatalogPayloadSchema>

export const BuildPriceCheckLineSchema = z.object({
  key: z.string(),
  kind: z.enum(['mod', 'arcane']),
  codexModId: z.string().nullable(),
  marketSlug: z.string().nullable(),
  nameFr: z.string(),
  nameEn: z.string(),
  targetRank: z.number().int().nonnegative(),
  owned: z.boolean(),
  tradable: z.boolean(),
  unitPlat: z.number().nonnegative().nullable()
})
export type BuildPriceCheckLine = z.infer<typeof BuildPriceCheckLineSchema>

export const BuildPriceQuoteSchema = z.object({
  buildId: z.string(),
  totalPlatAllItems: z.number().nonnegative(),
  remainingPlatToBuy: z.number().nonnegative(),
  lines: z.array(BuildPriceCheckLineSchema)
})
export type BuildPriceQuote = z.infer<typeof BuildPriceQuoteSchema>

export function encodeBuildShareCode(build: SavedBuild): string {
  const json = JSON.stringify(build)
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  for (const b of bytes) {
    binary += String.fromCharCode(b)
  }
  const b64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `tf-build://v1.${b64}`
}

export function decodeBuildShareCode(code: string): SavedBuild {
  const trimmed = code.trim()
  if (!trimmed.startsWith('tf-build://v1.')) {
    throw new Error('Code de partage invalide (préfixe tf-build://v1. attendu).')
  }
  const b64Url = trimmed.slice('tf-build://v1.'.length)
  if (!b64Url || b64Url.length > 32_000) {
    throw new Error('Code de partage vide ou trop volumineux.')
  }
  const padded = b64Url.replace(/-/g, '+').replace(/_/g, '/')
  const padLen = (4 - (padded.length % 4)) % 4
  const binary = atob(padded + '='.repeat(padLen))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes))
  const validated = SavedBuildSchema.parse(parsed)
  return {
    ...validated,
    id: `build-${Date.now().toString(36)}`,
    updatedAtIso: new Date().toISOString()
  }
}

/* ============================================================================
 * 5. MODULE 28 — FOUNDRY MULTI-CRAFT PLANNER (wf://foundry)
 * ============================================================================ */

export const FoundryProjectInputSchema = z.object({
  category: z.enum(['warframes', 'weapons']),
  id: z.string().min(1).max(140)
})
export type FoundryProjectInput = z.infer<typeof FoundryProjectInputSchema>

export const FoundryProjectDetailSchema = z.object({
  key: z.string(),
  category: z.enum(['warframes', 'weapons']),
  id: z.string(),
  nameFr: z.string(),
  nameEn: z.string(),
  imageUrl: z.string().nullable(),
  isPrime: z.boolean(),
  buildCredits: z.number().int().nonnegative(),
  addedAtIso: z.string()
})
export type FoundryProjectDetail = z.infer<typeof FoundryProjectDetailSchema>

export const FoundryConsolidatedResourceSchema = z.object({
  key: z.string(),
  resourceId: z.string(),
  category: z.enum(['resources', 'warframes', 'weapons']),
  nameFr: z.string(),
  nameEn: z.string(),
  imageUrl: z.string().nullable(),
  isArgonCrystal: z.boolean(),
  requiredCount: z.number().int().positive(),
  ownedCount: z.number().int().nonnegative(),
  missingCount: z.number().int().nonnegative(),
  bestSpotFr: z.string(),
  bestSpotEn: z.string(),
  usedByNames: z.array(z.string()),
  topSources: z.array(CodexOverlayPinnedSourceSchema).max(4)
})
export type FoundryConsolidatedResource = z.infer<typeof FoundryConsolidatedResourceSchema>

export const FoundryStateSchema = z.object({
  projects: z.array(FoundryProjectDetailSchema),
  totalCredits: z.number().int().nonnegative(),
  resources: z.array(FoundryConsolidatedResourceSchema),
  completedResourcesCount: z.number().int().nonnegative()
})
export type FoundryState = z.infer<typeof FoundryStateSchema>

export const FoundryUpdateOwnedInputSchema = z.object({
  resourceKey: z.string().min(1).max(160),
  ownedCount: z.number().int().nonnegative().max(99_999_999)
})
export type FoundryUpdateOwnedInput = z.infer<typeof FoundryUpdateOwnedInputSchema>
