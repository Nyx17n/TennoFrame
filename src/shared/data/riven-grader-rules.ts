export type RivenFamily = 'rifle' | 'shotgun' | 'pistol' | 'melee' | 'archgun'

export type RivenStatTier = 'S' | 'A' | 'B' | 'C'
export type RivenNegativeTier = 'god_harmless' | 'manageable' | 'bad' | 'crippling'
export type RivenGradeLetter = 'S+' | 'S' | 'A' | 'B' | 'C' | 'Reroll'

export interface RivenAttributeRule {
  readonly slug: string
  readonly labelFr: string
  readonly labelEn: string
  readonly unit: '%' | 'm' | 's' | 'x'
  readonly baseByFamily: Partial<Record<RivenFamily, number>>
  readonly positiveTier: RivenStatTier
  readonly negativeTier: RivenNegativeTier
  /** True for recoil where negative value means less recoil (positive effect on WFM) */
  readonly invertedSign?: boolean
}

export const RIVEN_ATTRIBUTE_CATALOG: readonly RivenAttributeRule[] = [
  {
    slug: 'critical_damage',
    labelFr: 'Dégâts Critiques',
    labelEn: 'Critical Damage',
    unit: '%',
    baseByFamily: { rifle: 120, shotgun: 90, pistol: 90, melee: 90, archgun: 80.1 },
    positiveTier: 'S',
    negativeTier: 'crippling'
  },
  {
    slug: 'multishot',
    labelFr: 'Tir Multiple',
    labelEn: 'Multishot',
    unit: '%',
    baseByFamily: { rifle: 90, shotgun: 119.7, pistol: 119.7, archgun: 60.3 },
    positiveTier: 'S',
    negativeTier: 'crippling'
  },
  {
    slug: 'critical_chance',
    labelFr: 'Chances de Critique',
    labelEn: 'Critical Chance',
    unit: '%',
    baseByFamily: { rifle: 150, shotgun: 90, pistol: 150, melee: 180, archgun: 99.9 },
    positiveTier: 'S',
    negativeTier: 'crippling'
  },
  {
    slug: 'base_damage_/_melee_damage',
    labelFr: 'Dégâts de Base / Mêlée',
    labelEn: 'Base / Melee Damage',
    unit: '%',
    baseByFamily: { rifle: 165, shotgun: 164.7, pistol: 219.6, melee: 164.7, archgun: 99.9 },
    positiveTier: 'A',
    negativeTier: 'crippling'
  },
  {
    slug: 'toxin_damage',
    labelFr: 'Dégâts de Poison',
    labelEn: 'Toxin Damage',
    unit: '%',
    baseByFamily: { rifle: 90, shotgun: 90, pistol: 90, melee: 90, archgun: 119.7 },
    positiveTier: 'S',
    negativeTier: 'bad'
  },
  {
    slug: 'cold_damage',
    labelFr: 'Dégâts de Glace',
    labelEn: 'Cold Damage',
    unit: '%',
    baseByFamily: { rifle: 90, shotgun: 90, pistol: 90, melee: 90, archgun: 119.7 },
    positiveTier: 'A',
    negativeTier: 'bad'
  },
  {
    slug: 'heat_damage',
    labelFr: 'Dégâts de Feu',
    labelEn: 'Heat Damage',
    unit: '%',
    baseByFamily: { rifle: 90, shotgun: 90, pistol: 90, melee: 90, archgun: 119.7 },
    positiveTier: 'A',
    negativeTier: 'bad'
  },
  {
    slug: 'electric_damage',
    labelFr: 'Dégâts Électriques',
    labelEn: 'Electricity Damage',
    unit: '%',
    baseByFamily: { rifle: 90, shotgun: 90, pistol: 90, melee: 90, archgun: 119.7 },
    positiveTier: 'A',
    negativeTier: 'bad'
  },
  {
    slug: 'fire_rate_/_attack_speed',
    labelFr: 'Cadence de Tir / Vitesse d’Attaque',
    labelEn: 'Fire Rate / Attack Speed',
    unit: '%',
    baseByFamily: { rifle: 60.03, shotgun: 90, pistol: 74.7, melee: 54.9, archgun: 60.03 },
    positiveTier: 'A',
    negativeTier: 'crippling'
  },
  {
    slug: 'status_chance',
    labelFr: 'Chances de Statut',
    labelEn: 'Status Chance',
    unit: '%',
    baseByFamily: { rifle: 90, shotgun: 90, pistol: 90, melee: 90, archgun: 60.3 },
    positiveTier: 'A',
    negativeTier: 'bad'
  },
  {
    slug: 'range',
    labelFr: 'Portée (Mêlée)',
    labelEn: 'Range (Melee)',
    unit: 'm',
    baseByFamily: { melee: 1.94 },
    positiveTier: 'S',
    negativeTier: 'crippling'
  },
  {
    slug: 'channeling_efficiency',
    labelFr: 'Efficacité Attaque Lourde / Combo Initial',
    labelEn: 'Initial Combo / Heavy Efficiency',
    unit: '%',
    baseByFamily: { melee: 73.44 },
    positiveTier: 'B',
    negativeTier: 'manageable'
  },
  {
    slug: 'combo_duration',
    labelFr: 'Durée de Combo',
    labelEn: 'Combo Duration',
    unit: 's',
    baseByFamily: { melee: 8.1 },
    positiveTier: 'B',
    negativeTier: 'manageable'
  },
  {
    slug: 'damage_vs_grineer',
    labelFr: 'Dégâts contre les Grineers',
    labelEn: 'Damage to Grineer',
    unit: 'x',
    baseByFamily: { rifle: 45, shotgun: 45, pistol: 45, melee: 45, archgun: 45 },
    positiveTier: 'B',
    negativeTier: 'bad'
  },
  {
    slug: 'damage_vs_corpus',
    labelFr: 'Dégâts contre le Corpus',
    labelEn: 'Damage to Corpus',
    unit: 'x',
    baseByFamily: { rifle: 45, shotgun: 45, pistol: 45, melee: 45, archgun: 45 },
    positiveTier: 'B',
    negativeTier: 'manageable'
  },
  {
    slug: 'damage_vs_infested',
    labelFr: 'Dégâts contre les Infestés',
    labelEn: 'Damage to Infested',
    unit: 'x',
    baseByFamily: { rifle: 45, shotgun: 45, pistol: 45, melee: 45, archgun: 45 },
    positiveTier: 'C',
    negativeTier: 'god_harmless'
  },
  {
    slug: 'reload_speed',
    labelFr: 'Vitesse de Rechargement',
    labelEn: 'Reload Speed',
    unit: '%',
    baseByFamily: { rifle: 50, shotgun: 90, pistol: 50, archgun: 99.9 },
    positiveTier: 'B',
    negativeTier: 'manageable'
  },
  {
    slug: 'magazine_capacity',
    labelFr: 'Taille du Chargeur',
    labelEn: 'Magazine Capacity',
    unit: '%',
    baseByFamily: { rifle: 50, shotgun: 50, pistol: 50, archgun: 60.3 },
    positiveTier: 'B',
    negativeTier: 'manageable'
  },
  {
    slug: 'punch_through',
    labelFr: 'Pénétration',
    labelEn: 'Punch Through',
    unit: 'm',
    baseByFamily: { rifle: 2.7, shotgun: 2.7, pistol: 2.7, archgun: 2.7 },
    positiveTier: 'B',
    negativeTier: 'god_harmless'
  },
  {
    slug: 'slash_damage',
    labelFr: 'Dégâts Tranchants',
    labelEn: 'Slash Damage',
    unit: '%',
    baseByFamily: { rifle: 119.97, shotgun: 119.97, pistol: 119.97, melee: 119.97, archgun: 90 },
    positiveTier: 'B',
    negativeTier: 'bad'
  },
  {
    slug: 'impact_damage',
    labelFr: 'Dégâts d’Impact',
    labelEn: 'Impact Damage',
    unit: '%',
    baseByFamily: { rifle: 119.97, shotgun: 119.97, pistol: 119.97, melee: 119.97, archgun: 90 },
    positiveTier: 'C',
    negativeTier: 'god_harmless'
  },
  {
    slug: 'puncture_damage',
    labelFr: 'Dégâts de Perforation',
    labelEn: 'Puncture Damage',
    unit: '%',
    baseByFamily: { rifle: 119.97, shotgun: 119.97, pistol: 119.97, melee: 119.97, archgun: 90 },
    positiveTier: 'C',
    negativeTier: 'god_harmless'
  },
  {
    slug: 'zoom',
    labelFr: 'Zoom',
    labelEn: 'Zoom',
    unit: '%',
    baseByFamily: { rifle: 59.99, pistol: 80.1, archgun: 59.99 },
    positiveTier: 'C',
    negativeTier: 'god_harmless'
  },
  {
    slug: 'recoil',
    labelFr: 'Recul de l’Arme',
    labelEn: 'Weapon Recoil',
    unit: '%',
    baseByFamily: { rifle: 90, shotgun: 90, pistol: 90, archgun: 90 },
    positiveTier: 'C',
    negativeTier: 'god_harmless',
    invertedSign: true
  },
  {
    slug: 'ammo_maximum',
    labelFr: 'Munitions Maximum',
    labelEn: 'Ammo Maximum',
    unit: '%',
    baseByFamily: { rifle: 49.95, shotgun: 90, pistol: 90, archgun: 99.9 },
    positiveTier: 'C',
    negativeTier: 'god_harmless'
  },
  {
    slug: 'projectile_speed',
    labelFr: 'Vitesse des Projectiles',
    labelEn: 'Projectile Speed',
    unit: '%',
    baseByFamily: { rifle: 90, shotgun: 90, pistol: 90 },
    positiveTier: 'B',
    negativeTier: 'god_harmless'
  }
] as const

