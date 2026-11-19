import * as React from 'react'
import type { RouteKind } from '@shared/schemas/navigation.schema'
import { normalizeBookmarksOrder } from '@shared/schemas/settings.schema'
import {
  BOOKMARK_DEFINITIONS,
  resolveBookmarkLabel,
  type BookmarkDefinition
} from '@/lib/bookmarks-catalog'
import { useUiTranslations } from '@/lib/i18n'
import { getTabCurrentRoute } from '@/lib/tab-helpers'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'
import { useWfmAccountStore } from '@/stores/useWfmAccountStore'

export function BookmarksBar(): React.JSX.Element | null {
  const { t } = useUiTranslations()
  const lang = useAppStore((s) => s.settings.market.language)
  const bookmarksBarVisible = useAppStore((s) => s.settings.appearance.bookmarksBarVisible)
  const bookmarksIconsOnly = useAppStore((s) => s.settings.appearance.bookmarksIconsOnly)
  const bookmarksExpandOnHover = useAppStore((s) => s.settings.appearance.bookmarksExpandOnHover)
  const bookmarksOrder = useAppStore((s) => s.settings.appearance.bookmarksOrder)
  const hiddenBookmarks = useAppStore((s) => s.settings.appearance.hiddenBookmarks)

  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)
  const hubActive = useTabsStore((s) => s.hubActive)
  const activeTab = useTabsStore((s) => s.tabs.find((tab) => tab.id === s.activeTabId) ?? s.tabs[0])

  const favoritesCount = useAppStore((s) => s.settings.favorites.length)
  const cartCount = useAppStore((s) => s.settings.cart.length)
  const ownSellCount = useWfmAccountStore((s) =>
    s.session.connected && s.overview ? s.overview.sellOrders.length : 0
  )

  const visibleItems = React.useMemo(() => {
    const hiddenSet = new Set(hiddenBookmarks)
    return normalizeBookmarksOrder(bookmarksOrder)
      .filter((id) => !hiddenSet.has(id))
      .map((id) => BOOKMARK_DEFINITIONS[id])
  }, [bookmarksOrder, hiddenBookmarks])

  if (hubActive || !bookmarksBarVisible || visibleItems.length === 0) {
    return null
  }

  const currentKind: RouteKind | null = activeTab ? getTabCurrentRoute(activeTab).kind : null

  const getBadgeCount = (kind: RouteKind): number => {
    if (kind === 'market-favorites') return favoritesCount
    if (kind === 'market-cart') return cartCount
    if (kind === 'wfm-account') return ownSellCount
    return 0
  }

  const renderShortcutButton = (item: BookmarkDefinition): React.JSX.Element => {
    const Icon = item.icon
    const isActive = currentKind === item.id
    const badgeCount = getBadgeCount(item.id)
    const label = resolveBookmarkLabel(item, t, lang)

    return (
      <button
        key={item.id}
        type="button"
        aria-label={label}
        title={`${label} (${item.tooltip}) — Ctrl+Clic ou clic molette : nouvel onglet`}
        onClick={(e) => {
          if (e.ctrlKey || e.metaKey) {
            openTab(item.route)
          } else {
            navigateActive(item.route)
          }
        }}
        onMouseDown={(e) => {
          if (e.button === 1) e.preventDefault()
        }}
        onAuxClick={(e) => {
          if (e.button === 1) {
            e.preventDefault()
            openTab(item.route)
          }
        }}
        data-active={isActive ? 'true' : 'false'}
        className={cn(
          'wf-bookmark-link wf-interactive-btn inline-flex h-6 shrink-0 items-center justify-center rounded-md border text-xs font-medium transition-colors',
          bookmarksIconsOnly ? 'px-2' : 'gap-1.5 px-2.5',
          isActive
            ? 'border-primary/50 bg-primary/15 text-foreground'
            : 'border-transparent text-muted-foreground hover:border-border/60 hover:bg-secondary/75 hover:text-foreground'
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
        {!bookmarksIconsOnly ? (
          <span className="whitespace-nowrap">{label}</span>
        ) : bookmarksExpandOnHover ? (
          <span className="wf-bookmark-expand-wrap">
            <span className="wf-bookmark-expand-inner">{label}</span>
          </span>
        ) : null}
        {badgeCount > 0 && (
          <span
            className={cn(
              'rounded-full bg-primary/20 px-1.5 py-0 font-mono text-[10px] font-semibold text-primary',
              bookmarksIconsOnly && 'ml-1'
            )}
          >
            {badgeCount}
          </span>
        )}
      </button>
    )
  }

  const historyItem = visibleItems.find((i) => i.id === 'browser-history')
  const historyIsLast =
    historyItem !== undefined && visibleItems[visibleItems.length - 1]?.id === 'browser-history'
  const centerItems = historyIsLast
    ? visibleItems.filter((i) => i.id !== 'browser-history')
    : visibleItems

  return (
    <div
      onWheel={(e) => {
        if (e.currentTarget.scrollWidth > e.currentTarget.clientWidth && e.deltaY !== 0) {
          e.currentTarget.scrollLeft += e.deltaY
        }
      }}
      className="wf-shell-bar wf-no-scrollbar flex h-8 shrink-0 items-center gap-2 overflow-x-auto border-b border-border bg-card/55 px-2.5 lg:grid lg:grid-cols-[1fr_auto_1fr]"
      role="navigation"
      aria-label="Barre de raccourcis et outils"
    >
      <div className="hidden lg:block" aria-hidden="true" />

      <div className="flex shrink-0 items-center justify-center gap-1 justify-self-center">
        {centerItems.map(renderShortcutButton)}
      </div>

      <div className="ml-auto flex shrink-0 items-center justify-self-end lg:ml-0">
        {historyIsLast && historyItem ? renderShortcutButton(historyItem) : null}
      </div>
    </div>
  )
}
