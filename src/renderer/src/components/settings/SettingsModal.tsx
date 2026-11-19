import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  AppearanceSettingsTab,
  type AppearanceSubTab
} from '@/components/settings/AppearanceSettingsTab'
import { AudioAlertsSettingsTab } from '@/components/settings/AudioAlertsSettingsTab'
import { BookmarksOrderSection } from '@/components/settings/BookmarksOrderSection'
import { ExtensionsSettingsTab } from '@/components/settings/ExtensionsSettingsTab'
import { GeneralLanguageStartupSection } from '@/components/settings/GeneralLanguageStartupSection'
import { LayoutAndErgonomicsSection } from '@/components/settings/LayoutAndErgonomicsSection'
import { MarketTradingSettingsTab } from '@/components/settings/MarketTradingSettingsTab'
import { SystemDataSettingsTab } from '@/components/settings/SystemDataSettingsTab'
import {
  WfAyaCrystalIcon,
  WfCephalonReticleIcon,
  WfLotusEmblemIcon,
  WfMaduraiGlyphIcon,
  WfNaramonGlyphIcon,
  WfNavigationStarIcon,
  WfOrdisCubeIcon,
  WfPlatinumCrestIcon,
  WfRelaySignalIcon,
  WfTennobetIcon,
  WfVazarinGlyphIcon,
  WfZenurikGlyphIcon,
  type WfIconProps
} from '@/components/settings/WarframeSettingsIcons'
import { WindowShortcutsSettingsTab } from '@/components/settings/WindowShortcutsSettingsTab'
import { useUiTranslations } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useAppStore, type SettingsCategoryId } from '@/stores/useAppStore'

interface SubTabDef {
  readonly id: string
  readonly labelFr: string
  readonly labelEn: string
  readonly Icon: React.ComponentType<WfIconProps>
}

interface CategoryDef {
  readonly id: SettingsCategoryId
  readonly labelFr: string
  readonly labelEn: string
  readonly Icon: React.ComponentType<WfIconProps>
  readonly subTabs: readonly SubTabDef[]
}

const SETTINGS_CATEGORIES: readonly CategoryDef[] = [
  {
    id: 'general',
    labelFr: 'Général & Navigation',
    labelEn: 'General & Navigation',
    Icon: WfNavigationStarIcon,
    subTabs: [
      { id: 'language', labelFr: 'Langue & Démarrage', labelEn: 'Language & Startup', Icon: WfNavigationStarIcon },
      { id: 'layout', labelFr: 'Disposition & Coins', labelEn: 'Layout & Corners', Icon: WfMaduraiGlyphIcon },
      { id: 'bookmarks', labelFr: 'Barre de Raccourcis', labelEn: 'Bookmarks Bar', Icon: WfNaramonGlyphIcon }
    ]
  },
  {
    id: 'appearance',
    labelFr: 'Apparence',
    labelEn: 'Appearance',
    Icon: WfLotusEmblemIcon,
    subTabs: [
      { id: 'themes', labelFr: 'Thèmes & Couleurs', labelEn: 'Themes & Colors', Icon: WfLotusEmblemIcon },
      { id: 'styles', labelFr: 'Styles Factions & Verre', labelEn: 'Faction Styles & Glass', Icon: WfAyaCrystalIcon },
      { id: 'fonts', labelFr: 'Polices & Animations', labelEn: 'Fonts & Motion', Icon: WfTennobetIcon }
    ]
  },
  {
    id: 'overlay',
    labelFr: 'En Jeu & Overlay',
    labelEn: 'In-Game & Overlay',
    Icon: WfCephalonReticleIcon,
    subTabs: [
      { id: 'window', labelFr: 'Fenêtre & Raccourcis', labelEn: 'Window & Shortcuts', Icon: WfVazarinGlyphIcon },
      { id: 'extensions', labelFr: 'Overlay Alt+O & Extensions', labelEn: 'Alt+O Overlay & Extensions', Icon: WfZenurikGlyphIcon }
    ]
  },
  {
    id: 'market',
    labelFr: 'Marché & Alertes',
    labelEn: 'Market & Alerts',
    Icon: WfPlatinumCrestIcon,
    subTabs: [
      { id: 'platform', labelFr: 'Plateforme & /w', labelEn: 'Platform & /w', Icon: WfPlatinumCrestIcon },
      { id: 'audio', labelFr: 'Audio & Price Sniper', labelEn: 'Audio & Price Sniper', Icon: WfRelaySignalIcon }
    ]
  },
  {
    id: 'system',
    labelFr: 'Système',
    labelEn: 'System',
    Icon: WfOrdisCubeIcon,
    subTabs: [
      { id: 'updates', labelFr: 'Mises à jour & Cache', labelEn: 'Updates & Cache', Icon: WfOrdisCubeIcon },
      { id: 'backup', labelFr: 'Sauvegarde JSON', labelEn: 'JSON Backup', Icon: WfVazarinGlyphIcon }
    ]
  }
]

