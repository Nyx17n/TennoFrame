import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

/**
 * Génère `resources/codex-arcanes.json` (100 % des Arcanes Warframe hors-ligne) en croisant :
 * 1. WFCD/warframe-items (Arcanes.json — icônes cdn.warframestat.us, raretés, types, drops %)
 * 2. calamity-inc/warframe-public-export-plus (ExportArcanes.json + dict.fr.json + dict.en.json — noms & rangs R0→R5 officiels FR/EN)
 * 3. resources/codex-mobs-vendors.json (offres des Marchands Syndicats & Packs Vosfor de Loid)
 */

const WFCD_ARCANES_URL =
  'https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Arcanes.json'
const BASE_EXPORT_URL =
  'https://raw.githubusercontent.com/calamity-inc/warframe-public-export-plus/senpai'

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function wfmSlugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function cleanText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\\n/g, ' · ')
    .replace(/\r?\n/g, ' · ')
    .replace(/\s+/g, ' ')
    .trim()
}

function resolveExportNode(node, dict) {
  if (typeof node === 'string') {
    return node.startsWith('/Lotus/') ? dict[node] || '' : node
  }
  if (!node || typeof node !== 'object') return ''
  let tpl = dict[node.tag] || ''
  if (node.sub && typeof node.sub === 'object') {
    for (const [key, subVal] of Object.entries(node.sub)) {
      const rep = resolveExportNode(subVal, dict)
      tpl = tpl.replaceAll(`|${key}|`, rep)
    }
  }
  return cleanText(tpl.replace(/\|[A-Z0-9_]+\|/gi, ''))
}

function classifySlotCategory(rawType) {
  switch (rawType) {
    case 'Warframe Arcane':
      return { slotCategory: 'warframe', typeLabelFr: 'Arcane de Warframe', typeLabelEn: 'Warframe Arcane' }
    case 'Primary Arcane':
    case 'Shotgun Arcane':
    case 'Bow Arcane':
      return { slotCategory: 'primary', typeLabelFr: 'Arcane d’Arme Principale', typeLabelEn: rawType }
    case 'Secondary Arcane':
      return { slotCategory: 'secondary', typeLabelFr: 'Arcane d’Arme Secondaire', typeLabelEn: 'Secondary Arcane' }
    case 'Melee Arcane':
      return { slotCategory: 'melee', typeLabelFr: 'Arcane de Mêlée', typeLabelEn: 'Melee Arcane' }
    case 'Operator Arcane':
    case 'Amp Arcane':
      return {
        slotCategory: 'operator_amp',
        typeLabelFr: rawType === 'Amp Arcane' ? 'Arcane d’Amplificateur' : 'Arcane d’Opérateur',
        typeLabelEn: rawType
      }
    case 'Zaw Arcane':
    case 'Kitgun Arcane':
      return {
        slotCategory: 'zaw_kitgun',
        typeLabelFr: rawType === 'Zaw Arcane' ? 'Arcane de Zaw' : 'Arcane de Kitgun',
        typeLabelEn: rawType
      }
    default:
      return null
  }
}

function inferVosforCollectionFr(nameEn, rawType) {
  const lower = nameEn.toLowerCase()
  if (lower.startsWith('exodia ') || (lower.startsWith('magus ') && ['vigor', 'husk', 'elevate', 'nourish', 'replenish', 'cadence', 'cloud'].some((k) => lower.includes(k))) || lower.startsWith('virtuos ')) {
    return 'Collection Cetus (200 Vosfor chez Loid — Sanctum Anatomica)'
  }
  if (lower.startsWith('pax ') || (lower.startsWith('magus ') && ['anomaly', 'destruct', 'drive', 'firewall', 'glitch', 'lockdown', 'melt', 'overload', 'repair', 'revert', 'accelerant'].some((k) => lower.includes(k)))) {
    return 'Collection Fortuna (200 Vosfor chez Loid — Sanctum Anatomica)'
  }
  if (lower.startsWith('molt ') || lower.startsWith('cascadia ') || lower.startsWith('eternal ') || lower.startsWith('emergence ') || lower.startsWith('fractalized ')) {
    return 'Collection Zariman / Néant (200 Vosfor chez Loid — Sanctum Anatomica)'
  }
  if (lower.startsWith('primary ') || lower.startsWith('secondary ') && ['merciless', 'deadhead', 'dexterity'].some((k) => lower.includes(k))) {
    return 'Collection Acolytes Route de l’Acier (200 Vosfor chez Loid — Sanctum Anatomica)'
  }
  if (lower.startsWith('melee ') && ['influence', 'exposure', 'animosity', 'duplicate', 'crescendo', 'fortification', 'retaliation', 'vortex'].some((k) => lower.includes(k))) {
    return 'Collection Cavia / Sanctum (200 Vosfor chez Loid & Oiseau-3)'
  }
  if (rawType === 'Warframe Arcane' && lower.startsWith('arcane ')) {
    return 'Collection Eidolon / Duviri / Vosfor (200 Vosfor chez Loid — Sanctum Anatomica)'
  }
  return 'Dissolution d’Arcanes (Packs Vosfor chez Loid — Sanctum Anatomica, Deimos)'
}

