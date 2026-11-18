import * as React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Globe,
  Loader2,
  Maximize2,
  Minus,
  PanelLeft,
  Plus,
  Square,
  X
} from 'lucide-react'
import type { SnapZone } from '@shared/schemas/window.schema'
import { BrowserTabPill } from '@/components/shell/BrowserTabPill'
import { CommunityCounterPill } from '@/components/shell/CommunityCounterPill'
import { TabOrganizerPopover } from '@/components/shell/TabOrganizerPopover'
import { useUiTranslations } from '@/lib/i18n'
import { getLayoutErgonomicsStrings } from '@/lib/i18n/layout-ergonomics-i18n'
import { cn } from '@/lib/utils'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'

const SNAP_ZONE_LABELS_FR: Record<SnapZone, string> = {
  maximize: 'Relâcher : Plein écran',
  left: 'Relâcher : Moitié gauche',
  right: 'Relâcher : Moitié droite',
  'top-left': 'Relâcher : Coin haut-gauche',
  'top-right': 'Relâcher : Coin haut-droite',
  'bottom-left': 'Relâcher : Coin bas-gauche',
  'bottom-right': 'Relâcher : Coin bas-droite'
}

const SNAP_ZONE_LABELS_EN: Record<SnapZone, string> = {
  maximize: 'Release: Maximize',
  left: 'Release: Snap left',
  right: 'Release: Snap right',
  'top-left': 'Release: Top-left',
  'top-right': 'Release: Top-right',
  'bottom-left': 'Release: Bottom-left',
  'bottom-right': 'Release: Bottom-right'
}

function isInteractiveTitleTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest('.app-no-drag, button, a, input, [role="button"], [data-tab-id]')
  )
}

