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

interface HoveredDockPill {
  readonly item: BookmarkDefinition
  readonly label: string
  readonly badgeCount: number
  readonly topPx: number
}

export function BookmarksBar(): React.JSX.Element | null {
  const { t } = useUiTranslations()
  const lang = useAppStore((s) => s.settings.market.language)
  const isCompactMode = useAppStore((s) => s.windowState.isCompactMode)
  const bookmarksBarVisible = useAppStore((s) => s.settings.appearance.bookmarksBarVisible)
  const bookmarksPosition = useAppStore((s) => s.settings.appearance.bookmarksPosition)
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

  const asideRef = React.useRef<HTMLElement | null>(null)
  const [hoveredDock, setHoveredDock] = React.useState<HoveredDockPill | null>(null)

  React.useEffect(() => {
    setHoveredDock(null)
  }, [bookmarksPosition, bookmarksIconsOnly, bookmarksExpandOnHover])

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

  const handleTrigger = (e: React.MouseEvent, item: BookmarkDefinition): void => {
    if (e.ctrlKey || e.metaKey) {
      openTab(item.route)
    } else {
      navigateActive(item.route)
    }
  }

  // VERTICAL DOCK MODE (LEFT OR RIGHT EDGE)
  if (bookmarksPosition === 'left' || bookmarksPosition === 'right') {
    const isRight = bookmarksPosition === 'right'
    const compactVerticalIcons = bookmarksIconsOnly || isCompactMode

    return (
      <aside
        ref={asideRef}
        onMouseLeave={() => setHoveredDock(null)}
        aria-label="Barre latérale de raccourcis"
        className={cn(
          'wf-shell-bar relative z-30 flex h-full shrink-0 flex-col border-border bg-card/55 py-2',
          isRight ? 'border-l' : 'border-r',
          compactVerticalIcons ? 'w-11 items-center px-1.5' : 'w-44 px-2'
        )}
      >
        <div
          onScroll={() => setHoveredDock(null)}
          className="wf-no-scrollbar flex w-full flex-1 flex-col gap-1 overflow-y-auto"
        >
          {visibleItems.map((item) => {
            const Icon = item.icon
            const isActive = currentKind === item.id
            const badgeCount = getBadgeCount(item.id)
            const label = resolveBookmarkLabel(item, t, lang)

            return (
              <button
                key={item.id}
                type="button"
                aria-label={label}
                title={
                  compactVerticalIcons && !bookmarksExpandOnHover
                    ? `${label} (${item.tooltip}) — Ctrl+Clic ou clic molette : nouvel onglet`
                    : `${item.tooltip} — Ctrl+Clic ou clic molette : nouvel onglet`
                }
                onMouseEnter={(e) => {
                  if (!compactVerticalIcons || !bookmarksExpandOnHover) return
                  const asideRect = asideRef.current?.getBoundingClientRect()
                  const btnRect = e.currentTarget.getBoundingClientRect()
                  if (!asideRect) return
                  setHoveredDock({
                    item,
                    label,
                    badgeCount,
                    topPx: btnRect.top - asideRect.top
                  })
                }}
                onFocus={(e) => {
                  if (!compactVerticalIcons || !bookmarksExpandOnHover) return
                  const asideRect = asideRef.current?.getBoundingClientRect()
                  const btnRect = e.currentTarget.getBoundingClientRect()
                  if (!asideRect) return
                  setHoveredDock({
                    item,
                    label,
                    badgeCount,
                    topPx: btnRect.top - asideRect.top
                  })
                }}
                onBlur={() => setHoveredDock(null)}
                onClick={(e) => handleTrigger(e, item)}
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
                  'wf-interactive-btn relative flex h-8 shrink-0 items-center rounded-md border text-xs font-medium transition-colors',
                  compactVerticalIcons ? 'w-8 justify-center' : 'w-full justify-between gap-2 px-2.5',
                  isActive
                    ? 'border-primary/50 bg-primary/15 text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border/60 hover:bg-secondary/75 hover:text-foreground'
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  {!compactVerticalIcons && <span className="truncate">{label}</span>}
                </span>
                {badgeCount > 0 &&
                  (compactVerticalIcons ? (
                    <span className="pointer-events-none absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[9px] font-bold text-primary-foreground">
                      {badgeCount}
                    </span>
                  ) : (
                    <span className="rounded-full bg-primary/20 px-1.5 py-0 font-mono text-[10px] font-semibold text-primary">
                      {badgeCount}
                    </span>
                  ))}
              </button>
            )
          })}
        </div>

        {compactVerticalIcons && bookmarksExpandOnHover && hoveredDock && (
          <div
            style={{ top: `${hoveredDock.topPx}px` }}
            className={cn(
              'pointer-events-none absolute z-50 flex h-8 items-center gap-2 whitespace-nowrap rounded-md border border-primary/50 bg-popover/95 px-2.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur-md',
              isRight
                ? 'wf-dock-pill-left right-1.5 flex-row-reverse'
                : 'wf-dock-pill-right left-1.5'
            )}
          >
            <hoveredDock.item.icon className="h-4 w-4 shrink-0 text-primary" />
            <span>{hoveredDock.label}</span>
            {hoveredDock.badgeCount > 0 && (
              <span className="rounded-full bg-primary/20 px-1.5 py-0 font-mono text-[10px] font-bold text-primary">
                {hoveredDock.badgeCount}
              </span>
            )}
          </div>
        )}
      </aside>
    )
  }

  // HORIZONTAL TOP BAR MODE
  const renderTopShortcutButton = (item: BookmarkDefinition): React.JSX.Element => {
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
        onClick={(e) => handleTrigger(e, item)}
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
        {centerItems.map(renderTopShortcutButton)}
      </div>

      <div className="ml-auto flex shrink-0 items-center justify-self-end lg:ml-0">
        {historyIsLast && historyItem ? renderTopShortcutButton(historyItem) : null}
      </div>
    </div>
  )
}