async function main() {
  const [wfcdList, expArcanes, dictFr, dictEn] = await Promise.all([
    fetch(WFCD_ARCANES_URL).then((r) => r.json()),
    fetch(`${BASE_EXPORT_URL}/ExportArcanes.json`).then((r) => r.json()),
    fetch(`${BASE_EXPORT_URL}/dict.fr.json`).then((r) => r.json()),
    fetch(`${BASE_EXPORT_URL}/dict.en.json`).then((r) => r.json())
  ])

  let vendors = []
  try {
    const mv = JSON.parse(readFileSync(resolve('resources/codex-mobs-vendors.json'), 'utf8'))
    vendors = mv.vendors || []
  } catch {
    vendors = []
  }

  const vendorByArcaneEn = new Map()
  for (const v of vendors) {
    for (const off of v.offerings || []) {
      const key = String(off.nameEn || '').toLowerCase().trim()
      if (!key) continue
      const costText = (off.costs || []).map((c) => `${c.amount} ${c.currencyFr}`).join(' + ')
      const list = vendorByArcaneEn.get(key) || []
      list.push({
        vendorNameFr: v.name,
        hubFr: [v.planetFr, v.hubFr].filter(Boolean).join(' · '),
        costFr: [costText, off.rankRequiredFr].filter(Boolean).join(' · ')
      })
      vendorByArcaneEn.set(key, list)
    }
  }

  const seenIds = new Set()
  const arcanes = []

  for (const item of wfcdList) {
    const slotInfo = classifySlotCategory(item.type)
    if (!slotInfo) continue

    const id = slugify(item.name)
    if (!id || seenIds.has(id)) continue
    seenIds.add(id)

    const exp = expArcanes[item.uniqueName]
    const nameFr = cleanText((exp && dictFr[exp.name]) || item.name)
    const nameEn = cleanText((exp && dictEn[exp.name]) || item.name)

    const wfcdLevels = Array.isArray(item.levelStats) ? item.levelStats : []
    const expLevels = Array.isArray(exp?.levelStats) ? exp.levelStats : []
    const levelCount = Math.max(wfcdLevels.length, expLevels.length, 6)
    const maxRank = Math.max(0, levelCount - 1)
    const copiesForMaxRank = maxRank === 5 ? 21 : maxRank === 3 ? 10 : maxRank + 1

    const levelStatsEn = wfcdLevels.map((lvl) =>
      cleanText((lvl.stats || []).join(' · '))
    )

    const levelStatsFr =
      expLevels.length > 0
        ? expLevels.map((lvlArr) => {
            const parts = Array.isArray(lvlArr)
              ? lvlArr.map((n) => resolveExportNode(n, dictFr)).filter(Boolean)
              : []
            return parts.join(' · ')
          })
        : levelStatsEn

    for (let i = 0; i < levelStatsFr.length; i += 1) {
      if (!levelStatsFr[i] && levelStatsEn[i]) {
        levelStatsFr[i] = levelStatsEn[i]
      }
    }

    const drops = (Array.isArray(item.drops) ? item.drops : [])
      .filter((d) => d && d.location)
      .slice(0, 18)
      .map((d) => ({
        location: cleanText(d.location),
        chancePct: Number(((Number(d.chance) || 0) <= 1 ? (Number(d.chance) || 0) * 100 : Number(d.chance)).toFixed(2)),
        rarity: String(d.rarity || item.rarity || 'Rare')
      }))

    // Note: WFCD Arcanes.json sometimes stores chance as 0..1 or 0..100; normalize >100 safe
    for (const d of drops) {
      if (d.chancePct > 100) d.chancePct = 100
    }

    const vendorSources = vendorByArcaneEn.get(nameEn.toLowerCase()) || []

    arcanes.push({
      id,
      marketSlug: wfmSlugify(nameEn),
      nameFr,
      nameEn,
      img: item.imageName || '',
      rarity: item.rarity || 'Rare',
      slotCategory: slotInfo.slotCategory,
      typeLabelFr: slotInfo.typeLabelFr,
      typeLabelEn: slotInfo.typeLabelEn,
      maxRank,
      copiesForMaxRank,
      tradable: item.tradable !== false,
      vosforHintFr: inferVosforCollectionFr(nameEn, item.type),
      levelStatsFr,
      levelStatsEn,
      drops,
      vendorSources: vendorSources.slice(0, 4)
    })
  }

  arcanes.sort((a, b) => a.nameFr.localeCompare(b.nameFr, 'fr'))

  const outPath = resolve('resources/codex-arcanes.json')
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, JSON.stringify({ arcanes }), 'utf8')
  console.log(`[extract-arcanes] Écrit ${outPath} (${arcanes.length} Arcanes complets FR/EN).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
