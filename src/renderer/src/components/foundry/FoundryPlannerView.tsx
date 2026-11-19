import * as React from 'react'
import { Hammer, Pin, Plus, Search, Trash2, X } from 'lucide-react'
import type { CodexSummaryCard } from '@shared/schemas/codex.schema'
import type { FoundryState } from '@shared/schemas/pro-tools.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { Skeleton } from '@/components/ui/skeleton'
import { FoundryResourceList } from '@/components/foundry/FoundryResourceList'
import { getProToolsStrings } from '@/lib/i18n/pro-tools-i18n'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { useFarmOverlayStore } from '@/stores/useFarmOverlayStore'
import { notify } from '@/stores/useNotificationStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function FoundryPlannerView(): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const copy = getProToolsStrings(lang)
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const toggleOverlayEntry = useFarmOverlayStore((s) => s.toggleEntry)

  const [state, setState] = React.useState<FoundryState | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [suggestions, setSuggestions] = React.useState<CodexSummaryCard[]>([])

  React.useEffect(() => {
    void ipcClient.proTools
      .foundryGet()
      .then(setState)
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => {
    const q = searchQuery.trim()
    if (q.length < 2) {
      setSuggestions([])
      return
    }
    let cancelled = false
    void ipcClient.codex.quickSearch(q, 14).then((cards) => {
      if (!cancelled) {
        setSuggestions(
          cards.filter((c) => c.category === 'warframes' || c.category === 'weapons').slice(0, 6)
        )
      }
    })
    return () => {
      cancelled = true
    }
  }, [searchQuery])

  const handleAddProject = async (card: CodexSummaryCard): Promise<void> => {
    if (card.category !== 'warframes' && card.category !== 'weapons') return
    const next = await ipcClient.proTools.foundryAddProject({
      category: card.category,
      id: card.id
    })
    setState(next)
    setSearchQuery('')
    setSuggestions([])
    notify({
      kind: 'success',
      title: 'Ajouté à la Fonderie',
      message: `${card.nameFr} ajouté à votre liste de crafts.`
    })
  }

  const handlePinMissingToOverlay = async (): Promise<void> => {
    if (!state) return
    const missing = state.resources.filter((r) => r.missingCount > 0 && r.topSources.length > 0)
    for (const res of missing.slice(0, 24)) {
      await toggleOverlayEntry(
        {
          entryId: `resources:${res.resourceId}:foundry`,
          itemKey: `resources:${res.resourceId}`,
          category: 'resources',
          itemId: res.resourceId,
          itemNameFr: res.nameFr,
          partKey: null,
          labelFr: `${res.nameFr} (Manque ${res.missingCount})`,
          groupLabelFr: 'Planificateur Fonderie',
          imageUrl: res.imageUrl,
          isResource: true,
          requiredCount: res.missingCount,
          obtained: false,
          sources: res.topSources
        },
        true
      )
    }
    notify({
      kind: 'info',
      title: 'Ressources épinglées sur Alt+O',
      message: `${missing.length} ressource(s) manquante(s) affichée(s) sur votre HUD en jeu.`
    })
  }

  if (loading || !state) {
    return (
      <main className="mx-auto max-w-6xl space-y-4 p-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Hammer className="h-4 w-4 text-primary" />
            <h1 className="text-sm font-bold">{copy.foundryTitle}</h1>
          </div>
          <p className="text-xs text-muted-foreground">{copy.foundrySubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            disabled={state.resources.length === 0}
            onClick={() => void handlePinMissingToOverlay()}
          >
            <Pin className="h-3.5 w-3.5" />
            <span>{copy.foundryPinOverlayBtn}</span>
          </Button>
          {state.projects.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => void ipcClient.proTools.foundryClear().then(setState)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Vider</span>
            </Button>
          )}
        </div>
      </div>

      <Card className="space-y-3 p-3.5">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-primary" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ajouter une Warframe ou Arme à crafter (ex: Gauss Prime, Torid, Wisp…)"
            className="pl-8 text-xs"
          />
          {suggestions.length > 0 && (
            <div className="mt-1 grid gap-1 rounded-md border border-border bg-popover p-1.5 shadow-lg sm:grid-cols-2">
              {suggestions.map((s) => (
                <button
                  key={`${s.category}:${s.id}`}
                  type="button"
                  onClick={() => void handleAddProject(s)}
                  className="flex items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-secondary"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <SafeAssetImage src={s.imageUrl} alt={s.nameFr} className="h-6 w-6 object-contain" />
                    <span className="truncate font-semibold">{s.nameFr}</span>
                  </div>
                  <Plus className="h-3.5 w-3.5 shrink-0 text-primary" />
                </button>
              ))}
            </div>
          )}
        </div>

        {state.projects.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap gap-1.5">
              {state.projects.map((proj) => (
                <Badge key={proj.key} variant="secondary" className="gap-1.5 py-1 pl-2 pr-1.5 text-xs">
                  <SafeAssetImage src={proj.imageUrl} alt={proj.nameFr} className="h-4 w-4 object-contain" />
                  <button
                    type="button"
                    onClick={() =>
                      navigateActive(
                        { kind: 'codex-detail', category: proj.category, slug: proj.id },
                        proj.nameFr
                      )
                    }
                    className="hover:underline"
                  >
                    {proj.nameFr}
                  </button>
                  <button
                    type="button"
                    onClick={() => void ipcClient.proTools.foundryRemoveProject(proj.key).then(setState)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span>
                Crédits Fonderie :{' '}
                <strong className="text-amber-400">{state.totalCredits.toLocaleString()} Cr</strong>
              </span>
              <Badge variant="outline">
                {state.completedResourcesCount} / {state.resources.length} matériaux prêts
              </Badge>
            </div>
          </div>
        )}
      </Card>

      <FoundryResourceList
        resources={state.resources}
        lang={lang}
        onUpdateOwned={(resourceKey, ownedCount) =>
          void ipcClient.proTools.foundrySetOwned({ resourceKey, ownedCount }).then(setState)
        }
        onOpenCodexResource={(resourceId, name) =>
          navigateActive({ kind: 'codex-detail', category: 'resources', slug: resourceId }, name)
        }
      />
    </main>
  )
}