export function SettingsModal(): React.JSX.Element {
  const { t, lang } = useUiTranslations()
  const isOpen = useAppStore((s) => s.isSettingsOpen)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)
  const activeCatId = useAppStore((s) => s.activeSettingsTab)
  const activeSubId = useAppStore((s) => s.activeSettingsSubTab)
  const setActiveCategory = useAppStore((s) => s.setActiveSettingsTab)
  const setActiveSubTab = useAppStore((s) => s.setActiveSettingsSubTab)
  const isCompact = useAppStore((s) => s.windowState.isCompactMode)

  const currentCategory =
    SETTINGS_CATEGORIES.find((c) => c.id === activeCatId) ?? SETTINGS_CATEGORIES[0]!
  const resolvedSubId = currentCategory.subTabs.some((st) => st.id === activeSubId)
    ? activeSubId
    : currentCategory.subTabs[0]!.id

  const pickLabel = (fr: string, en: string): string => (lang === 'fr' ? fr : en)

  const renderPanel = (): React.JSX.Element => {
    switch (currentCategory.id) {
      case 'general':
        if (resolvedSubId === 'layout') return <LayoutAndErgonomicsSection />
        if (resolvedSubId === 'bookmarks') return <BookmarksOrderSection />
        return <GeneralLanguageStartupSection />
      case 'appearance':
        return <AppearanceSettingsTab subTab={resolvedSubId as AppearanceSubTab} />
      case 'overlay':
        if (resolvedSubId === 'extensions') return <ExtensionsSettingsTab />
        return <WindowShortcutsSettingsTab />
      case 'market':
        if (resolvedSubId === 'audio') return <AudioAlertsSettingsTab />
        return <MarketTradingSettingsTab />
      case 'system':
        return <SystemDataSettingsTab subTab={resolvedSubId === 'backup' ? 'backup' : 'updates'} />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setSettingsOpen}>
      <DialogContent
        className={cn(
          'flex flex-col gap-0 overflow-hidden p-0',
          isCompact ? 'max-h-[92vh] max-w-[95vw]' : 'h-[82vh] max-h-[760px] max-w-4xl'
        )}
      >
        <DialogHeader className="shrink-0 border-b border-border bg-background/70 px-4 py-3 pr-10">
          <DialogTitle className="flex items-center gap-2">
            <WfOrdisCubeIcon className="h-4 w-4 text-primary" />
            <span>{t.settingsModal.title}</span>
          </DialogTitle>
          <DialogDescription>{t.settingsModal.desc}</DialogDescription>
        </DialogHeader>

        <div className={cn('flex min-h-0 flex-1', isCompact ? 'flex-col' : 'flex-row')}>
          <nav
            className={cn(
              'shrink-0 border-border bg-background/45 p-2',
              isCompact
                ? 'flex gap-1 overflow-x-auto border-b'
                : 'flex w-56 flex-col gap-1 border-r'
            )}
          >
            {SETTINGS_CATEGORIES.map(({ id, labelFr, labelEn, Icon, subTabs }) => {
              const selected = currentCategory.id === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveCategory(id, subTabs[0]?.id)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs transition-colors',
                    selected
                      ? 'border border-primary/40 bg-primary/15 font-semibold text-primary'
                      : 'border border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{pickLabel(labelFr, labelEn)}</span>
                </button>
              )
            })}
          </nav>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border/80 bg-card/50 px-4 py-2">
              {currentCategory.subTabs.map((sub) => {
                const SubIcon = sub.Icon
                const active = resolvedSubId === sub.id
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setActiveSubTab(sub.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
                      active
                        ? 'border-primary/50 bg-primary text-primary-foreground shadow-xs'
                        : 'border-border/70 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    )}
                  >
                    <SubIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>{pickLabel(sub.labelFr, sub.labelEn)}</span>
                  </button>
                )
              })}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div key={`${currentCategory.id}:${resolvedSubId}`} className="wf-view-enter">
                {renderPanel()}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
