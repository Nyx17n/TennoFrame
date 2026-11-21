import {
  extractMentionedPlanets,
  resolveWarframePlanet,
  type WarframePlanetInfo
} from '@shared/data/warframe-planets'

export interface ParsedWarframeLocation {
  readonly planet: WarframePlanetInfo | null
  readonly planetSubRegion: string | null
  readonly nodeName: string | null
  readonly missionType: string | null
  readonly rotation: string | null
  readonly isSteelPath: boolean
  readonly relicLabel: string | null
  readonly multiPlanets: readonly WarframePlanetInfo[]
  readonly fallbackText: string
}

const MISSION_TRANSLATIONS_FR: ReadonlyArray<readonly [RegExp, string]> = [
  [/^Mobile Defense$/i, 'Défense Mobile'],
  [/^Defense$/i, 'Défense'],
  [/^Survival$/i, 'Survie'],
  [/^Disruption$/i, 'Perturbation'],
  [/^Spy$/i, 'Espionnage'],
  [/^Capture$/i, 'Capture'],
  [/^Exterminate$/i, 'Extermination'],
  [/^Sabotage$/i, 'Sabotage'],
  [/^Rescue$/i, 'Sauvetage'],
  [/^Interception$/i, 'Interception'],
  [/^Excavation$/i, 'Excavation'],
  [/^Defection$/i, 'Désertion'],
  [/^Hijack$/i, 'Détournement'],
  [/^Assassination$/i, 'Assassinat'],
  [/^Infested Salvage$/i, 'Récupération Infestée'],
  [/^Void Cascade$/i, 'Cascade du Néant'],
  [/^Void Flood$/i, 'Déluge du Néant'],
  [/^Void Armageddon$/i, 'Armageddon du Néant'],
  [/^Alchemy$/i, 'Alchimie'],
  [/^Netracells$/i, 'Cellules de Netra'],
  [/^Mirror Defense$/i, 'Défense Miroir'],
  [/^Conjunction Survival$/i, 'Survie Conjonction'],
  [/^Legacyte Harvest$/i, 'Récolte de Légacytes'],
  [/^Skirmish$/i, 'Escarmouche Railjack'],
  [/^Volatile$/i, 'Volatile Railjack'],
  [/^Orphix$/i, 'Orphix Railjack'],
  [/^Caches$/i, 'Caches de Sabotage'],
  [/^Arena$/i, 'Arène']
]

function localizeMissionMode(rawMode: string, preferFrench: boolean): string {
  const trimmed = rawMode.trim()
  if (!preferFrench || !trimmed) return trimmed

  for (const [pattern, labelFr] of MISSION_TRANSLATIONS_FR) {
    if (pattern.test(trimmed)) return labelFr
  }

  return trimmed
    .replace(/\bCetus Bounty\b/gi, 'Mise à prix Cetus')
    .replace(/\bOrb Vallis Bounty\b/gi, 'Mise à prix Vallée Orbis')
    .replace(/\bCambion Drift Bounty\b/gi, 'Mise à prix Puy de Cambion')
    .replace(/\bZariman Bounty\b/gi, 'Mise à prix Zariman')
    .replace(/\bBounty\b/gi, 'Mise à prix')
    .replace(/\bLevel\b/gi, 'Niv.')
}