export function normalizeWfmRivenTypeToFamily(rawType: string): RivenFamily {
  const lower = rawType.toLowerCase()
  if (lower.includes('shotgun')) return 'shotgun'
  if (lower.includes('pistol') || lower.includes('kitgun') || lower.includes('secondary')) {
    return 'pistol'
  }
  if (lower.includes('melee') || lower.includes('zaw')) return 'melee'
  if (lower.includes('archgun')) return 'archgun'
  return 'rifle'
}

export function getRivenStructureMultipliers(
  positiveCount: number,
  hasNegative: boolean
): { posMult: number; negMult: number } {
  if (positiveCount >= 3) {
    return hasNegative ? { posMult: 0.9375, negMult: 0.75 } : { posMult: 0.75, negMult: 0 }
  }
  return hasNegative ? { posMult: 1.2375, negMult: 0.495 } : { posMult: 0.99, negMult: 0 }
}

export interface EvaluatedRivenStat {
  readonly statSlug: string
  readonly labelFr: string
  readonly labelEn: string
  readonly unit: '%' | 'm' | 's' | 'x'
  readonly isNegative: boolean
  readonly nominalAbs: number
  readonly minAbs: number
  readonly maxAbs: number
  readonly enteredAbs: number | null
  readonly rollQualityPct: number | null
  readonly tierBadge: string
}

