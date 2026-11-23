import {
  toCodexImageUrl,
  type CodexDropEntry,
  type CodexResourceMobDropEntry
} from '@shared/schemas/codex.schema'
import type { CodexMobsVendorsDatabase } from './codex-raw.schemas'

type RawMobEntry = CodexMobsVendorsDatabase['mobs'][number]

interface HabitatFallbackRule {
  readonly pattern: RegExp
  readonly factionFr: string
  readonly spawnsFr: readonly string[]
}

const NON_MOB_LOCATION_RE =
  /\b(?:relic|relique|bounty|mise[s]? a prix|caches?|container|crate|chest|coffer|carrypod|omnipak|drum|formation|cannister|clump|cluster|reserve|surplus|sorties|onslaught|arbitrations|granum void|circuit|full experience|rewards|connexion quotidienne|operational supply|vox solaris|solaris united|ostron|the quills|necraloid|entrati|steel meridian|arbiters of hexis|cephalon suda|perrin sequence|red veil|new loka)\b/i

const VARIANT_PREFIXES_RE =
  /^(?:juno|narmer|aurax|vapos|taro|orm|vorac|axio|tusk|arid|frontier|drekar|kuva|exo|kosma|gyre|amalgam|corrupted|mutalist|demolisher|bladeswarm|bloodfrenzy|deimos|rogue|tyro|elite|eximus)\s+/i

const ENEMY_HABITAT_RULES: readonly HabitatFallbackRule[] = [
  {
    pattern: /\bzealoid prelate\b/i,
    factionFr: 'Infesté · Boss',
    spawnsFr: ['Deimos - Exequias (Assassinat)']
  },
  {
    pattern: /\bh-09 apex\b|\btechrot\b|\bproto-infested\b|\bscaldra\b/i,
    factionFr: 'Höllvanie 1999',
    spawnsFr: ['Höllvanie (1999) - Missions Höllvanie (Survie / Extermination)']
  },
  {
    pattern: /\bamalgam\b/i,
    factionFr: 'Corpus Amalgame',
    spawnsFr: ['Jupiter - Ganymede (Perturbation)', 'Jupiter - Thémisto / Cité Gazière (Survie)']
  },
  {
    pattern: /\baurax\b/i,
    factionFr: 'Corpus Empyrée',
    spawnsFr: ['Proxima de Vénus - Vaisseaux Corpus (Escarmouche Railjack)', 'Proxima de Pluton - Points d’Intérêt (Volatile Railjack)']
  },
  {
    pattern: /\b(?:axio|orm|vorac|taro)\b/i,
    factionFr: 'Chasseur Corpus Railjack',
    spawnsFr: ['Proxima de Vénus - Missions Empyrée (Escarmouche Railjack)', 'Proxima de Neptune - Missions Empyrée (Escarmouche Railjack)']
  },
  {
    pattern: /\b(?:gyrix|ionyx)\b/i,
    factionFr: 'Chasseur Sentient Railjack',
    spawnsFr: ['Proxima du Voile - Anomalie Sentient (Escarmouche Railjack)']
  },
  {
    pattern: /\b(?:bladeswarm|bloodfrenzy)\b/i,
    factionFr: 'Unité Archwing / Submersible',
    spawnsFr: ['Uranus - Ophelia (Survie Submersible)', 'Proxima de la Terre - Missions Empyrée (Escarmouche Railjack)']
  },
  {
    pattern: /\bdemolisher\s+(?:anti moa|bursa|hyena|machinist)\b/i,
    factionFr: 'Corpus · Démolisseur',
    spawnsFr: ['Lua - Apollo (Perturbation)', 'Jupiter - Ganymede (Perturbation)']
  },
  {
    pattern: /\bdemolisher\b/i,
    factionFr: 'Grineer · Démolisseur',
    spawnsFr: ['Forteresse Kuva - Tamu (Perturbation)', 'Sedna - Kelpie (Perturbation)', 'Mars - Olympus (Perturbation)']
  },
  {
    pattern: /\b(?:mite|scyto|kyta)\s+raknoid\b|\bnarmer mite\b/i,
    factionFr: 'Corpus · Raknoïde',
    spawnsFr: ['Vénus - Vallée Orbis (Port Spatial / Temple du Profit / Labos d’Enrichissement)']
  },
  {
    pattern: /\basteroid raknoid\b/i,
    factionFr: 'Railjack · Raknoïde',
    spawnsFr: ['Proxima de Neptune - Mines d’Astéroïdes (Escarmouche Railjack)']
  },
  {
    pattern: /\bdax\s+(?:arcus|equitem|gladius|herald|malleus)\b|\bcorrupted jackal\b/i,
    factionFr: 'Duviri · Dax',
    spawnsFr: ['Duviri - Expérience Duviri / Hypogée (Spirales Duviri)']
  },
  {
    pattern: /\bnarmer thumper\b/i,
    factionFr: 'Narmer · Boss mobile',
    spawnsFr: ['Terre - Plaines d’Eidolon (Mise à prix Narmer en journée)']
  },
  {
    pattern: /\bnarmer\b/i,
    factionFr: 'Narmer',
    spawnsFr: ['Terre - Cetus (Mise à prix Narmer)', 'Vénus - Vallée Orbis (Mise à prix Narmer)']
  },
  {
    pattern: /\bjuno\b/i,
    factionFr: 'Corpus (Vaisseau)',
    spawnsFr: ['Vénus - Ishtar / Fossa (Vaisseau Corpus)', 'Pluton - Hydra (Capture Corpus)']
  },
  {
    pattern: /\bvomvalyst\b|\bsentient eidolons\b/i,
    factionFr: 'Sentient',
    spawnsFr: ['Terre - Plaines d’Eidolon (Cycle Nuit)']
  },
  {
    pattern: /\b(?:brachiolyst|ortholyst|summulyst|symbilyst|conculyst|archimedean itzam|erra)\b/i,
    factionFr: 'Sentient',
    spawnsFr: ['Proxima du Voile - Anomalie Murex (Escarmouche Railjack)', 'Lua - Platon (Extermination Crossfire)']
  },
  {
    pattern: /\bsister of parvos\b|\bspecter particles\b/i,
    factionFr: 'Corpus · Sœur / Parvos',
    spawnsFr: ['Uranus - Brutus (Ascension)', 'Vénus - Néant de Granum (Vaisseau Corpus)']
  },
  {
    pattern: /\bdeimos\b|\bancient\s+(?:maggot|protector|undying flyer)\b/i,
    factionFr: 'Infesté · Puy de Cambion',
    spawnsFr: ['Deimos - Puy de Cambion (Mises à prix Infestées)']
  },
  {
    pattern: /\bcorrupted\b/i,
    factionFr: 'Orokin Corrompu',
    spawnsFr: ['Néant - Mot / Ani (Survie)']
  },
  {
    pattern: /\beximus enemy\b/i,
    factionFr: 'Unité Eximus',
    spawnsFr: ['Mars - Toutes missions (Fréquence accrue en Survie / Défense Route de l’Acier)']
  }
]

function normKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export class CodexMobSpawnResolver {
  private readonly mobByNorm = new Map<string, RawMobEntry>()
  private readonly mobsByResourceId = new Map<string, RawMobEntry[]>()

  public constructor(mobs: readonly RawMobEntry[]) {
    for (const mob of mobs) {
      this.mobByNorm.set(normKey(mob.en), mob)
      this.mobByNorm.set(normKey(mob.name), mob)
      for (const d of mob.drops) {
        if (d.linkedCategory === 'resources' && d.linkedCodexId) {
          const list = this.mobsByResourceId.get(d.linkedCodexId) ?? []
          list.push(mob)
          this.mobsByResourceId.set(d.linkedCodexId, list)
        }
      }
    }
  }

  private matchMob(rawLocation: string): {
    mob: RawMobEntry | null
    habitatRule: HabitatFallbackRule | null
  } {
    const clean = rawLocation.replace(/\s*\([^)]*\)\s*/g, ' ').trim()
    const direct = this.mobByNorm.get(normKey(rawLocation)) ?? this.mobByNorm.get(normKey(clean))
    const habitatRule = ENEMY_HABITAT_RULES.find((r) => r.pattern.test(rawLocation)) ?? null
    if (direct) return { mob: direct, habitatRule }

    const stripped = clean.replace(VARIANT_PREFIXES_RE, '').trim()
    const baseMob = stripped !== clean ? (this.mobByNorm.get(normKey(stripped)) ?? null) : null
    return { mob: baseMob, habitatRule }
  }

  public enrichDropEntry(drop: CodexDropEntry): CodexDropEntry {
    const loc = drop.location.trim()
    if (
      !loc ||
      loc.includes('/') ||
      loc.includes(' - ') ||
      loc.includes(' — ') ||
      loc.startsWith('Quête') ||
      NON_MOB_LOCATION_RE.test(loc)
    ) {
      return drop
    }

    const { mob, habitatRule } = this.matchMob(loc)
    if (!mob && !habitatRule) return drop

    // Prefer variant-specific habitat rule when raw name carries a prefix (e.g. Narmer Oxium Osprey),
    // otherwise use the Bestiary mob's exact spawn locations.
    const isDirectExactMob =
      mob !== null && (normKey(mob.en) === normKey(loc) || normKey(mob.name) === normKey(loc))

    const spawnsFr =
      !isDirectExactMob && habitatRule
        ? [...habitatRule.spawnsFr]
        : mob && mob.spawns.length > 0
          ? mob.spawns.slice(0, 3).map((s) => s.locationFr)
          : mob && mob.planetsFr.length > 0
            ? [mob.planetsFr.join(', ')]
            : habitatRule
              ? [...habitatRule.spawnsFr]
              : []

    if (spawnsFr.length === 0) return drop

    return {
      ...drop,
      mobId: mob?.id ?? null,
      mobNameFr: isDirectExactMob && mob ? mob.name : loc,
      mobImageUrl: mob ? toCodexImageUrl(mob.img) : null,
      mobSpawnLocationsFr: spawnsFr
    }
  }

  public resolveResourceMobDrops(
    resourceId: string,
    enrichedDrops: readonly CodexDropEntry[]
  ): CodexResourceMobDropEntry[] {
    const byKey = new Map<string, CodexResourceMobDropEntry>()

    // 1. Exact Bestiary mobs linked to this resource
    const linkedMobs = this.mobsByResourceId.get(resourceId) ?? []
    for (const mob of linkedMobs) {
      const matchedDrop = mob.drops.find(
        (d) => d.linkedCategory === 'resources' && d.linkedCodexId === resourceId
      )
      if (!matchedDrop) continue
      const spawns =
        mob.spawns.length > 0
          ? mob.spawns.slice(0, 3).map((s) => ({
              locationFr: s.locationFr,
              spawnChancePct: s.spawnChancePct
            }))
          : mob.planetsFr.length > 0
            ? [{ locationFr: mob.planetsFr.join(', '), spawnChancePct: null }]
            : []
      if (spawns.length === 0) continue

      const tierFr =
        mob.unitTier === 'boss' ? 'Boss' : mob.unitTier === 'eximus' ? 'Élite' : 'Standard'
      byKey.set(`mob:${mob.id}`, {
        mobId: mob.id,
        nameFr: mob.name,
        nameEn: mob.en,
        imageUrl: toCodexImageUrl(mob.img),
        factionLabelFr: `${mob.factionFr} · ${tierFr}`,
        dropChancePct: matchedDrop.chancePct,
        spawns
      })
    }

    // 2. Enemy drops from codex-db not already covered above
    for (const d of enrichedDrops) {
      if (d.mobSpawnLocationsFr.length === 0) continue
      const dedupeKey = d.mobId && d.mobNameFr !== d.location ? `mob:${d.mobId}` : `raw:${normKey(d.location)}`
      const existing = byKey.get(dedupeKey)
      if (existing) {
        if (d.chance > existing.dropChancePct) {
          byKey.set(dedupeKey, { ...existing, dropChancePct: d.chance })
        }
        continue
      }
      const habitat = ENEMY_HABITAT_RULES.find((r) => r.pattern.test(d.location))
      byKey.set(dedupeKey, {
        mobId: d.mobId,
        nameFr: d.mobNameFr ?? d.location,
        nameEn: d.location,
        imageUrl: d.mobImageUrl,
        factionLabelFr: habitat?.factionFr ?? 'Ennemi',
        dropChancePct: d.chance,
        spawns: d.mobSpawnLocationsFr.map((locFr) => ({
          locationFr: locFr,
          spawnChancePct: null
        }))
      })
    }

    return Array.from(byKey.values()).sort(
      (a, b) => b.dropChancePct - a.dropChancePct || a.nameFr.localeCompare(b.nameFr, 'fr')
    )
  }
}