export function TitleTabsBar(): React.JSX.Element {
  const windowState = useAppStore((s) => s.windowState)
  const lang = useAppStore((s) => s.settings.market.language)
  const tabsPosition = useAppStore((s) => s.settings.appearance.tabsPosition ?? 'top')
  const sidebarCollapsed = useAppStore((s) => Boolean(s.settings.appearance.sidebarCollapsed))
  const updateSettings = useAppStore((s) => s.updateSettings)
  const { t } = useUiTranslations()
  const layoutStrings = React.useMemo(() => getLayoutErgonomicsStrings(lang), [lang])
  const hubActive = useTabsStore((s) => s.hubActive)
  const tabs = useTabsStore((s) => s.tabs)
  const activeTabId = useTabsStore((s) => s.activeTabId)
  const activateHub = useTabsStore((s) => s.activateHub)
  const openTab = useTabsStore((s) => s.openTab)
  const reorderTabs = useTabsStore((s) => s.reorderTabs)
  const isPageTransitioning = useTabsStore((s) => s.isPageTransitioning)

  const [draggedTabId, setDraggedTabId] = React.useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  const tabsStripRef = React.useRef<HTMLDivElement | null>(null)

  const updateScrollIndicators = React.useCallback(() => {
    const strip = tabsStripRef.current
    if (!strip) return
    const maxScrollLeft = strip.scrollWidth - strip.clientWidth
    setCanScrollLeft(strip.scrollLeft > 2)
    setCanScrollRight(maxScrollLeft - strip.scrollLeft > 2)
  }, [])

  React.useEffect(() => {
    updateScrollIndicators()
    const strip = tabsStripRef.current
    if (!strip) return
    const observer = new ResizeObserver(() => updateScrollIndicators())
    observer.observe(strip)
    return () => observer.disconnect()
  }, [tabs.length, windowState.isCompactMode, updateScrollIndicators])

  React.useEffect(() => {
    if (hubActive) return
    const strip = tabsStripRef.current
    if (!strip) return
    const activeEl = Array.from(strip.querySelectorAll<HTMLElement>('[data-tab-id]')).find(
      (el) => el.dataset.tabId === activeTabId
    )
    if (activeEl) {
      const behavior =
        document.documentElement.dataset.motion === 'off' ? 'auto' : 'smooth'
      activeEl.scrollIntoView({ behavior, block: 'nearest', inline: 'nearest' })
    }
  }, [activeTabId, hubActive, tabs.length])

  const scrollTabsBy = (delta: number): void => {
    const strip = tabsStripRef.current
    if (!strip) return
    const behavior =
      document.documentElement.dataset.motion === 'off' ? 'auto' : 'smooth'
    strip.scrollBy({ left: delta, behavior })
  }

  const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>): void => {
    const strip = tabsStripRef.current
    if (!strip || strip.scrollWidth <= strip.clientWidth) return
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (delta !== 0) {
      strip.scrollLeft += delta
      updateScrollIndicators()
    }
  }

  const handleHeaderPointerDown = (e: React.PointerEvent<HTMLElement>): void => {
    if (e.button !== 0 || isInteractiveTitleTarget(e.target)) return
    const ratioX = Math.min(1, Math.max(0, e.clientX / Math.max(1, window.innerWidth)))
    const offsetY = Math.min(120, Math.max(0, e.clientY))

    const headerEl = e.currentTarget
    const pointerId = e.pointerId
    try {
      headerEl.setPointerCapture(pointerId)
    } catch {
      // Ignore si le pointeur est déjà relâché
    }

    let ended = false
    void ipcClient.window.beginDrag({ ratioX, offsetY })

    const finish = (): void => {
      if (ended) return
      ended = true
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
      window.removeEventListener('blur', finish)
      void ipcClient.window.endDrag()
    }

    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
    window.addEventListener('blur', finish)
  }

  const handleHeaderDoubleClick = (e: React.MouseEvent<HTMLElement>): void => {
    if (isInteractiveTitleTarget(e.target)) return
    void ipcClient.window.toggleMaximize()
  }

  const snapLabel = windowState.snapPreview
    ? (lang === 'fr' ? SNAP_ZONE_LABELS_FR : SNAP_ZONE_LABELS_EN)[windowState.snapPreview]
    : null

  return (
    <header
      onPointerDown={handleHeaderPointerDown}
      onDoubleClick={handleHeaderDoubleClick}
      className="wf-shell-bar flex h-9 shrink-0 select-none items-center justify-between border-b border-border bg-background/95 pl-2"
      aria-label="Barre d'onglets et contrôles fenêtre"
    >
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="app-no-drag flex min-w-0 items-center gap-1"
      >
        {tabsPosition === 'sidebar-left' && !windowState.isCompactMode && (
          <button
            type="button"
            onClick={() =>
              void updateSettings({
                appearance: { sidebarCollapsed: !sidebarCollapsed }
              })
            }
            title={layoutStrings.sidebarToggleTip}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-secondary/50 text-muted-foreground transition-colors hover:border-primary/45 hover:text-foreground"
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={activateHub}
          title="Hub Temps Réel Warframe (wf://hub)"
          className={cn(
            'wf-glass-pill inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition-colors',
            hubActive
              ? 'border-primary/60 bg-primary/20 text-foreground'
              : 'border-border bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
        >
          <img
            src="./images/logo.png"
            alt="TennoFrame"
            className="h-4 w-4 rounded-xs object-contain"
          />
          {hubActive && isPageTransitioning ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : (
            <Globe className="h-3.5 w-3.5 text-primary" />
          )}
          {!windowState.isCompactMode && <span>{t.shell.hub}</span>}
        </button>

        {tabsPosition === 'top' && (
          <>
            <div className="mx-0.5 h-4 w-px shrink-0 bg-border" />

            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scrollTabsBy(-220)}
                title="Faire défiler les onglets vers la gauche (ou molette souris)"
                aria-label="Défiler les onglets à gauche"
                className="inline-flex h-7 w-5 shrink-0 items-center justify-center rounded border border-border/70 bg-secondary/70 text-foreground transition-colors hover:border-primary/50 hover:bg-secondary"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            )}

            <div
              ref={tabsStripRef}
              onScroll={updateScrollIndicators}
              onWheel={handleWheelScroll}
              onMouseDown={(e) => {
                if (e.button === 1) e.preventDefault()
              }}
              className="wf-no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
            >
              {tabs.map((tab) => (
                <BrowserTabPill
                  key={tab.id}
                  tab={tab}
                  isActive={!hubActive && tab.id === activeTabId}
                  isCompact={windowState.isCompactMode}
                  onDragStartTab={(id) => setDraggedTabId(id)}
                  onDropOnTab={(targetId) => {
                    if (draggedTabId) {
                      reorderTabs(draggedTabId, targetId)
                      setDraggedTabId(null)
                    }
                  }}
                />
              ))}
            </div>

            {canScrollRight && (
              <button
                type="button"
                onClick={() => scrollTabsBy(220)}
                title="Faire défiler les onglets vers la droite (ou molette souris)"
                aria-label="Défiler les onglets à droite"
                className="inline-flex h-7 w-5 shrink-0 items-center justify-center rounded border border-border/70 bg-secondary/70 text-foreground transition-colors hover:border-primary/50 hover:bg-secondary"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}

            <div className="flex shrink-0 items-center gap-0.5 pl-0.5">
              <button
                type="button"
                onClick={() => openTab()}
                title={t.shell.newTab}
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>

              <TabOrganizerPopover />
            </div>
          </>
        )}
      </div>

      <div className="flex h-full min-w-[24px] flex-1 items-center justify-center px-2">
        {snapLabel ? (
          <span className="pointer-events-none inline-flex items-center gap-1 rounded-full border border-primary/50 bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary shadow-sm">
            <Maximize2 className="h-3 w-3" />
            <span>{snapLabel}</span>
          </span>
        ) : (
          tabsPosition === 'sidebar-left' && (
            <span className="pointer-events-none truncate text-xs font-medium text-muted-foreground">
              {hubActive
                ? t.shell.hub
                : (tabs.find((tab) => tab.id === activeTabId)?.title ?? 'TennoFrame')}
            </span>
          )
        )}
      </div>

      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="app-no-drag flex h-full shrink-0 items-center"
      >
        <div className="pr-1.5">
          <CommunityCounterPill variant="titlebar" isCompact={windowState.isCompactMode} />
        </div>
        <div className="h-4 w-px bg-border/70" />
        <div className="flex h-full items-stretch">
          <button
            type="button"
            onClick={() => void ipcClient.window.minimize()}
            aria-label="Réduire la fenêtre"
            className="inline-flex w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => void ipcClient.window.toggleMaximize()}
            aria-label={windowState.isMaximized ? 'Restaurer la fenêtre' : 'Agrandir la fenêtre'}
            className="inline-flex w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {windowState.isMaximized ? <Copy className="h-3 w-3" /> : <Square className="h-3 w-3" />}
          </button>
          <button
            type="button"
            onClick={() => void ipcClient.window.close()}
            aria-label="Fermer la fenêtre"
            className="inline-flex w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