export interface PureRivenGradeEvaluation {
  readonly grade: RivenGradeLetter
  readonly score: number
  readonly avgRollQualityPct: number | null
  readonly gradedStats: EvaluatedRivenStat[]
  readonly summaryReasonsFr: string[]
  readonly summaryReasonsEn: string[]
}

const POS_TIER_POINTS: Readonly<Record<RivenStatTier, number>> = {
  S: 34,
  A: 25,
  B: 14,
  C: 5
}

const NEG_TIER_MODIFIER: Readonly<Record<RivenNegativeTier, number>> = {
  god_harmless: 18,
  manageable: 6,
  bad: -10,
  crippling: -36
}

export function evaluateRivenOffline(params: {
  family: RivenFamily
  disposition: number
  stats: ReadonlyArray<{ statSlug: string; value?: number | null; isNegative: boolean }>
}): PureRivenGradeEvaluation {
  const positives = params.stats.filter((s) => !s.isNegative)
  const negatives = params.stats.filter((s) => s.isNegative)
  const { posMult, negMult } = getRivenStructureMultipliers(
    Math.max(2, positives.length),
    negatives.length > 0
  )

  const gradedStats: EvaluatedRivenStat[] = []
  const rollQualities: number[] = []
  let rawScore = 0
  const reasonsFr: string[] = []
  const reasonsEn: string[] = []

  for (const s of params.stats) {
    const rule = RIVEN_ATTRIBUTE_CATALOG.find((r) => r.slug === s.statSlug)
    const base = rule?.baseByFamily[params.family] ?? rule?.baseByFamily.rifle ?? 90
    const mult = s.isNegative ? negMult : posMult
    const nominalAbs = Number((base * params.disposition * mult).toFixed(2))
    const minAbs = Number((nominalAbs * 0.9).toFixed(2))
    const maxAbs = Number((nominalAbs * 1.1).toFixed(2))
    const enteredAbs =
      s.value !== undefined && s.value !== null && Number.isFinite(s.value)
        ? Math.abs(s.value)
        : null

    let rollQualityPct: number | null = null
    if (enteredAbs !== null && maxAbs > minAbs) {
      const clamped = Math.min(maxAbs, Math.max(minAbs, enteredAbs))
      rollQualityPct = Math.round(((clamped - minAbs) / (maxAbs - minAbs)) * 100)
      rollQualities.push(rollQualityPct)
    }

    if (!s.isNegative) {
      const tier = rule?.positiveTier ?? 'B'
      rawScore += POS_TIER_POINTS[tier]
      gradedStats.push({
        statSlug: s.statSlug,
        labelFr: rule?.labelFr ?? s.statSlug,
        labelEn: rule?.labelEn ?? s.statSlug,
        unit: rule?.unit ?? '%',
        isNegative: false,
        nominalAbs,
        minAbs,
        maxAbs,
        enteredAbs,
        rollQualityPct,
        tierBadge: `Tier ${tier}`
      })
    } else {
      const negTier = rule?.negativeTier ?? 'manageable'
      rawScore += NEG_TIER_MODIFIER[negTier]
      const badgeMap: Record<RivenNegativeTier, string> = {
        god_harmless: 'God Neg (+25%)',
        manageable: 'Acceptable',
        bad: 'Pénalisant',
        crippling: 'Destructeur'
      }
      gradedStats.push({
        statSlug: s.statSlug,
        labelFr: rule?.labelFr ?? s.statSlug,
        labelEn: rule?.labelEn ?? s.statSlug,
        unit: rule?.unit ?? '%',
        isNegative: true,
        nominalAbs,
        minAbs,
        maxAbs,
        enteredAbs,
        rollQualityPct,
        tierBadge: badgeMap[negTier]
      })

      if (negTier === 'god_harmless') {
        reasonsFr.push(`Malus inoffensif (${rule?.labelFr ?? s.statSlug}) qui booste les bonus de +25 %.`)
        reasonsEn.push(`Harmless negative (${rule?.labelEn ?? s.statSlug}) boosting positive stats by +25%.`)
      } else if (negTier === 'crippling') {
        reasonsFr.push(`Attention : malus destructeur (${rule?.labelFr ?? s.statSlug}) qui casse le DPS.`)
        reasonsEn.push(`Warning: crippling negative (${rule?.labelEn ?? s.statSlug}) severely hurts DPS.`)
      }
    }
  }

  // Normalize score for 2 vs 3 positives so a 2+1 CC/CD/-Zoom can still reach S/S+
  if (positives.length === 2) {
    rawScore = Math.round(rawScore * 1.18)
  }

  const avgRollQualityPct =
    rollQualities.length > 0
      ? Math.round(rollQualities.reduce((acc, q) => acc + q, 0) / rollQualities.length)
      : null

  if (avgRollQualityPct !== null) {
    rawScore += Math.round((avgRollQualityPct - 50) * 0.12)
  }

  const score = Math.max(0, Math.min(100, rawScore))

  const sPosCount = positives.filter(
    (p) => RIVEN_ATTRIBUTE_CATALOG.find((r) => r.slug === p.statSlug)?.positiveTier === 'S'
  ).length
  if (sPosCount >= 2) {
    reasonsFr.unshift(`${sPosCount} statistiques offensives S-Tier en synergie directe.`)
    reasonsEn.unshift(`${sPosCount} synergistic S-Tier offensive stats.`)
  } else if (sPosCount === 1) {
    reasonsFr.unshift('Contient 1 statistique majeure S-Tier recherchée.')
    reasonsEn.unshift('Contains 1 desirable S-Tier core stat.')
  } else {
    reasonsFr.unshift('Aucune statistique critique/multishot majeure : envisager un reroll Kuva.')
    reasonsEn.unshift('No primary Crit/Multishot stat: consider rerolling with Kuva.')
  }

  if (negatives.length === 0) {
    reasonsFr.push('Aucun malus : statistiques stables mais plafond inférieur de ~20 % à un 2+1 / 3+1.')
    reasonsEn.push('No negative curse: consistent stats, though ~20% lower ceiling than a cursed roll.')
  }

  const hasCripplingNeg = negatives.some(
    (n) => RIVEN_ATTRIBUTE_CATALOG.find((r) => r.slug === n.statSlug)?.negativeTier === 'crippling'
  )

  let grade: RivenGradeLetter
  if (hasCripplingNeg && score < 55) {
    grade = 'Reroll'
  } else if (score >= 92) {
    grade = 'S+'
  } else if (score >= 80) {
    grade = 'S'
  } else if (score >= 66) {
    grade = 'A'
  } else if (score >= 50) {
    grade = 'B'
  } else if (score >= 35) {
    grade = 'C'
  } else {
    grade = 'Reroll'
  }

  return {
    grade,
    score,
    avgRollQualityPct,
    gradedStats,
    summaryReasonsFr: reasonsFr,
    summaryReasonsEn: reasonsEn
  }
}
