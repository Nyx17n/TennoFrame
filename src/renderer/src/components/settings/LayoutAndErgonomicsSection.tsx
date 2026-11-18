import * as React from 'react'
import {
  BookOpen,
  Globe,
  LayoutDashboard,
  PanelLeft,
  PanelTop,
  Rows3,
  Store,
  UserCheck
} from 'lucide-react'
import type {
  CornerRadiusStyle,
  NewTabTarget,
  TabsPosition,
  UiDensity
} from '@shared/schemas/settings.schema'
import { getLayoutErgonomicsStrings } from '@/lib/i18n/layout-ergonomics-i18n'
import { resolveNewTabRoute } from '@/lib/tab-helpers'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function LayoutAndErgonomicsSection(): React.JSX.Element {
  const appearance = useAppStore((s) => s.settings.appearance)
  const language = useAppStore((s) => s.settings.market.language)
  const updateSettings = useAppStore((s) => s.updateSettings)

  const strings = React.useMemo(() => getLayoutErgonomicsStrings(language), [language])

  const tabsPosition: TabsPosition = appearance.tabsPosition ?? 'top'
  const cornerRadius: CornerRadiusStyle = appearance.cornerRadius ?? 'auto'
  const uiDensity: UiDensity = appearance.uiDensity ?? 'comfortable'
  const newTabTarget: NewTabTarget = appearance.newTabTarget ?? 'market-home'

  const cornerOptions: readonly {
    id: CornerRadiusStyle
    label: string
    previewRadius: string
  }[] = [
    { id: 'auto', label: strings.cornerAuto, previewRadius: '6px' },
    { id: 'sharp', label: strings.cornerSharp, previewRadius: '0px' },
    { id: 'subtle', label: strings.cornerSubtle, previewRadius: '4px' },
    { id: 'rounded', label: strings.cornerRounded, previewRadius: '8px' },
    { id: 'pill', label: strings.cornerPill, previewRadius: '9999px' }
  ]

  const densityOptions: readonly { id: UiDensity; title: string; desc: string }[] = [
    { id: 'compact', title: strings.densityCompactTitle, desc: strings.densityCompactDesc },
    { id: 'comfortable', title: strings.densityComfortTitle, desc: strings.densityComfortDesc },
    { id: 'spacious', title: strings.densitySpaciousTitle, desc: strings.densitySpaciousDesc }
  ]

  const targetOptions: readonly {
    id: NewTabTarget
    label: string
    desc?: string
    Icon: typeof LayoutDashboard
  }[] = [
    {
      id: 'speed-dial',
      label: strings.targetSpeedDial,
      desc: strings.targetSpeedDialDesc,
      Icon: LayoutDashboard
    },
    { id: 'market-home', label: strings.targetMarket, Icon: Store },
    { id: 'hub', label: strings.targetHub, Icon: Globe },
    { id: 'codex-home', label: strings.targetCodex, Icon: BookOpen },
    { id: 'wfm-account', label: strings.targetWfmAccount, Icon: UserCheck }
  ]

  return (
    <div className="wf-glow-surface space-y-3.5 rounded-lg border border-border/80 bg-card/60 p-3.5">
      <div>
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <Rows3 className="h-4 w-4" />
          <span>{strings.sectionTitle}</span>
        </h3>
        <p className="text-xs text-muted-foreground">{strings.sectionSubtitle}</p>
      </div>

      {/* 1. Tab Bar Position */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-foreground">{strings.tabsPositionLabel}</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(
            [
              {
                id: 'top' as const,
                title: strings.tabsPosTopTitle,
                desc: strings.tabsPosTopDesc,
                Icon: PanelTop
              },
              {
                id: 'sidebar-left' as const,
                title: strings.tabsPosSideTitle,
                desc: strings.tabsPosSideDesc,
                Icon: PanelLeft
              }
            ] as const
          ).map(({ id, title, desc, Icon }) => {
            const active = tabsPosition === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => void updateSettings({ appearance: { tabsPosition: id } })}
                className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors ${
                  active
                    ? 'border-primary bg-primary/12 text-foreground'
                    : 'border-border/75 bg-background/50 text-muted-foreground hover:border-primary/45 hover:text-foreground'
                }`}
              >
                <Icon
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    active ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                <div className="min-w-0 space-y-0.5">
                  <div className="text-xs font-bold">{title}</div>
                  <div className="text-[11px] leading-snug text-muted-foreground">{desc}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Corner Radius (--radius) */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-foreground">{strings.cornerRadiusLabel}</div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
          {cornerOptions.map((opt) => {
            const active = cornerRadius === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => void updateSettings({ appearance: { cornerRadius: opt.id } })}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-center transition-colors ${
                  active
                    ? 'border-primary bg-primary/15 font-semibold text-primary'
                    : 'border-border/75 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <span
                  style={{ borderRadius: opt.previewRadius }}
                  className={`h-4 w-9 border-2 ${
                    active ? 'border-primary bg-primary/20' : 'border-muted-foreground/60'
                  }`}
                />
                <span className="text-[11px] leading-tight">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. UI Density */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-foreground">{strings.densityLabel}</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {densityOptions.map((opt) => {
            const active = uiDensity === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => void updateSettings({ appearance: { uiDensity: opt.id } })}
                className={`rounded-lg border p-2.5 text-left transition-colors ${
                  active
                    ? 'border-primary bg-primary/12 text-foreground'
                    : 'border-border/75 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <div className={`text-xs font-bold ${active ? 'text-primary' : 'text-foreground'}`}>
                  {opt.title}
                </div>
                <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  {opt.desc}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. New Tab Target */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-foreground">{strings.newTabTargetLabel}</span>
          <button
            type="button"
            onClick={() => {
              useTabsStore.getState().openTab(resolveNewTabRoute(newTabTarget))
              useAppStore.getState().setSettingsOpen(false)
            }}
            className="rounded border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            + {strings.sidebarNewTabBtn} ↗
          </button>
        </div>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {targetOptions.map(({ id, label, desc, Icon }) => {
            const active = newTabTarget === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => void updateSettings({ appearance: { newTabTarget: id } })}
                className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                  id === 'speed-dial' ? 'sm:col-span-2' : ''
                } ${
                  active
                    ? 'border-primary bg-primary/12 text-foreground'
                    : 'border-border/75 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    active ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold">{label}</div>
                  {desc && (
                    <div className="truncate text-[11px] text-muted-foreground">{desc}</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
