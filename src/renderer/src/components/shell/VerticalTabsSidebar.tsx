import * as React from 'react'
import {
  CopyPlus,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  Plus,
  Trash2,
  X
} from 'lucide-react'
import type { BrowserTab } from '@shared/schemas/navigation.schema'
import { RouteIcon } from '@/components/shell/RouteIcon'
import { TabOrganizerPopover } from '@/components/shell/TabOrganizerPopover'
import {
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuSeparator,
  type ContextMenuPosition
} from '@/components/ui/context-menu-portal'
import { getLayoutErgonomicsStrings } from '@/lib/i18n/layout-ergonomics-i18n'
import { getTabCurrentRoute } from '@/lib/tab-helpers'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function VerticalTabsSidebar(): React.JSX.Element | null {
  const appearance = useAppStore((s) => s.settings.appearance)
  const language = useAppStore((s) => s.settings.market.language)
  const isCompactMode = useAppStore((s) => s.windowState.isCompactMode)
  const updateSettings = useAppStore((s) => s.updateSettings)

  const tabs = useTabsStore((s) => s.tabs)
  const activeTabId = useTabsStore((s) => s.activeTabId)
  const hubActive = useTabsStore((s) => s.hubActive)
  const isPageTransitioning = useTabsStore((s) => s.isPageTransitioning)
  const activateTab = useTabsStore((s) => s.activateTab)
  const openTab = useTabsStore((s) => s.openTab)
  const closeTab = useTabsStore((s) => s.closeTab)
  const togglePinTab = useTabsStore((s) => s.togglePinTab)
  const duplicateTab = useTabsStore((s) => s.duplicateTab)
  const closeDuplicateTabs = useTabsStore((s) => s.closeDuplicateTabs)
  const closeOtherTabs = useTabsStore((s) => s.closeOtherTabs)
  const closeTabsToRight = useTabsStore((s) => s.closeTabsToRight)
  const reorderTabs = useTabsStore((s) => s.reorderTabs)

  const [draggedTabId, setDraggedTabId] = React.useState<string | null>(null)
  const [contextState, setContextState] = React.useState<{
    tab: BrowserTab
    pos: ContextMenuPosition
  } | null>(null)

  const strings = React.useMemo(() => getLayoutErgonomicsStrings(language), [language])

  if (appearance.tabsPosition !== 'sidebar-left') {
    return null
  }

  const collapsed = isCompactMode || Boolean(appearance.sidebarCollapsed)
  const pinnedTabs = tabs.filter((t) => t.pinned)
  const regularTabs = tabs.filter((t) => !t.pinned)

  const renderTabRow = (tab: BrowserTab, isPinnedChip = false): React.JSX.Element => {
    const isActive = !hubActive && tab.id === activeTabId
    const route = getTabCurrentRoute(tab)

    return (
      <div
        key={tab.id}
        draggable
        onDragStart={() => setDraggedTabId(tab.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => {
          if (draggedTabId) {
            reorderTabs(draggedTabId, tab.id)
            setDraggedTabId(null)
          }
        }}
        onClick={() => activateTab(tab.id)}
        onMouseDown={(e) => {
          if (e.button === 1) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
        onAuxClick={(e) => {
          if (e.button === 1) {
            e.preventDefault()
            e.stopPropagation()
            closeTab(tab.id, true)
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setContextState({ tab, pos: { x: e.clientX, y: e.clientY } })
        }}
        title={`${tab.title}${tab.pinned ? ' (📌)' : ''}`}
        className={cn(
          'wf-tab-pill group relative flex cursor-pointer select-none items-center rounded-md border text-xs transition-colors',
          collapsed || isPinnedChip ? 'h-8 justify-center px-1.5' : 'h-8 justify-between gap-1.5 px-2',
          isActive
            ? 'border-primary/55 bg-primary/15 font-semibold text-foreground'
            : 'border-border/60 bg-secondary/35 text-muted-foreground hover:bg-secondary/75 hover:text-foreground'
        )}
      >
        {isActive && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1.5 left-0 w-[2.5px] rounded-full bg-primary"
          />
        )}
        <div className="flex min-w-0 items-center gap-2">
          {isActive && isPageTransitioning ? (
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
          ) : (
            <RouteIcon
              kind={route.kind}
              className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}
            />
          )}
          {!collapsed && !isPinnedChip && <span className="truncate">{tab.title}</span>}
        </div>

        {!collapsed && !isPinnedChip && !tab.pinned && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              closeTab(tab.id)
            }}
            aria-label={`Close ${tab.title}`}
            className="rounded p-0.5 opacity-60 transition-opacity hover:bg-destructive/20 hover:text-destructive group-hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <aside
        aria-label="Vertical browser tabs"
        className={cn(
          'wf-shell-bar flex h-full shrink-0 flex-col border-r border-border bg-card/55 transition-[width] duration-150',
          collapsed ? 'w-12 p-1.5' : 'w-52 p-2'
        )}
      >
        {pinnedTabs.length > 0 && (
          <div className="mb-2 space-y-1">
            {!collapsed && (
              <div className="flex items-center gap-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-primary/90">
                <Pin className="h-2.5 w-2.5" />
                <span>{strings.sidebarPinnedTitle}</span>
              </div>
            )}
            <div className={collapsed ? 'space-y-1' : 'grid grid-cols-3 gap-1'}>
              {pinnedTabs.map((t) => renderTabRow(t, !collapsed))}
            </div>
          </div>
        )}

        <div className="mb-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => openTab()}
            title={`${strings.sidebarNewTabBtn} (Ctrl+T)`}
            className={cn(
              'wf-interactive-btn inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-primary/40 bg-primary/12 px-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20',
              collapsed && 'px-0'
            )}
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span className="truncate">{strings.sidebarNewTabBtn}</span>}
          </button>
          {!collapsed && <TabOrganizerPopover />}
        </div>

        {!collapsed && (
          <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {strings.sidebarOpenTabsTitle} ({regularTabs.length})
          </div>
        )}

        <div className="wf-no-scrollbar flex-1 space-y-1 overflow-y-auto pr-0.5">
          {regularTabs.map((t) => renderTabRow(t, false))}
        </div>

        {!isCompactMode && (
          <button
            type="button"
            onClick={() =>
              void updateSettings({
                appearance: { sidebarCollapsed: !appearance.sidebarCollapsed }
              })
            }
            title={collapsed ? strings.sidebarExpandBtn : strings.sidebarCollapseBtn}
            className="mt-2 inline-flex h-7 items-center justify-center gap-1.5 rounded-md border border-border/70 bg-background/60 px-2 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-3.5 w-3.5" />
            ) : (
              <>
                <PanelLeftClose className="h-3.5 w-3.5" />
                <span className="truncate">{strings.sidebarCollapseBtn}</span>
              </>
            )}
          </button>
        )}
      </aside>

      <ContextMenuPortal
        position={contextState?.pos ?? null}
        onClose={() => setContextState(null)}
      >
        {contextState && (
          <>
            <ContextMenuItem onSelect={() => togglePinTab(contextState.tab.id)}>
              <Pin className="h-3.5 w-3.5 text-primary" />
              <span>{contextState.tab.pinned ? 'Unpin Tab' : 'Pin Tab'}</span>
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => duplicateTab(contextState.tab.id)}>
              <CopyPlus className="h-3.5 w-3.5" />
              <span>Duplicate Tab</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={() => closeDuplicateTabs()}>
              <Trash2 className="h-3.5 w-3.5" />
              <span>Close Duplicates</span>
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => closeOtherTabs(contextState.tab.id)}>
              <span>Close Other Tabs</span>
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => closeTabsToRight(contextState.tab.id)}>
              <span>Close Tabs Below</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem destructive onSelect={() => closeTab(contextState.tab.id, true)}>
              <X className="h-3.5 w-3.5 text-destructive" />
              <span>Close Tab</span>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuPortal>
    </>
  )
}
