import * as React from 'react'
import { ArrowDown, ArrowUp, Compass, Eye, EyeOff, RotateCcw } from 'lucide-react'
import {
  BOOKMARK_ITEM_IDS,
  normalizeBookmarksOrder,
  type BookmarkItemId
} from '@shared/schemas/settings.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BOOKMARK_DEFINITIONS, resolveBookmarkLabel } from '@/lib/bookmarks-catalog'
import { useUiTranslations } from '@/lib/i18n'
import { useAppStore } from '@/stores/useAppStore'

export function BookmarksOrderSection(): React.JSX.Element {
  const { t } = useUiTranslations()
  const lang = useAppStore((s) => s.settings.market.language)
  const bookmarksBarVisible = useAppStore((s) => s.settings.appearance.bookmarksBarVisible)
  const bookmarksOrder = useAppStore((s) => s.settings.appearance.bookmarksOrder)
  const hiddenBookmarks = useAppStore((s) => s.settings.appearance.hiddenBookmarks)
  const updateSettings = useAppStore((s) => s.updateSettings)

  const orderedIds = React.useMemo(
    () => normalizeBookmarksOrder(bookmarksOrder),
    [bookmarksOrder]
  )
  const hiddenSet = React.useMemo(() => new Set(hiddenBookmarks), [hiddenBookmarks])
  const visibleCount = orderedIds.filter((id) => !hiddenSet.has(id)).length

  const moveItem = (index: number, delta: -1 | 1): void => {
    const targetIdx = index + delta
    if (targetIdx < 0 || targetIdx >= orderedIds.length) return
    const next = [...orderedIds]
    const current = next[index]!
    next[index] = next[targetIdx]!
    next[targetIdx] = current
    void updateSettings({ appearance: { bookmarksOrder: next } })
  }

  const toggleVisibility = (id: BookmarkItemId): void => {
    const nextHidden = hiddenSet.has(id)
      ? hiddenBookmarks.filter((h) => h !== id)
      : [...hiddenBookmarks, id]
    void updateSettings({ appearance: { hiddenBookmarks: nextHidden } })
  }

  const resetDefaults = (): void => {
    void updateSettings({
      appearance: {
        bookmarksBarVisible: true,
        bookmarksOrder: [...BOOKMARK_ITEM_IDS],
        hiddenBookmarks: []
      }
    })
  }

  return (
    <Card className="space-y-3 border-border/80 bg-card/60 p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-primary">
              Barre de Raccourcis (Ordre & Visibilité)
            </h3>
            <Badge variant="outline" className="text-[10px]">
              {visibleCount} / {orderedIds.length} affichés
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Choisissez l’ordre exact des onglets sous la barre d’adresse avec les flèches ↑ / ↓ et masquez ceux dont vous n’avez pas besoin.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" onClick={resetDefaults} title="Rétablir l’ordre par défaut">
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Par défaut</span>
          </Button>
          <Button
            size="sm"
            variant={bookmarksBarVisible ? 'default' : 'secondary'}
            onClick={() =>
              void updateSettings({
                appearance: { bookmarksBarVisible: !bookmarksBarVisible }
              })
            }
          >
            {bookmarksBarVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{bookmarksBarVisible ? 'Barre affichée' : 'Barre masquée'}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-1.5 sm:grid-cols-2">
        {orderedIds.map((id, idx) => {
          const def = BOOKMARK_DEFINITIONS[id]
          const Icon = def.icon
          const isHidden = hiddenSet.has(id)
          const label = resolveBookmarkLabel(def, t, lang)

          return (
            <div
              key={id}
              className={`flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                isHidden
                  ? 'border-border/40 bg-background/30 opacity-55'
                  : 'border-border/80 bg-background/60'
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="w-5 shrink-0 font-mono text-[10px] text-muted-foreground">
                  #{idx + 1}
                </span>
                <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className={`truncate font-semibold ${isHidden ? 'line-through' : ''}`}>
                  {label}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveItem(idx, -1)}
                  className="flex h-6 w-6 items-center justify-center rounded border border-border bg-secondary/40 hover:border-primary disabled:opacity-30"
                  title="Monter"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={idx === orderedIds.length - 1}
                  onClick={() => moveItem(idx, 1)}
                  className="flex h-6 w-6 items-center justify-center rounded border border-border bg-secondary/40 hover:border-primary disabled:opacity-30"
                  title="Descendre"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleVisibility(id)}
                  className={`flex h-6 items-center gap-1 rounded px-2 text-[10px] font-semibold ${
                    isHidden
                      ? 'bg-secondary text-muted-foreground hover:text-foreground'
                      : 'bg-emerald-600/85 text-white hover:bg-emerald-600'
                  }`}
                  title={isHidden ? 'Afficher cet onglet' : 'Masquer cet onglet'}
                >
                  {isHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  <span>{isHidden ? 'Masqué' : 'Affiché'}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
