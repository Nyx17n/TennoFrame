import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { z } from 'zod'
import {
  SavedBuildSchema,
  type BuildPriceCheckLine,
  type BuildPriceQuote,
  type SavedBuild
} from '@shared/schemas/pro-tools.schema'
import type { CodexRepository } from './CodexRepository'
import type { MarketApiService } from './MarketApiService'

const SavedBuildsFileSchema = z.object({
  initializedStarters: z.boolean().default(false),
  builds: z.array(SavedBuildSchema).max(200).default([])
})

type SavedBuildsFile = z.infer<typeof SavedBuildsFileSchema>

function createStarterBuilds(): SavedBuild[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'starter-revenant-mesmer',
      title: 'Revenant — Immortal Mesmer & Roar (Steel Path)',
      equipmentCategory: 'warframes',
      equipmentId: 'revenant',
      equipmentNameFr: 'Revenant',
      equipmentNameEn: 'Revenant',
      orokinReactorInstalled: true,
      auraOrStanceSlot: {
        slotIndex: 0,
        modId: 'corrosive-projection',
        formaPolarity: 'naramon',
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
      mainSlots: [
        { slotIndex: 0, modId: 'blind-rage', formaPolarity: 'madurai', useMaxRank: true, owned: false },
        { slotIndex: 1, modId: 'primed-continuity', formaPolarity: 'madurai', useMaxRank: true, owned: false },
        { slotIndex: 2, modId: 'primed-flow', formaPolarity: 'naramon', useMaxRank: true, owned: false },
        { slotIndex: 3, modId: 'rolling-guard', formaPolarity: 'vazarin', useMaxRank: true, owned: false },
        { slotIndex: 4, modId: 'stretch', formaPolarity: 'none', useMaxRank: true, owned: true },
        { slotIndex: 5, modId: null, formaPolarity: 'none', useMaxRank: true, owned: false },
        { slotIndex: 6, modId: null, formaPolarity: 'none', useMaxRank: true, owned: false },
        { slotIndex: 7, modId: null, formaPolarity: 'none', useMaxRank: true, owned: false }
      ],
      arcaneSlots: [
        {
          slotIndex: 0,
          marketSlug: 'molt_augmented',
          nameFr: 'Mue Augmentée',
          nameEn: 'Molt Augmented',
          useMaxRank: true,
          owned: false
        },
        {
          slotIndex: 1,
          marketSlug: 'molt_efficiency',
          nameFr: 'Mue d’Efficacité',
          nameEn: 'Molt Efficiency',
          useMaxRank: true,
          owned: false
        }
      ],
      subsumedWarframeId: 'rhino',
      replacedAbilitySlot: 4,
      archonShards: [
        { color: 'crimson', tauforged: true, buffLabel: '+15 % Puissance de Pouvoir' },
        { color: 'crimson', tauforged: true, buffLabel: '+15 % Puissance de Pouvoir' },
        { color: 'amber', tauforged: true, buffLabel: '+37.5 % Vitesse de Lancement' }
      ],
      notes: 'Priorisez la Puissance de Pouvoir pour maximiser les charges de Linceul Hypnotique et le bonus de Rugissement (Roar).',
      updatedAtIso: now
    },
    {
      id: 'starter-saryn-spores',
      title: 'Saryn Prime — Spores & Nuke ESO / Route de l’Acier',
      equipmentCategory: 'warframes',
      equipmentId: 'saryn-prime',
      equipmentNameFr: 'Saryn Prime',
      equipmentNameEn: 'Saryn Prime',
      orokinReactorInstalled: true,
      auraOrStanceSlot: {
        slotIndex: 0,
        modId: 'brief-respite',
        formaPolarity: 'zenurik',
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
      mainSlots: [
        { slotIndex: 0, modId: 'overextended', formaPolarity: 'vazarin', useMaxRank: true, owned: false },
        { slotIndex: 1, modId: 'stretch', formaPolarity: 'naramon', useMaxRank: true, owned: true },
        { slotIndex: 2, modId: 'primed-continuity', formaPolarity: 'madurai', useMaxRank: true, owned: false },
        { slotIndex: 3, modId: 'blind-rage', formaPolarity: 'madurai', useMaxRank: true, owned: false },
        { slotIndex: 4, modId: 'primed-flow', formaPolarity: 'naramon', useMaxRank: true, owned: false },
        { slotIndex: 5, modId: 'rolling-guard', formaPolarity: 'vazarin', useMaxRank: true, owned: false },
        { slotIndex: 6, modId: null, formaPolarity: 'none', useMaxRank: true, owned: false },
        { slotIndex: 7, modId: null, formaPolarity: 'none', useMaxRank: true, owned: false }
      ],
      arcaneSlots: [
        {
          slotIndex: 0,
          marketSlug: 'arcane_energize',
          nameFr: 'Arcane Énergétique',
          nameEn: 'Arcane Energize',
          useMaxRank: true,
          owned: false
        },
        {
          slotIndex: 1,
          marketSlug: 'molt_augmented',
          nameFr: 'Mue Augmentée',
          nameEn: 'Molt Augmented',
          useMaxRank: true,
          owned: false
        }
      ],
      subsumedWarframeId: 'grendel',
      replacedAbilitySlot: 2,
      archonShards: [
        { color: 'emerald', tauforged: true, buffLabel: '+2 Cumuls max de Statut Corrosif' },
        { color: 'emerald', tauforged: false, buffLabel: '+2 Cumuls max de Statut Corrosif' }
      ],
      notes: '2 Fragments d’Archonte Émeraude permettent un strip d’armure à 100 % avec les Spores Corrosives.',
      updatedAtIso: now
    },
    {
      id: 'starter-torid-incarnon',
      title: 'Torid — Rayon Incarnon Critique & Viral',
      equipmentCategory: 'weapons',
      equipmentId: 'torid',
      equipmentNameFr: 'Torid',
      equipmentNameEn: 'Torid',
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
      mainSlots: [
        { slotIndex: 0, modId: 'galvanized-chamber', formaPolarity: 'madurai', useMaxRank: true, owned: false },
        { slotIndex: 1, modId: 'critical-delay', formaPolarity: 'madurai', useMaxRank: true, owned: false },
        { slotIndex: 2, modId: 'vital-sense', formaPolarity: 'madurai', useMaxRank: true, owned: true },
        { slotIndex: 3, modId: 'rime-rounds', formaPolarity: 'vazarin', useMaxRank: true, owned: false },
        { slotIndex: 4, modId: 'malignant-force', formaPolarity: 'madurai', useMaxRank: true, owned: true },
        { slotIndex: 5, modId: null, formaPolarity: 'none', useMaxRank: true, owned: false },
        { slotIndex: 6, modId: null, formaPolarity: 'none', useMaxRank: true, owned: false },
        { slotIndex: 7, modId: null, formaPolarity: 'none', useMaxRank: true, owned: false }
      ],
      arcaneSlots: [
        {
          slotIndex: 0,
          marketSlug: 'primary_merciless',
          nameFr: 'Implacable - Principal',
          nameEn: 'Primary Merciless',
          useMaxRank: true,
          owned: false
        }
      ],
      subsumedWarframeId: null,
      replacedAbilitySlot: null,
      archonShards: [],
      notes: 'Chargez la jauge Incarnon en 2 tirs directs sur le corps (pas besoin de tirs à la tête sur le Torid).',
      updatedAtIso: now
    }
  ]
}

