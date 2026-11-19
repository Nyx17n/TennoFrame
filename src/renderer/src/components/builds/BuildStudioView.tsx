import * as React from 'react'
import { Copy, Download, Plus, Save, Shield, Trash2, Wrench } from 'lucide-react'
import {
  decodeBuildShareCode,
  encodeBuildShareCode,
  type BuildCatalogPayload,
  type BuildModCatalogEntry,
  type BuildPriceQuote,
  type SavedBuild
} from '@shared/schemas/pro-tools.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  computeBuildCapacitySummary,
  createBlankBuild
} from '@/components/builds/build-capacity-math'
import { BuildCostSidebar } from '@/components/builds/BuildCostSidebar'
import { BuildPickerModal, type PickerTarget } from '@/components/builds/BuildPickerModal'
import { BuildSlotsGrid } from '@/components/builds/BuildSlotsGrid'
import { getProToolsStrings } from '@/lib/i18n/pro-tools-i18n'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { notify } from '@/stores/useNotificationStore'

export function BuildStudioView(): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const copy = getProToolsStrings(lang)

  const [catalog, setCatalog] = React.useState<BuildCatalogPayload | null>(null)
  const [builds, setBuilds] = React.useState<SavedBuild[]>([])
  const [activeBuild, setActiveBuild] = React.useState<SavedBuild | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [picker, setPicker] = React.useState<PickerTarget | null>(null)
  const [quote, setQuote] = React.useState<BuildPriceQuote | null>(null)
  const [loadingQuote, setLoadingQuote] = React.useState(false)
  const [importCodeText, setImportCodeText] = React.useState('')

  React.useEffect(() => {
    void Promise.all([ipcClient.proTools.buildsGetCatalog(), ipcClient.proTools.buildsList()])
      .then(([cat, saved]) => {
        setCatalog(cat)
        setBuilds(saved)
        if (saved[0]) {
          setActiveBuild(saved[0])
        } else if (cat.equipment[0]) {
          setActiveBuild(createBlankBuild(cat.equipment[0]))
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const modById = React.useMemo(() => {
    const map = new Map<string, BuildModCatalogEntry>()
    for (const m of catalog?.mods ?? []) map.set(m.id, m)
    return map
  }, [catalog])

  const persistCurrentBuild = async (draft: SavedBuild): Promise<void> => {
    setActiveBuild(draft)
    const nextList = await ipcClient.proTools.buildsSave(draft)
    setBuilds(nextList)
  }

  const runPriceCheck = async (forceRefresh = false): Promise<void> => {
    if (!activeBuild) return
    setLoadingQuote(true)
    try {
      await persistCurrentBuild(activeBuild)
      const res = await ipcClient.proTools.buildsPriceCheck(activeBuild.id, forceRefresh)
      setQuote(res)
    } finally {
      setLoadingQuote(false)
    }
  }

  const handleCopyShareCode = async (): Promise<void> => {
    if (!activeBuild) return
    const code = encodeBuildShareCode(activeBuild)
    await ipcClient.clipboard.writeText(code)
    notify({
      kind: 'success',
      title: 'Code Build copié',
      message: 'Partagez ce code tf-build://v1… avec un autre joueur TennoFrame.'
    })
  }

  const handleImportCode = async (): Promise<void> => {
    if (!importCodeText.trim()) return
    try {
      const imported = decodeBuildShareCode(importCodeText)
      await persistCurrentBuild(imported)
      setImportCodeText('')
      setQuote(null)
      notify({ kind: 'success', title: 'Build importé', message: imported.title })
    } catch (err) {
      notify({
        kind: 'error',
        title: 'Code invalide',
        message: err instanceof Error ? err.message : 'Format tf-build://v1 invalide'
      })
    }
  }

  if (loading || !catalog || !activeBuild) {
    return (
      <main className="mx-auto max-w-6xl space-y-4 p-4">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </main>
    )
  }

  const cap = computeBuildCapacitySummary(activeBuild, modById)

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            <h1 className="text-sm font-bold">{copy.buildsTitle}</h1>
          </div>
          <p className="text-xs text-muted-foreground">{copy.buildsSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button size="sm" variant="outline" onClick={() => setPicker({ mode: 'equipment' })}>
            <Plus className="h-3.5 w-3.5" />
            <span>{copy.buildsNewBtn}</span>
          </Button>
          <Button size="sm" variant="outline" onClick={() => void handleCopyShareCode()}>
            <Copy className="h-3.5 w-3.5" />
            <span>{copy.buildsCopyCodeBtn}</span>
          </Button>
          <Button
            size="sm"
            onClick={() => {
              void persistCurrentBuild(activeBuild).then(() =>
                notify({ kind: 'success', title: 'Build sauvegardé', message: activeBuild.title })
              )
            }}
          >
            <Save className="h-3.5 w-3.5" />
            <span>Sauvegarder</span>
          </Button>
        </div>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-2 p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeBuild.id}
            onChange={(e) => {
              const found = builds.find((b) => b.id === e.target.value)
              if (found) {
                setActiveBuild(found)
                setQuote(null)
              }
            }}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs font-semibold"
          >
            {builds.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
          <Input
            value={activeBuild.title}
            onChange={(e) => setActiveBuild({ ...activeBuild, title: e.target.value })}
            className="h-8 w-56 text-xs"
            placeholder="Titre du Build"
          />
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => {
              void ipcClient.proTools.buildsDelete(activeBuild.id).then((rest) => {
                setBuilds(rest)
                if (rest[0]) setActiveBuild(rest[0])
              })
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-1.5">
          <Input
            value={importCodeText}
            onChange={(e) => setImportCodeText(e.target.value)}
            placeholder="Coller tf-build://v1…"
            className="h-8 w-44 text-xs"
          />
          <Button size="sm" variant="secondary" onClick={() => void handleImportCode()}>
            <Download className="h-3.5 w-3.5" />
            <span>Importer</span>
          </Button>
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="default" className="gap-1">
            <Shield className="h-3 w-3" />
            {activeBuild.equipmentNameFr}
          </Badge>
          <span className={cap.remainingCapacity >= 0 ? 'font-bold text-emerald-400' : 'font-bold text-rose-400'}>
            Capacité restante : {cap.remainingCapacity} / {cap.baseCapacity + cap.auraBonus}
          </span>
          <Badge variant="outline">{cap.formaCount} Forma(s)</Badge>
        </div>
        <button
          type="button"
          onClick={() =>
            setActiveBuild({
              ...activeBuild,
              orokinReactorInstalled: !activeBuild.orokinReactorInstalled
            })
          }
          className="rounded bg-secondary px-2 py-1 text-[11px] font-semibold"
        >
          Réacteur / Catalyseur Orokin : {activeBuild.orokinReactorInstalled ? 'Oui (60)' : 'Non (30)'}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <BuildSlotsGrid
          build={activeBuild}
          catalog={catalog}
          modById={modById}
          onChange={setActiveBuild}
          onOpenPicker={setPicker}
        />
        <BuildCostSidebar
          build={activeBuild}
          modById={modById}
          quote={quote}
          loadingQuote={loadingQuote}
          onRunPriceCheck={(force) => void runPriceCheck(force)}
        />
      </div>

      {picker && (
        <BuildPickerModal
          target={picker}
          catalog={catalog}
          onClose={() => setPicker(null)}
          onSelectEquipment={(eq) => {
            const fresh = createBlankBuild(eq)
            void persistCurrentBuild(fresh)
            setQuote(null)
            setPicker(null)
          }}
          onSelectMod={(mod) => {
            if (picker.mode !== 'mod') return
            if (picker.targetSlot === 'aura') {
              setActiveBuild({
                ...activeBuild,
                auraOrStanceSlot: { ...activeBuild.auraOrStanceSlot, modId: mod.id }
              })
            } else if (picker.targetSlot === 'exilus') {
              setActiveBuild({
                ...activeBuild,
                exilusSlot: { ...activeBuild.exilusSlot, modId: mod.id }
              })
            } else {
              const slotIdx = picker.targetSlot
              setActiveBuild({
                ...activeBuild,
                mainSlots: activeBuild.mainSlots.map((s, i) =>
                  i === slotIdx ? { ...s, modId: mod.id } : s
                )
              })
            }
            setPicker(null)
          }}
          onSelectArcane={(arc) => {
            if (picker.mode !== 'arcane') return
            setActiveBuild({
              ...activeBuild,
              arcaneSlots: activeBuild.arcaneSlots.map((a, i) =>
                i === picker.slotIndex
                  ? { ...a, marketSlug: arc.slug, nameFr: arc.nameFr, nameEn: arc.nameEn }
                  : a
              )
            })
            setPicker(null)
          }}
        />
      )}
    </main>
  )
}
