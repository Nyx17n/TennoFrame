export type WarframePlanetId =
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'lua'
  | 'mars'
  | 'phobos'
  | 'deimos'
  | 'ceres'
  | 'jupiter'
  | 'europa'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto'
  | 'sedna'
  | 'eris'
  | 'void'
  | 'kuva-fortress'
  | 'zariman'
  | 'duviri'
  | 'hollvania'
  | 'earth-proxima'
  | 'venus-proxima'
  | 'saturn-proxima'
  | 'neptune-proxima'
  | 'pluto-proxima'
  | 'veil-proxima'

export interface WarframePlanetInfo {
  readonly id: WarframePlanetId
  readonly nameFr: string
  readonly nameEn: string
  readonly imageUrl: string
  readonly aliases: readonly string[]
}

function normalizeLookup(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const WIKI_ASSET_PREFIX = 'wf-asset://wiki/'

/**
 * Official Warframe Star Chart planet, moon & Proxima cutouts served safely
 * via `wf-asset://wiki/<File>` and cached 7 days on disk by CacheService.
 * Ordered with multi-word / Proxima regions first so longest aliases match first.
 */
export const WARFRAME_PLANETS: readonly WarframePlanetInfo[] = [
  {
    id: 'earth-proxima',
    nameFr: 'Proxima de la Terre',
    nameEn: 'Earth Proxima',
    imageUrl: `${WIKI_ASSET_PREFIX}Earth_ProximaCutout.png`,
    aliases: ['earth proxima', 'proxima de la terre']
  },
  {
    id: 'venus-proxima',
    nameFr: 'Proxima de Vénus',
    nameEn: 'Venus Proxima',
    imageUrl: `${WIKI_ASSET_PREFIX}Venus_ProximaCutout.png`,
    aliases: ['venus proxima', 'proxima de venus']
  },
  {
    id: 'saturn-proxima',
    nameFr: 'Proxima de Saturne',
    nameEn: 'Saturn Proxima',
    imageUrl: `${WIKI_ASSET_PREFIX}Saturn_ProximaCutout.png`,
    aliases: ['saturn proxima', 'proxima de saturne']
  },
  {
    id: 'neptune-proxima',
    nameFr: 'Proxima de Neptune',
    nameEn: 'Neptune Proxima',
    imageUrl: `${WIKI_ASSET_PREFIX}Neptune_ProximaCutout.png`,
    aliases: ['neptune proxima', 'proxima de neptune']
  },
  {
    id: 'pluto-proxima',
    nameFr: 'Proxima de Pluton',
    nameEn: 'Pluto Proxima',
    imageUrl: `${WIKI_ASSET_PREFIX}Pluto_ProximaCutout.png`,
    aliases: ['pluto proxima', 'proxima de pluton']
  },
  {
    id: 'veil-proxima',
    nameFr: 'Proxima du Voile',
    nameEn: 'Veil Proxima',
    imageUrl: `${WIKI_ASSET_PREFIX}Veil_ProximaCutout.png`,
    aliases: ['veil proxima', 'proxima du voile', 'railjack veil']
  },
  {
    id: 'kuva-fortress',
    nameFr: 'Forteresse Kuva',
    nameEn: 'Kuva Fortress',
    imageUrl: `${WIKI_ASSET_PREFIX}Kuva_FortressCutout.png`,
    aliases: ['kuva fortress', 'forteresse kuva', 'forteresse de kuva']
  },
  {
    id: 'zariman',
    nameFr: 'Zariman',
    nameEn: 'Zariman',
    imageUrl: `${WIKI_ASSET_PREFIX}ZarimanCutout.png`,
    aliases: ['zariman ten zero', 'zariman 10-0', 'zariman', 'dormizone', 'chrysalithe', 'chrysalith']
  },
  {
    id: 'hollvania',
    nameFr: 'Höllvanie (1999)',
    nameEn: 'Höllvania (1999)',
    imageUrl: `${WIKI_ASSET_PREFIX}H%C3%B6llvaniaArcaneCollection.png`,
    aliases: ['hollvania', 'hollvanie', '1999', 'hexagone']
  },
  {
    id: 'duviri',
    nameFr: 'Duviri',
    nameEn: 'Duviri',
    imageUrl: `${WIKI_ASSET_PREFIX}DuviriNavigation.png`,
    aliases: ['duviri', 'circuit de duviri', 'undercroft', 'hypogee', 'experience duviri']
  },
  {
    id: 'mercury',
    nameFr: 'Mercure',
    nameEn: 'Mercury',
    imageUrl: `${WIKI_ASSET_PREFIX}MercuryCutout.png`,
    aliases: ['mercury', 'mercure']
  },
  {
    id: 'venus',
    nameFr: 'Vénus',
    nameEn: 'Venus',
    imageUrl: `${WIKI_ASSET_PREFIX}VenusCutout.png`,
    aliases: ['venus', 'vallee orbis', 'orb vallis', 'fortuna']
  },
  {
    id: 'earth',
    nameFr: 'Terre',
    nameEn: 'Earth',
    imageUrl: `${WIKI_ASSET_PREFIX}EarthCutout.png`,
    aliases: ['earth', 'terre', 'cetus', 'plaines d eidolon', 'plains of eidolon', 'camp du voyageur', 'drifter camp']
  },
  {
    id: 'lua',
    nameFr: 'Lua',
    nameEn: 'Lua',
    imageUrl: `${WIKI_ASSET_PREFIX}LuaCutout.png`,
    aliases: ['lua']
  },
  {
    id: 'mars',
    nameFr: 'Mars',
    nameEn: 'Mars',
    imageUrl: `${WIKI_ASSET_PREFIX}MarsCutout.png`,
    aliases: ['mars', 'bazar de maroo', 'maroo s bazaar']
  },
  {
    id: 'phobos',
    nameFr: 'Phobos',
    nameEn: 'Phobos',
    imageUrl: `${WIKI_ASSET_PREFIX}PhobosCutout.png`,
    aliases: ['phobos']
  },
  {
    id: 'deimos',
    nameFr: 'Deimos',
    nameEn: 'Deimos',
    imageUrl: `${WIKI_ASSET_PREFIX}DeimosCutout.png`,
    aliases: [
      'deimos',
      'puy de cambion',
      'cambion drift',
      'necralisk',
      'sanctum anatomica',
      'laboratoires d albrecht',
      'albrecht s laboratories',
      'epave orokin',
      'derelict'
    ]
  },
  {
    id: 'ceres',
    nameFr: 'Cérès',
    nameEn: 'Ceres',
    imageUrl: `${WIKI_ASSET_PREFIX}CeresCutout.png`,
    aliases: ['ceres']
  },
  {
    id: 'jupiter',
    nameFr: 'Jupiter',
    nameEn: 'Jupiter',
    imageUrl: `${WIKI_ASSET_PREFIX}JupiterCutout.png`,
    aliases: ['jupiter']
  },
  {
    id: 'europa',
    nameFr: 'Europe',
    nameEn: 'Europa',
    imageUrl: `${WIKI_ASSET_PREFIX}EuropaCutout.png`,
    aliases: ['europa', 'europe']
  },
  {
    id: 'saturn',
    nameFr: 'Saturne',
    nameEn: 'Saturn',
    imageUrl: `${WIKI_ASSET_PREFIX}SaturnCutout.png`,
    aliases: ['saturn', 'saturne']
  },
  {
    id: 'uranus',
    nameFr: 'Uranus',
    nameEn: 'Uranus',
    imageUrl: `${WIKI_ASSET_PREFIX}UranusCutout.png`,
    aliases: ['uranus']
  },
  {
    id: 'neptune',
    nameFr: 'Neptune',
    nameEn: 'Neptune',
    imageUrl: `${WIKI_ASSET_PREFIX}NeptuneCutout.png`,
    aliases: ['neptune', 'index']
  },
  {
    id: 'pluto',
    nameFr: 'Pluton',
    nameEn: 'Pluto',
    imageUrl: `${WIKI_ASSET_PREFIX}PlutoCutout.png`,
    aliases: ['pluto', 'pluton']
  },
  {
    id: 'sedna',
    nameFr: 'Sedna',
    nameEn: 'Sedna',
    imageUrl: `${WIKI_ASSET_PREFIX}SednaCutout.png`,
    aliases: ['sedna', 'rathuum']
  },
  {
    id: 'eris',
    nameFr: 'Éris',
    nameEn: 'Eris',
    imageUrl: `${WIKI_ASSET_PREFIX}ErisCutout.png`,
    aliases: ['eris']
  },
  {
    id: 'void',
    nameFr: 'Néant',
    nameEn: 'Void',
    imageUrl: `${WIKI_ASSET_PREFIX}VoidCutout.png`,
    aliases: ['void', 'the void', 'neant', 'le neant']
  }
]

const EXACT_PLANET_MAP: ReadonlyMap<string, WarframePlanetInfo> = (() => {
  const map = new Map<string, WarframePlanetInfo>()
  for (const planet of WARFRAME_PLANETS) {
    map.set(normalizeLookup(planet.nameFr), planet)
    map.set(normalizeLookup(planet.nameEn), planet)
    for (const alias of planet.aliases) {
      map.set(normalizeLookup(alias), planet)
    }
  }
  return map
})()

export function resolveWarframePlanet(rawCandidate: string): WarframePlanetInfo | null {
  const cleaned = normalizeLookup(rawCandidate.replace(/\([^)]*\)/g, ''))
  const direct = EXACT_PLANET_MAP.get(cleaned)
  if (direct) return direct

  const fullNorm = normalizeLookup(rawCandidate)
  const fullDirect = EXACT_PLANET_MAP.get(fullNorm)
  if (fullDirect) return fullDirect

  for (const planet of WARFRAME_PLANETS) {
    for (const alias of planet.aliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const re = new RegExp(`(?:^|\\b)${escaped}(?:\\b|$)`, 'i')
      if (re.test(fullNorm)) {
        return planet
      }
    }
  }
  return null
}

export function extractMentionedPlanets(rawText: string, maxCount = 8): WarframePlanetInfo[] {
  const normText = normalizeLookup(rawText)
  if (!normText) return []

  const hits: Array<{ pos: number; planet: WarframePlanetInfo }> = []
  const seen = new Set<WarframePlanetId>()

  for (const planet of WARFRAME_PLANETS) {
    let bestPos = Number.POSITIVE_INFINITY
    for (const alias of planet.aliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const match = new RegExp(`(?:^|\\b)${escaped}(?:\\b|$)`, 'i').exec(normText)
      if (match && match.index < bestPos) {
        bestPos = match.index
      }
    }
    if (bestPos !== Number.POSITIVE_INFINITY && !seen.has(planet.id)) {
      seen.add(planet.id)
      hits.push({ pos: bestPos, planet })
    }
  }

  hits.sort((a, b) => a.pos - b.pos)
  return hits.slice(0, maxCount).map((h) => h.planet)
}
