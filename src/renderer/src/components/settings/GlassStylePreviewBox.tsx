import * as React from 'react'
import { RotateCcw } from 'lucide-react'
import {
  GLASS_OPACITY_DEFAULT,
  GLASS_OPACITY_MAX,
  GLASS_OPACITY_MIN,
  type GlassStyle,
  type UserSettingsPatch
} from '@shared/schemas/settings.schema'
import { Button } from '@/components/ui/button'
import type { FactionStylesStrings } from '@/lib/i18n/faction-styles-i18n'
import type { GlassModeMessages } from '@/lib/i18n/glass-mode-i18n'
import { FACTION_STYLE_PALETTES, type ThemedFactionStyleId } from '@/lib/theme-engine'
import { cn } from '@/lib/utils'

const OPACITY_PRESETS = [
  { key: 'crystal', value: 30 },
  { key: 'balanced', value: GLASS_OPACITY_DEFAULT },
  { key: 'smoked', value: 70 }
] as const

interface GlassStylePreviewBoxProps {
  readonly msg: GlassModeMessages
  readonly fMsg: FactionStylesStrings
  readonly glassEnabled: boolean
  readonly glassStyle: GlassStyle
  readonly desktopBackdrop: boolean
  readonly glassOpacity: number
  readonly primaryColor: string
  readonly secondaryColor: string
  readonly onPatch: (patch: UserSettingsPatch) => void
}

function isThemedFactionStyle(style: GlassStyle): style is ThemedFactionStyleId {
  return (
    style === 'medieval' ||
    style === 'orokin' ||
    style === 'cephalon' ||
    style === 'pom2-1999'
  )
}

function getPaletteLabel(id: string, msg: GlassModeMessages, fMsg: FactionStylesStrings): string {
  switch (id) {
    case 'dungeon-gold':
      return msg.paletteDungeonGold
    case 'royal-parchment':
      return msg.paletteRoyalParchment
    case 'crimson-order':
      return msg.paletteCrimsonOrder
    case 'orokin-lua':
      return fMsg.paletteOrokinLua
    case 'orokin-ivory':
      return fMsg.paletteOrokinIvory
    case 'orokin-void':
      return fMsg.paletteOrokinVoid
    case 'cephalon-ordis':
      return fMsg.paletteCephalonOrdis
    case 'cephalon-simaris':
      return fMsg.paletteCephalonSimaris
    case 'cephalon-cy':
      return fMsg.paletteCephalonCy
    case 'pom2-green':
      return fMsg.palettePom2Green
    case 'pom2-amber':
      return fMsg.palettePom2Amber
    case 'pom2-onlyne':
      return fMsg.palettePom2Onlyne
    default:
      return id
  }
}

function buildPreviewStyle(
  style: GlassStyle,
  opacity: number,
  backdrop: boolean
): React.CSSProperties {
  const alpha = (opacity / 100).toFixed(2)
  const cardAlpha = backdrop ? alpha : '0.95'
  if (style === 'medieval') {
    return {
      backgroundColor: `hsl(var(--card) / ${cardAlpha})`,
      boxShadow:
        'inset 0 0 0 2px hsl(var(--background) / 0.88), inset 0 0 0 3px hsl(var(--primary) / 0.36)'
    }
  }
  if (style === 'orokin') {
    return {
      backgroundColor: `hsl(var(--card) / ${cardAlpha})`,
      boxShadow:
        'inset 0 0 0 1px rgba(245,208,107,0.58), inset 0 0 0 3px hsl(var(--background) / 0.88), 0 6px 20px -8px rgba(56,189,248,0.35)'
    }
  }
  if (style === 'cephalon') {
    return {
      backgroundColor: `hsl(var(--card) / ${cardAlpha})`,
      boxShadow: 'inset 0 0 18px -6px hsl(var(--primary) / 0.32)'
    }
  }
  if (style === 'pom2-1999') {
    return {
      backgroundColor: `hsl(var(--card) / ${cardAlpha})`,
      backgroundImage:
        'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1px, transparent 1px, transparent 3px)',
      boxShadow: 'inset 0 0 22px -8px hsl(var(--primary) / 0.36)'
    }
  }
  if (style === 'liquid-glass') {
    return {
      backgroundColor: `hsl(var(--card) / ${alpha})`,
      backdropFilter: 'blur(16px) saturate(150%)',
      boxShadow:
        'inset 1px 1px 0 0 rgba(255,255,255,0.62), inset -1px -1px 0 0 hsl(var(--primary) / 0.48)'
    }
  }
  return { backgroundColor: `hsl(var(--card) / ${alpha})` }
}