function extractRotationAndSteelPath(input: string): {
  cleaned: string
  rotation: string | null
  isSteelPath: boolean
} {
  let working = input.trim()
  let isSteelPath = false

  const spRegex = /\s*\((?:Mode\s+)?(?:Steel Path|Route de l['’]Acier)(?:\s+active|\s+actif)?\)/gi
  if (spRegex.test(working) || /\bSteel Path\b|\bRoute de l['’]Acier\b/i.test(working)) {
    isSteelPath = true
    working = working
      .replace(/\s*\((?:Mode\s+)?(?:Steel Path|Route de l['’]Acier)(?:\s+active|\s+actif)?\)/gi, '')
      .replace(/,\s*(?:Steel Path|Route de l['’]Acier)\b/gi, '')
      .trim()
  }

  let rotation: string | null = null
  const rotMatch = /(?:,\s*|\s+-\s+|\s*\()Rotation\s+([ABC123])\b\)?/i.exec(working)
  if (rotMatch?.[1]) {
    rotation = `Rot. ${rotMatch[1].toUpperCase()}`
    working = working.replace(rotMatch[0], '').trim()
  }

  return { cleaned: working, rotation, isSteelPath }
}

function splitNodeAndMissionMode(
  rawRight: string,
  preferFrench: boolean
): { nodeName: string | null; missionType: string | null } {
  const text = rawRight.trim()
  if (!text) return { nodeName: null, missionType: null }

  // Pattern: "Olympus (Disruption)" or "Ani / Mot (Survie)" or "Mise à prix Niveau 40-60 (Brute Force)"
  const parenMatch = /^(.+?)\s*\(([^()]+)\)\s*$/.exec(text)
  if (parenMatch?.[1] && parenMatch[2]) {
    return {
      nodeName: parenMatch[1].trim(),
      missionType: localizeMissionMode(parenMatch[2].trim(), preferFrench)
    }
  }

  return { nodeName: text, missionType: null }
}

export function parseWarframeLocation(
  rawText: string,
  preferFrench = true
): ParsedWarframeLocation {
  const trimmed = rawText.trim()
  if (!trimmed) {
    return {
      planet: null,
      planetSubRegion: null,
      nodeName: null,
      missionType: null,
      rotation: null,
      isSteelPath: false,
      relicLabel: null,
      multiPlanets: [],
      fallbackText: ''
    }
  }

  // 1. Relic check first (prevent "Lith" / "Neo" / "Axi" false matches)
  if (/^(?:Relique\s+)?(?:Lith|Meso|Neo|Axi|Requiem)\s+[A-Z0-9]+\b/i.test(trimmed) || /\bRelic\b|\bRelique\b/i.test(trimmed)) {
    const isPureRelic = !trimmed.includes('/') && !trimmed.includes(' - ') && !trimmed.includes(' — ')
    if (isPureRelic) {
      return {
        planet: null,
        planetSubRegion: null,
        nodeName: null,
        missionType: null,
        rotation: null,
        isSteelPath: false,
        relicLabel: trimmed,
        multiPlanets: [],
        fallbackText: trimmed
      }
    }
  }

  const { cleaned, rotation, isSteelPath } = extractRotationAndSteelPath(trimmed)

  // 2. Structured "Planet/Node (Mode)" or "Planet - Node (Mode)" or "Planet — Node (Mode)"
  const sepMatch = /^([^/—-]+?)(?:\s*\/\s*|\s+[—-]\s+)(.+)$/.exec(cleaned)
  if (sepMatch?.[1] && sepMatch[2]) {
    const rawLeft = sepMatch[1].trim()
    const rawRight = sepMatch[2].trim()

    // Extract optional sub-region on left, e.g. "Deimos (Puy de Cambion)"
    const leftParen = /^(.+?)\s*\(([^()]+)\)\s*$/.exec(rawLeft)
    const planetCandidate = leftParen?.[1] ? leftParen[1].trim() : rawLeft
    const subRegion = leftParen?.[2] ? leftParen[2].trim() : null

    const planet = resolveWarframePlanet(planetCandidate) ?? resolveWarframePlanet(rawLeft)
    if (planet) {
      const { nodeName, missionType } = splitNodeAndMissionMode(rawRight, preferFrench)
      return {
        planet,
        planetSubRegion: subRegion,
        nodeName,
        missionType,
        rotation,
        isSteelPath,
        relicLabel: null,
        multiPlanets: [planet],
        fallbackText: cleaned
      }
    }
  }

  // 3. Open-world / Special lines without slash, e.g. "Duviri Static Undercroft Portal" or "Cetus Bounty"
  const mentioned = extractMentionedPlanets(cleaned, 6)
  const hasCommaList = cleaned.includes(',') && mentioned.length >= 2
  if (mentioned.length === 1 && !hasCommaList) {
    const onlyPlanet = mentioned[0]!
    // Check if cleaned is JUST the planet name or has an objective after it
    const planetFrNorm = onlyPlanet.nameFr.toLowerCase()
    const planetEnNorm = onlyPlanet.nameEn.toLowerCase()
    const remainder = cleaned
      .replace(new RegExp(`^${onlyPlanet.nameEn}\\b\\s*:?\\s*`, 'i'), '')
      .replace(new RegExp(`^${onlyPlanet.nameFr}\\b\\s*:?\\s*`, 'i'), '')
      .trim()

    if (
      remainder &&
      remainder.toLowerCase() !== planetFrNorm &&
      remainder.toLowerCase() !== planetEnNorm &&
      !cleaned.startsWith('Quête') &&
      !cleaned.startsWith('Syndicat')
    ) {
      const { nodeName, missionType } = splitNodeAndMissionMode(remainder, preferFrench)
      return {
        planet: onlyPlanet,
        planetSubRegion: null,
        nodeName,
        missionType,
        rotation,
        isSteelPath,
        relicLabel: null,
        multiPlanets: [onlyPlanet],
        fallbackText: cleaned
      }
    }
  }

  return {
    planet: null,
    planetSubRegion: null,
    nodeName: null,
    missionType: null,
    rotation,
    isSteelPath,
    relicLabel: null,
    multiPlanets: mentioned,
    fallbackText: cleaned
  }
}
