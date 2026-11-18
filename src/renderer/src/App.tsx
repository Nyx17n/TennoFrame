import * as React from 'react'
import { WhisperBar } from '@/components/market/WhisperBar'
import { ChangelogModal } from '@/components/modals/ChangelogModal'
import { SupportTicketModal } from '@/components/modals/SupportTicketModal'
import { NotificationViewport } from '@/components/notifications/NotificationViewport'
import { SettingsModal } from '@/components/settings/SettingsModal'
import { BookmarksBar } from '@/components/shell/BookmarksBar'
import { ClickThroughBanner } from '@/components/shell/ClickThroughBanner'
import { CommandNavBar } from '@/components/shell/CommandNavBar'
import { DiscordCornerButton } from '@/components/shell/DiscordCornerButton'
import { OmniboxDialog } from '@/components/shell/OmniboxDialog'
import { PageTransitionLoader } from '@/components/shell/PageTransitionLoader'
import { StartupSplashOverlay } from '@/components/shell/StartupSplashOverlay'
import { StatusBar } from '@/components/shell/StatusBar'
import { TitleTabsBar } from '@/components/shell/TitleTabsBar'
import { UpdateBanner } from '@/components/shell/UpdateBanner'
import { VerticalTabsSidebar } from '@/components/shell/VerticalTabsSidebar'
import { WindowResizeHandles } from '@/components/shell/WindowResizeHandles'
import { CompactTimersBar } from '@/components/shell/timers/CompactTimersBar'
import { CreateWfmOrderModal } from '@/components/wfm-account/CreateWfmOrderModal'
import { WfmSignInModal } from '@/components/wfm-account/WfmSignInModal'
import { useLocalShortcuts } from '@/hooks/useLocalShortcuts'
import { openHubSection } from '@/lib/hub-navigation'
import { applyThemeToDocument, subscribeOsReducedMotion } from '@/lib/theme-engine'
import { WorkspaceRouteViewport } from '@/pages/WorkspaceRouteViewport'
import { playAlertSoundPreview } from '@/services/audio-preview.service'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { notify, type NotificationAction } from '@/stores/useNotificationStore'
import { useTabsStore } from '@/stores/useTabsStore'
import { useWfmAccountStore } from '@/stores/useWfmAccountStore'