export function GlassStylePreviewBox(props: GlassStylePreviewBoxProps): React.JSX.Element {
  const { msg, fMsg, glassEnabled, glassStyle, desktopBackdrop, glassOpacity, primaryColor, secondaryColor, onPatch } = props
  const isFaction = isThemedFactionStyle(glassStyle)
  const surfaceStyle = buildPreviewStyle(glassStyle, glassOpacity, desktopBackdrop)
  const opacityDisabled = !glassEnabled || (isFaction && !desktopBackdrop)

  const palettesTitle =
    glassStyle === 'orokin'
      ? fMsg.palettesTitleOrokin
      : glassStyle === 'cephalon'
        ? fMsg.palettesTitleCephalon
        : glassStyle === 'pom2-1999'
          ? fMsg.palettesTitlePom2
          : msg.medievalPalettesLabel

  return (
    <div className="space-y-3">
      {glassEnabled && isFaction && (
        <div className="space-y-1.5 rounded-md border border-primary/35 bg-background/50 p-2.5">
          <div className="text-[11px] font-semibold text-primary">{palettesTitle}</div>
          <div className="grid gap-1.5 sm:grid-cols-3">
            {FACTION_STYLE_PALETTES[glassStyle].map((p) => {
              const active =
                primaryColor.toLowerCase() === p.primaryHex &&
                secondaryColor.toLowerCase() === p.secondaryHex
              return (
                <Button
                  key={p.id}
                  type="button"
                  size="sm"
                  variant={active ? 'default' : 'outline'}
                  onClick={() =>
                    onPatch({
                      appearance: {
                        preset: 'custom',
                        primaryColor: p.primaryHex,
                        secondaryColor: p.secondaryHex
                      }
                    })
                  }
                  className="justify-start gap-1.5 text-[11px]"
                >
                  <span>{p.glyph}</span>
                  <span
                    className="h-3 w-3 shrink-0 rounded-sm border border-white/30"
                    style={{
                      background: `linear-gradient(135deg, ${p.primaryHex} 50%, ${p.secondaryHex} 50%)`
                    }}
                  />
                  <span className="truncate">{getPaletteLabel(p.id, msg, fMsg)}</span>
                </Button>
              )
            })}
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-lg border border-border/60 bg-background p-3">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5">
          <div
            style={surfaceStyle}
            className="flex min-w-[160px] flex-1 items-center justify-between rounded-md border border-primary/45 px-3.5 py-2.5 text-xs font-medium text-foreground"
          >
            <span>{msg.previewCard}</span>
            <span className="font-mono text-[11px] opacity-80">
              {isFaction && !desktopBackdrop ? '100%' : `${glassOpacity}%`}
            </span>
          </div>
          <div
            style={surfaceStyle}
            className="inline-flex h-9 items-center rounded-md border border-primary/45 px-4 text-xs font-medium text-foreground"
          >
            {msg.previewPill}
          </div>
        </div>
      </div>

      <div className={cn('space-y-2 transition-opacity', opacityDisabled && 'opacity-55')}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">{msg.opacityLabel}</span>
          <span className="font-mono font-semibold text-primary">{glassOpacity}%</span>
        </div>
        <input
          type="range"
          min={GLASS_OPACITY_MIN}
          max={GLASS_OPACITY_MAX}
          step={1}
          disabled={opacityDisabled}
          value={glassOpacity}
          onChange={(e) => onPatch({ appearance: { glassOpacityPercent: Number(e.target.value) } })}
          className="h-1.5 w-full cursor-pointer accent-primary disabled:cursor-not-allowed"
        />
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {OPACITY_PRESETS.map((preset) => {
              const label = preset.key === 'crystal' ? msg.presetCrystal : preset.key === 'balanced' ? msg.presetBalanced : msg.presetSmoked
              return (
                <Button
                  key={preset.key}
                  type="button"
                  size="sm"
                  variant={glassEnabled && glassOpacity === preset.value ? 'default' : 'outline'}
                  onClick={() => onPatch({ appearance: { glassModeEnabled: true, glassDesktopBackdropEnabled: true, glassOpacityPercent: preset.value } })}
                >
                  {label}
                </Button>
              )
            })}
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onPatch({ appearance: { glassModeEnabled: false, glassStyle: 'liquid-glass', glassDesktopBackdropEnabled: true, glassOpacityPercent: GLASS_OPACITY_DEFAULT } })}
          >
            <RotateCcw className="h-3 w-3" />
            <span>{msg.resetButton}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
