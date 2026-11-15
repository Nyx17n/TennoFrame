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
import type { GlassModeMessages } from '@/lib/i18n/glass-mode-i18n'
import { MEDIEVAL_PALETTE_PRESETS } from '@/lib/theme-engine'
import { cn } from '@/lib/utils'

const OPACITY_PRESETS = [
  { key: 'crystal', value: 30 },
  { key: 'balanced', value: GLASS_OPACITY_DEFAULT },
  { key: 'smoked', value: 70 }
] as const

interface GlassStylePreviewBoxProps {
  readonly msg: GlassModeMessages
  readonly glassEnabled: boolean
  readonly glassStyle: GlassStyle
  readonly desktopBackdrop: boolean
  readonly glassOpacity: number
  readonly primaryColor: string
  readonly secondaryColor: string
  readonly onPatch: (patch: UserSettingsPatch) => void
}

function buildPreviewStyle(
  style: GlassStyle,
  opacity: number,
  backdrop: boolean
): React.CSSProperties {
  const alpha = (opacity / 100).toFixed(2)
  if (style === 'medieval') {
    return {
      backgroundColor: `hsl(var(--card) / ${backdrop ? alpha : '0.95'})`,
      backgroundImage:
        'radial-gradient(120% 90% at 50% 0%, hsl(var(--primary) / 0.14), transparent 72%)',
      boxShadow:
        'inset 0 0 0 2px hsl(var(--background) / 0.88), inset 0 0 0 3px hsl(var(--primary) / 0.36), 0 6px 16px -8px rgba(0,0,0,0.55)'
    }
  }
  if (style === 'liquid-glass') {
    return {
      backgroundColor: `hsl(var(--card) / ${alpha})`,
      backdropFilter: 'blur(16px) saturate(150%)',
      backgroundImage:
        'radial-gradient(110px 32px at 14% 0%, rgba(255,255,255,0.34), hsl(var(--primary) / 0.16) 48%, transparent 78%), radial-gradient(110px 32px at 86% 100%, hsl(var(--primary) / 0.30), rgba(255,255,255,0.14) 48%, transparent 78%)',
      boxShadow:
        'inset 1px 1px 0 0 rgba(255,255,255,0.62), inset -1px -1px 0 0 hsl(var(--primary) / 0.48), inset 0 0 20px -4px hsl(var(--primary) / 0.22)'
    }
  }
  return { backgroundColor: `hsl(var(--card) / ${alpha})` }
}

export function GlassStylePreviewBox(props: GlassStylePreviewBoxProps): React.JSX.Element {
  const { msg, glassEnabled, glassStyle, desktopBackdrop, glassOpacity, primaryColor, secondaryColor, onPatch } = props
  const isLiquid = glassStyle === 'liquid-glass'
  const isMedieval = glassStyle === 'medieval'
  const surfaceStyle = buildPreviewStyle(glassStyle, glassOpacity, desktopBackdrop)
  const opacityDisabled = !glassEnabled || (isMedieval && !desktopBackdrop)

  return (
    <div className="space-y-3">
      {glassEnabled && isMedieval && (
        <div className="space-y-1.5 rounded-md border border-primary/35 bg-background/50 p-2.5">
          <div className="text-[11px] font-semibold text-primary">{msg.medievalPalettesLabel}</div>
          <div className="grid gap-1.5 sm:grid-cols-3">
            {MEDIEVAL_PALETTE_PRESETS.map((p) => {
              const label =
                p.id === 'dungeon-gold'
                  ? msg.paletteDungeonGold
                  : p.id === 'royal-parchment'
                    ? msg.paletteRoyalParchment
                    : msg.paletteCrimsonOrder
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
                  <span className="truncate">{label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-lg border border-border/60 bg-background p-3">
        {desktopBackdrop && (
          <>
            <div aria-hidden="true" className="pointer-events-none absolute -left-6 -top-6 h-24 w-36 rounded-full bg-primary/35 blur-2xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-6 right-4 h-24 w-40 rounded-full bg-amber-500/20 blur-2xl" />
          </>
        )}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5">
          <div
            style={surfaceStyle}
            className={cn(
              'flex min-w-[160px] flex-1 items-center justify-between border px-3.5 py-2.5 text-xs font-medium text-foreground',
              isMedieval ? 'rounded-[3px] border-primary/65 font-serif' : isLiquid ? 'rounded-xl border-white/25' : 'rounded-xl border-border/80'
            )}
          >
            <span>{isMedieval ? `⚜ ${msg.previewCard} ◆` : msg.previewCard}</span>
            <span className="font-mono text-[11px] opacity-80">
              {isMedieval && !desktopBackdrop ? '100%' : `${glassOpacity}%`}
            </span>
          </div>
          <div
            style={surfaceStyle}
            className={cn(
              'inline-flex h-9 items-center border px-4 text-xs font-medium text-foreground',
              isMedieval ? 'rounded-[3px] border-primary/70 font-serif' : isLiquid ? 'rounded-full border-white/25' : 'rounded-full border-border/80'
            )}
          >
            {isMedieval ? `⚜ ${msg.previewPill}` : msg.previewPill}
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
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{msg.crystalHint}</span>
          <span>{msg.smokedHint}</span>
        </div>
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
            disabled={!glassEnabled && glassOpacity === GLASS_OPACITY_DEFAULT && isLiquid && desktopBackdrop}
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