export function App(): React.JSX.Element {
  const initialize = useAppStore((s) => s.initialize)
  const initWfmAccount = useWfmAccountStore((s) => s.initialize)
  const isAppLoading = useAppStore((s) => s.isLoading)
  const marketLang = useAppStore((s) => s.settings.market.language)
  const marketPlatform = useAppStore((s) => s.settings.market.platform)
  const marketCrossplay = useAppStore((s) => s.settings.market.crossplay)
  const isCompactMode = useAppStore((s) => s.windowState.isCompactMode)
  const isMaximized = useAppStore((s) => s.windowState.isMaximized)
  const isSnapped = useAppStore((s) => s.windowState.isSnapped)
  const snapPreview = useAppStore((s) => s.windowState.snapPreview)
  const hydrateFromSession = useTabsStore((s) => s.hydrateFromSession)
  const transitionRevision = useTabsStore((s) => s.transitionRevision)
  const setLatestAlertToast = useMarketStore((s) => s.setLatestAlertToast)

  const viewportScrollRef = React.useRef<HTMLDivElement | null>(null)
  const prevMarketSigRef = React.useRef<string | null>(null)

  useLocalShortcuts()

  React.useEffect(() => {
    if (isAppLoading) return
    const nextSig = `${marketLang}:${marketPlatform}:${String(marketCrossplay)}`
    if (prevMarketSigRef.current === null) {
      prevMarketSigRef.current = nextSig
      return
    }
    if (prevMarketSigRef.current !== nextSig) {
      prevMarketSigRef.current = nextSig
      if (useMarketStore.getState().catalog.length > 0) {
        void useMarketStore.getState().ensureCatalogLoaded(true)
      }
    }
  }, [isAppLoading, marketLang, marketPlatform, marketCrossplay])

  React.useEffect(() => {
    if (transitionRevision > 0) {
      viewportScrollRef.current?.scrollTo({ top: 0 })
    }
  }, [transitionRevision])

  React.useEffect(
    () =>
      subscribeOsReducedMotion(() => {
        applyThemeToDocument(useAppStore.getState().settings.appearance)
      }),
    []
  )

  React.useEffect(() => {
    let cleanupWindow: (() => void) | undefined
    let cleanupWfm: (() => void) | undefined
    void initialize().then((unsubscribe) => {
      cleanupWindow = unsubscribe
      hydrateFromSession(useAppStore.getState().settings.session)
    })
    void initWfmAccount().then((unsubWfm) => {
      cleanupWfm = unsubWfm
    })

    const cleanupAlerts = ipcClient.alerts.onTriggered((alertEvent) => {
      setLatestAlertToast(alertEvent)

      const actions: NotificationAction[] = []
      if (
        alertEvent.kind === 'price-sniper' &&
        alertEvent.sellerName &&
        alertEvent.platinum !== undefined
      ) {
        const sellerName = alertEvent.sellerName
        const platinum = alertEvent.platinum
        actions.push({
          label: `Copier /w (${platinum}p)`,
          icon: 'whisper',
          onClick: () =>
            void useMarketStore.getState().triggerWhisper({
              ingameName: sellerName,
              itemNameEn: alertEvent.itemNameEn ?? alertEvent.title,
              itemNameFr: alertEvent.itemNameFr ?? alertEvent.title,
              platinum,
              rank: alertEvent.rank
            })
        })
      }
      if (alertEvent.kind === 'worldstate' && alertEvent.hubSection) {
        const targetSection = alertEvent.hubSection
        actions.push({
          label: 'Voir dans le Hub',
          icon: 'hub',
          onClick: () => openHubSection(targetSection)
        })
      }
      if (alertEvent.kind === 'worldstate' && alertEvent.slug) {
        const slug = alertEvent.slug
        actions.push({
          label: 'Prix Plat',
          icon: 'external',
          variant: 'outline',
          onClick: () => useTabsStore.getState().openTab({ kind: 'market-item', slug })
        })
      }

      notify({
        kind: 'alert',
        title: alertEvent.title,
        message: alertEvent.subtitle,
        actions
      })

      const { audio } = useAppStore.getState().settings
      if (audio.soundEnabled && !alertEvent.silent) {
        void playAlertSoundPreview(audio.soundChoice, audio.volumePercent)
      }
    })

    return () => {
      cleanupWindow?.()
      cleanupWfm?.()
      cleanupAlerts()
    }
  }, [initialize, initWfmAccount, hydrateFromSession, setLatestAlertToast])

  return (
    <div
      data-maximized={isMaximized || isSnapped ? 'true' : 'false'}
      className={`wf-app-root relative flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground ${
        snapPreview ? 'ring-2 ring-inset ring-primary/80' : ''
      }`}
    >
      <div
        aria-hidden="true"
        className="wf-app-gradient-layer pointer-events-none absolute inset-0 z-0 rounded-[inherit]"
      />
      <div className="relative z-10 flex h-full w-full flex-col overflow-hidden">
        <TitleTabsBar />
        <ClickThroughBanner />
        <CommandNavBar />
        <BookmarksBar />
        <UpdateBanner />
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <VerticalTabsSidebar />
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <PageTransitionLoader />
            <div
              ref={viewportScrollRef}
              className={`wf-scroll-stable flex-1 overflow-y-auto ${isCompactMode ? '' : 'pb-10'}`}
            >
              <WorkspaceRouteViewport />
            </div>
            <DiscordCornerButton />
          </div>
        </div>
        <WhisperBar />
        <CompactTimersBar />
        <StatusBar />
      </div>
      <NotificationViewport />
      <OmniboxDialog />
      <WfmSignInModal />
      <CreateWfmOrderModal />
      <SettingsModal />
      <ChangelogModal />
      <SupportTicketModal />
      <StartupSplashOverlay />
      <WindowResizeHandles />
    </div>
  )
}