export class BuildsService {
  private readonly filePath: string
  private state: SavedBuildsFile | null = null

  constructor(
    userDataPath: string,
    private readonly codex: CodexRepository,
    private readonly marketApi: MarketApiService
  ) {
    this.filePath = join(userDataPath, 'builds.json')
  }

  private async ensureLoaded(): Promise<SavedBuildsFile> {
    if (this.state) return this.state

    try {
      const raw = await fs.readFile(this.filePath, 'utf-8')
      const parsed = SavedBuildsFileSchema.safeParse(JSON.parse(raw))
      if (parsed.success) {
        this.state = parsed.data
        return this.state
      }
    } catch {
      // First run: initialize starter builds
    }

    this.state = {
      initializedStarters: true,
      builds: createStarterBuilds()
    }
    await this.persistAtomic(this.state)
    return this.state
  }

  private async persistAtomic(next: SavedBuildsFile): Promise<void> {
    await fs.mkdir(dirname(this.filePath), { recursive: true })
    const tmp = `${this.filePath}.tmp`
    await fs.writeFile(tmp, JSON.stringify(next, null, 2), 'utf-8')
    await fs.rename(tmp, this.filePath)
  }

  public async listBuilds(): Promise<SavedBuild[]> {
    const file = await this.ensureLoaded()
    return file.builds
  }

  public async saveBuild(build: SavedBuild): Promise<SavedBuild[]> {
    const file = await this.ensureLoaded()
    const updated: SavedBuild = {
      ...build,
      updatedAtIso: new Date().toISOString()
    }
    const existingIdx = file.builds.findIndex((b) => b.id === updated.id)
    const nextList =
      existingIdx >= 0
        ? file.builds.map((b, i) => (i === existingIdx ? updated : b))
        : [updated, ...file.builds].slice(0, 200)

    this.state = { ...file, builds: nextList }
    await this.persistAtomic(this.state)
    return nextList
  }

