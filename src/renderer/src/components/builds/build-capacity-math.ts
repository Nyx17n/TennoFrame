import type {
  BuildEquipmentCatalogEntry,
  BuildModCatalogEntry,
  PolarityKind,
  SavedBuild
} from '@shared/schemas/pro-tools.schema'

export const POLARITY_CYCLE: readonly PolarityKind[] = [
  'none',
  'madurai',
  'vazarin',
  'naramon',
  'zenurik',
  'umbra'
]

export const POLARITY_SHORT_LABEL: Readonly<Record<PolarityKind, string>> = {
  none: '—',
  madurai: 'V (Madurai)',
  vazarin: 'D (Vazarin)',
  naramon: '— (Naramon)',
  zenurik: '= (Zenurik)',
  unairu: 'R (Unairu)',
  penjaga: 'Y (Penjaga)',
  umbra: 'U (Umbra)',
  any: '★ (Aura)'
}

export function computeSlotDrain(
  mod: BuildModCatalogEntry | undefined,
  slotPol: PolarityKind,
  useMaxRank: boolean,
  isAuraOrStance: boolean
): number {
  if (!mod) return 0
  const rawDrain = Math.abs(mod.baseDrain) + (useMaxRank ? mod.maxRank : 0)
  const modPol = mod.polarity.toLowerCase()
  const polMatches =
    slotPol !== 'none' && (slotPol === 'any' || modPol === slotPol || modPol === 'any')
  const polMismatches =
    slotPol !== 'none' && modPol !== 'none' && !polMatches

  if (isAuraOrStance) {
    if (polMatches) return -(rawDrain * 2)
    if (polMismatches) return -Math.max(0, Math.floor(rawDrain * 0.8))
    return -rawDrain
  }

  if (polMatches) return Math.ceil(rawDrain / 2)
  if (polMismatches) return Math.round(rawDrain * 1.25)
  return rawDrain
}

export function computeBuildCapacitySummary(
  build: SavedBuild,
  modById: ReadonlyMap<string, BuildModCatalogEntry>
): {
  baseCapacity: number
  auraBonus: number
  usedDrain: number
  remainingCapacity: number
  formaCount: number
} {
  const baseCapacity = build.orokinReactorInstalled ? 60 : 30
  const auraMod = build.auraOrStanceSlot.modId
    ? modById.get(build.auraOrStanceSlot.modId)
    : undefined
  const auraDrainSigned = computeSlotDrain(
    auraMod,
    build.auraOrStanceSlot.formaPolarity,
    build.auraOrStanceSlot.useMaxRank,
    true
  )
  const auraBonus = Math.max(0, -auraDrainSigned)

  let usedDrain = 0
  const exilusMod = build.exilusSlot.modId ? modById.get(build.exilusSlot.modId) : undefined
  usedDrain += computeSlotDrain(
    exilusMod,
    build.exilusSlot.formaPolarity,
    build.exilusSlot.useMaxRank,
    false
  )

  for (const sl of build.mainSlots) {
    const m = sl.modId ? modById.get(sl.modId) : undefined
    usedDrain += computeSlotDrain(m, sl.formaPolarity, sl.useMaxRank, false)
  }

  const allSlots = [build.auraOrStanceSlot, build.exilusSlot, ...build.mainSlots]
  const formaCount = allSlots.filter((s) => s.formaPolarity !== 'none').length

  return {
    baseCapacity,
    auraBonus,
    usedDrain,
    remainingCapacity: baseCapacity + auraBonus - usedDrain,
    formaCount
  }
}

export function createBlankBuild(equip: BuildEquipmentCatalogEntry): SavedBuild {
  return {
    id: `build-${Date.now().toString(36)}`,
    title: `${equip.nameFr} — Nouveau Build`,
    equipmentCategory: equip.category,
    equipmentId: equip.id,
    equipmentNameFr: equip.nameFr,
    equipmentNameEn: equip.nameEn,
    orokinReactorInstalled: true,
    auraOrStanceSlot: {
      slotIndex: 0,
      modId: null,
      formaPolarity: 'none',
      useMaxRank: true,
      owned: false
    },
    exilusSlot: {
      slotIndex: 1,
      modId: null,
      formaPolarity: 'none',
      useMaxRank: true,
      owned: false
    },
    mainSlots: Array.from({ length: 8 }, (_, idx) => ({
      slotIndex: idx,
      modId: null,
      formaPolarity: 'none' as const,
      useMaxRank: true,
      owned: false
    })),
    arcaneSlots:
      equip.category === 'warframes'
        ? [
            { slotIndex: 0, marketSlug: null, nameFr: '', nameEn: '', useMaxRank: true, owned: false },
            { slotIndex: 1, marketSlug: null, nameFr: '', nameEn: '', useMaxRank: true, owned: false }
          ]
        : [{ slotIndex: 0, marketSlug: null, nameFr: '', nameEn: '', useMaxRank: true, owned: false }],
    subsumedWarframeId: null,
    replacedAbilitySlot: null,
    archonShards:
      equip.category === 'warframes'
        ? Array.from({ length: 5 }, () => ({ color: 'none' as const, tauforged: false, buffLabel: '' }))
        : [],
    notes: '',
    updatedAtIso: new Date().toISOString()
  }
}
