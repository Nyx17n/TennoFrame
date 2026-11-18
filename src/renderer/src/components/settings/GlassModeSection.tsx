import * as React from 'react'
import { Cpu, Crown, Eye, EyeOff, Gem, Layers, Sparkles, Terminal } from 'lucide-react'
import type { GlassStyle } from '@shared/schemas/settings.schema'
import { GlassStylePreviewBox } from '@/components/settings/GlassStylePreviewBox'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { getFactionStylesStrings } from '@/lib/i18n/faction-styles-i18n'
import { getGlassModeMessages } from '@/lib/i18n/glass-mode-i18n'
import { FACTION_STYLE_PALETTES, type ThemedFactionStyleId } from '@/lib/theme-engine'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'

function isThemedFactionStyle(style: GlassStyle): style is ThemedFactionStyleId {
  return (
    style === 'medieval' ||
    style === 'orokin' ||
    style === 'cephalon' ||
    style === 'pom2-1999'
  )
}

export function GlassModeSection(): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const appearance = useAppStore((s) => s.settings.appearance)
  const updateSettings = useAppStore((s) => s.updateSettings)

  const glassEnabled = appearance.glassModeEnabled
  const glassStyle: GlassStyle = appearance.glassStyle ?? 'liquid-glass'
  const desktopBackdrop = appearance.glassDesktopBackdropEnabled !== false
  const glassOpacity = appearance.glassOpacityPercent
  const msg = getGlassModeMessages(lang)
  const fMsg = React.useMemo(() => getFactionStylesStrings(lang), [lang])

  const styleItems: readonly {
    id: GlassStyle
    label: string
    Icon: typeof Sparkles
  }[] = [
    { id: 'liquid-glass', label: msg.styleLiquidGlass, Icon: Sparkles },
    { id: 'simple', label: msg.styleSimple, Icon: Layers },
    { id: 'medieval', label: msg.styleMedieval, Icon: Crown },
    { id: 'orokin', label: fMsg.styleOrokin, Icon: Gem },
    { id: 'cephalon', label: fMsg.styleCephalon, Icon: Cpu },
    { id: 'pom2-1999', label: fMsg.stylePom2, Icon: Terminal }
  ]

  const activeStyleName =
    styleItems.find((item) => item.id === glassStyle)?.label ?? msg.styleLiquidGlass

  const selectStyle = (nextStyle: GlassStyle): void => {
    if (isThemedFactionStyle(nextStyle)) {
      const defaultPalette = FACTION_STYLE_PALETTES[nextStyle][0]
      const applyStarterPalette = appearance.preset === 'dark' && defaultPalette !== undefined
      void updateSettings({
        appearance: {
          glassModeEnabled: true,
          glassStyle: nextStyle,
          ...(glassEnabled ? {} : { glassDesktopBackdropEnabled: false }),
          ...(applyStarterPalette
            ? {
                preset: 'custom',
                primaryColor: defaultPalette.primaryHex,
                secondaryColor: defaultPalette.secondaryHex
              }
            : {})
        }
      })
      return
    }
    void updateSettings({
      appearance: { glassModeEnabled: true, glassStyle: nextStyle }
    })
  }

  return (
    <div className="wf-glass-panel space-y-3 rounded-lg border border-border/80 bg-card/60 p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{fMsg.sectionTitle}</span>
          </h3>
          <p className="text-xs text-muted-foreground">{fMsg.sectionDesc}</p>
        </div>

        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
            glassEnabled
              ? 'border-primary/50 bg-primary/15 text-primary'
              : 'border-border bg-secondary/60 text-muted-foreground'
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              glassEnabled ? 'bg-primary' : 'bg-muted-foreground/60'
            )}
          />
          <span>
            {glassEnabled
              ? `${activeStyleName}${desktopBackdrop ? ` · ${glassOpacity}%` : ''}`
              : msg.disabledBadge}
          </span>
        </span>
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-border/70 bg-background/45 px-3 py-2 text-xs font-medium">
        <span>{msg.toggleLabel}</span>
        <Switch
          checked={glassEnabled}
          onCheckedChange={(checked) =>
            void updateSettings({ appearance: { glassModeEnabled: checked } })
          }
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-3">
        {styleItems.map(({ id, label, Icon }) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={glassEnabled && glassStyle === id ? 'default' : 'outline'}
            onClick={() => selectStyle(id)}
            className="justify-start gap-2"
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </Button>
        ))}
      </div>

      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 bg-background/45 px-3 py-2 transition-opacity',
          !glassEnabled && 'opacity-55'
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-foreground">{msg.desktopBackdropLabel}</div>
          <div className="text-[11px] text-muted-foreground">{msg.desktopBackdropDesc}</div>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={!glassEnabled}
          variant={desktopBackdrop ? 'default' : 'outline'}
          onClick={() =>
            void updateSettings({
              appearance: { glassDesktopBackdropEnabled: !desktopBackdrop }
            })
          }
          className="shrink-0 gap-1.5"
        >
          {desktopBackdrop ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          <span>{desktopBackdrop ? msg.desktopBackdropOn : msg.desktopBackdropOff}</span>
        </Button>
      </div>

      <GlassStylePreviewBox
        msg={msg}
        fMsg={fMsg}
        glassEnabled={glassEnabled}
        glassStyle={glassStyle}
        desktopBackdrop={desktopBackdrop}
        glassOpacity={glassOpacity}
        primaryColor={appearance.primaryColor}
        secondaryColor={appearance.secondaryColor}
        onPatch={(patch) => void updateSettings(patch)}
      />
    </div>
  )
}