  public async deleteBuild(buildId: string): Promise<SavedBuild[]> {
    const file = await this.ensureLoaded()
    const nextList = file.builds.filter((b) => b.id !== buildId)
    this.state = { ...file, builds: nextList }
    await this.persistAtomic(this.state)
    return nextList
  }

  public async priceCheckBuild(buildId: string, forceRefresh = false): Promise<BuildPriceQuote> {
    const file = await this.ensureLoaded()
    const build = file.builds.find((b) => b.id === buildId)
    if (!build) {
      throw new Error(`Build introuvable : ${buildId}`)
    }

    const catalog = await this.codex.getBuildStudioCatalog()
    const modById = new Map(catalog.mods.map((m) => [m.id, m]))
    const arcaneBySlug = new Map(catalog.arcanes.map((a) => [a.slug, a]))

    const lines: BuildPriceCheckLine[] = []
    const allModSlots = [build.auraOrStanceSlot, build.exilusSlot, ...build.mainSlots]

    for (const slot of allModSlots) {
      if (!slot.modId) continue
      const modMeta = modById.get(slot.modId)
      if (!modMeta) continue
      const targetRank = slot.useMaxRank ? modMeta.maxRank : 0
      const marketSlug = modMeta.tradable
        ? await this.codex.resolveModMarketSlug(modMeta.id)
        : null

      let unitPlat: number | null = null
      if (marketSlug) {
        try {
          const orders = await this.marketApi.getItemOrders(marketSlug, forceRefresh)
          const sells = orders
            .filter(
              (o) =>
                o.type === 'sell' &&
                (o.user?.status === 'ingame' || o.user?.status === 'online') &&
                (slot.useMaxRank ? o.rank === targetRank : (o.rank ?? 0) === 0)
            )
            .sort((a, b) => a.platinum - b.platinum)
          const fallbackAnyRank =
            sells.length === 0
              ? orders
                  .filter(
                    (o) =>
                      o.type === 'sell' &&
                      (o.user?.status === 'ingame' || o.user?.status === 'online')
                  )
                  .sort((a, b) => a.platinum - b.platinum)
              : sells
          unitPlat = fallbackAnyRank[0]?.platinum ?? null
        } catch {
          unitPlat = null
        }
      }

      lines.push({
        key: `mod:${modMeta.id}:${lines.length}`,
        kind: 'mod',
        codexModId: modMeta.id,
        marketSlug,
        nameFr: modMeta.nameFr,
        nameEn: modMeta.nameEn,
        imageUrl: modMeta.imageUrl,
        targetRank,
        owned: slot.owned,
        tradable: modMeta.tradable,
        unitPlat
      })
    }

    for (const arc of build.arcaneSlots) {
      if (!arc.marketSlug) continue
      const arcMeta = arcaneBySlug.get(arc.marketSlug)
      const maxRank = arcMeta?.maxRank ?? 5
      const targetRank = arc.useMaxRank ? maxRank : 0

      let unitPlat: number | null = null
      try {
        const orders = await this.marketApi.getItemOrders(arc.marketSlug, forceRefresh)
        const matching = orders
          .filter(
            (o) =>
              o.type === 'sell' &&
              (o.user?.status === 'ingame' || o.user?.status === 'online') &&
              (arc.useMaxRank ? o.rank === targetRank : (o.rank ?? 0) === 0)
          )
          .sort((a, b) => a.platinum - b.platinum)
        unitPlat = matching[0]?.platinum ?? null
      } catch {
        unitPlat = null
      }

      lines.push({
        key: `arc:${arc.marketSlug}:${arc.slotIndex}`,
        kind: 'arcane',
        codexModId: arcMeta?.codexId ?? null,
        marketSlug: arc.marketSlug,
        nameFr: arcMeta?.nameFr ?? (arc.nameFr || arc.marketSlug),
        nameEn: arcMeta?.nameEn ?? (arc.nameEn || arc.marketSlug),
        imageUrl: arcMeta?.imageUrl ?? null,
        targetRank,
        owned: arc.owned,
        tradable: true,
        unitPlat
      })
    }

    let totalPlatAllItems = 0
    let remainingPlatToBuy = 0
    for (const ln of lines) {
      if (ln.unitPlat !== null) {
        totalPlatAllItems += ln.unitPlat
        if (!ln.owned) {
          remainingPlatToBuy += ln.unitPlat
        }
      }
    }

    return {
      buildId: build.id,
      totalPlatAllItems,
      remainingPlatToBuy,
      lines
    }
  }
}
