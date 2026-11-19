import {
  GLASS_OPACITY_DEFAULT,
  GLASS_OPACITY_MAX,
  GLASS_OPACITY_MIN,
  type AnimationLevel,
  type GlassStyle,
  type ThemePresetId,
  type UserSettings
} from '@shared/schemas/settings.schema'
import { resolveFontStacks } from '@/lib/font-catalog'
import { buildGradientCssImage, normalizeGradientSettings } from '@/lib/gradient-engine'

export interface ThemePresetDefinition {
  id: Exclude<ThemePresetId, 'custom'>
  glyph: string
  label: string
  subtitle: string
  primaryHex: string
  secondaryHex: string
}

export const THEME_PRESETS: readonly ThemePresetDefinition[] = [
  // Classiques & OLED
  {
    id: 'dark',
    glyph: '◐',
    label: 'Sombre',
    subtitle: 'Sci-Fi Bleu Nuit (Défaut)',
    primaryHex: '#0f161d',
    secondaryHex: '#26b9d1'
  },
  {
    id: 'light',
    glyph: '❖',
    label: 'Clair',
    subtitle: 'Clair & Doux',
    primaryHex: '#f1f5f9',
    secondaryHex: '#0284c7'
  },
  {
    id: 'full-black',
    glyph: '◆',
    label: 'Full Black',
    subtitle: 'Noir Pur OLED (#000)',
    primaryHex: '#000000',
    secondaryHex: '#26b9d1'
  },
  {
    id: 'full-white',
    glyph: '◇',
    label: 'Full White',
    subtitle: 'Blanc Pur (#FFF)',
    primaryHex: '#ffffff',
    secondaryHex: '#0f172a'
  },

  // Bleu & Cyan
  {
    id: 'blue-dark',
    glyph: '⬡',
    label: 'Bleu Sombre',
    subtitle: 'Corpus & Prisma',
    primaryHex: '#0b132b',
    secondaryHex: '#3b82f6'
  },
  {
    id: 'blue-light',
    glyph: '✦',
    label: 'Bleu Clair',
    subtitle: 'Glace de Fortuna & Azur',
    primaryHex: '#eff6ff',
    secondaryHex: '#2563eb'
  },
  {
    id: 'cyan-dark',
    glyph: '⬡',
    label: 'Cyan Sombre',
    subtitle: 'Céphalon & Cryotique',
    primaryHex: '#081c24',
    secondaryHex: '#06b6d4'
  },
  {
    id: 'cyan-light',
    glyph: '✦',
    label: 'Cyan Clair',
    subtitle: 'Lagon & Cristal Clair',
    primaryHex: '#ecfeff',
    secondaryHex: '#0891b2'
  },

  // Vert & Jaune
  {
    id: 'green-dark',
    glyph: '◆',
    label: 'Vert Sombre',
    subtitle: 'Émeraude & Forêts',
    primaryHex: '#091e16',
    secondaryHex: '#10b981'
  },
  {
    id: 'green-light',
    glyph: '✦',
    label: 'Vert Clair',
    subtitle: 'Jade & Menthe Claire',
    primaryHex: '#ecfdf5',
    secondaryHex: '#059669'
  },
  {
    id: 'yellow-dark',
    glyph: '◆',
    label: 'Jaune Sombre',
    subtitle: 'Or Orokin & Prime',
    primaryHex: '#1c190a',
    secondaryHex: '#eab308'
  },
  {
    id: 'yellow-light',
    glyph: '❖',
    label: 'Jaune Clair',
    subtitle: 'Solaire & Ivoire Doré',
    primaryHex: '#fefce8',
    secondaryHex: '#ca8a04'
  },

  // Rouge & Orange
  {
    id: 'red-dark',
    glyph: '◈',
    label: 'Rouge Sombre',
    subtitle: 'Kuva & Voile Rouge',
    primaryHex: '#1f0b0e',
    secondaryHex: '#ef4444'
  },
  {
    id: 'red-light',
    glyph: '✦',
    label: 'Rouge Clair',
    subtitle: 'Carmin Clair & Rose',
    primaryHex: '#fef2f2',
    secondaryHex: '#dc2626'
  },
  {
    id: 'orange-dark',
    glyph: '❖',
    label: 'Orange Sombre',
    subtitle: 'Ember & Fusion Solaire',
    primaryHex: '#1f1209',
    secondaryHex: '#f97316'
  },
  {
    id: 'orange-light',
    glyph: '◐',
    label: 'Orange Clair',
    subtitle: 'Ambre Clair & Cuivre',
    primaryHex: '#fff7ed',
    secondaryHex: '#ea580c'
  },

  // Violet & Rose
  {
    id: 'purple-dark',
    glyph: '◇',
    label: 'Violet Sombre',
    subtitle: 'Lotus & Énergie du Néant',
    primaryHex: '#160d29',
    secondaryHex: '#a855f7'
  },
  {
    id: 'purple-light',
    glyph: '◆',
    label: 'Violet Clair',
    subtitle: 'Améthyste & Lavande',
    primaryHex: '#faf5ff',
    secondaryHex: '#9333ea'
  },
  {
    id: 'pink-dark',
    glyph: '◆',
    label: 'Rose Sombre',
    subtitle: 'Octavia & Néon Magenta',
    primaryHex: '#210b18',
    secondaryHex: '#ec4899'
  },
  {
    id: 'pink-light',
    glyph: '✦',
    label: 'Rose Clair',
    subtitle: 'Cerisier & Quartz Rose',
    primaryHex: '#fdf2f8',
    secondaryHex: '#db2777'
  }
] as const

export interface MedievalPalettePreset {
  readonly id: 'dungeon-gold' | 'royal-parchment' | 'crimson-order'
  readonly glyph: string
  readonly primaryHex: string
  readonly secondaryHex: string
}

export const MEDIEVAL_PALETTE_PRESETS: readonly MedievalPalettePreset[] = [
  {
    id: 'dungeon-gold',
    glyph: '❖',
    primaryHex: '#1a130d',
    secondaryHex: '#d97706'
  },
  {
    id: 'royal-parchment',
    glyph: '◈',
    primaryHex: '#f4e7cc',
    secondaryHex: '#b45309'
  },
  {
    id: 'crimson-order',
    glyph: '◆',
    primaryHex: '#220d10',
    secondaryHex: '#dc2626'
  }
] as const

export interface FactionPalettePreset {
  readonly id: string
  readonly glyph: string
  readonly primaryHex: string
  readonly secondaryHex: string
}

export type ThemedFactionStyleId = 'medieval' | 'orokin' | 'cephalon' | 'pom2-1999'

export const FACTION_STYLE_PALETTES: Readonly<
  Record<ThemedFactionStyleId, readonly FactionPalettePreset[]>
> = {
  medieval: MEDIEVAL_PALETTE_PRESETS,
  orokin: [
    { id: 'orokin-lua', glyph: '◐', primaryHex: '#12131c', secondaryHex: '#eab308' },
    { id: 'orokin-ivory', glyph: '✦', primaryHex: '#f8f5ec', secondaryHex: '#d49b27' },
    { id: 'orokin-void', glyph: '❖', primaryHex: '#0b1520', secondaryHex: '#38bdf8' }
  ],
  cephalon: [
    { id: 'cephalon-ordis', glyph: '⬡', primaryHex: '#06131f', secondaryHex: '#06b6d4' },
    { id: 'cephalon-simaris', glyph: '◈', primaryHex: '#191106', secondaryHex: '#f59e0b' },
    { id: 'cephalon-cy', glyph: '⬢', primaryHex: '#090d18', secondaryHex: '#6366f1' }
  ],
  'pom2-1999': [
    { id: 'pom2-green', glyph: '▣', primaryHex: '#07140b', secondaryHex: '#22c55e' },
    { id: 'pom2-amber', glyph: '◉', primaryHex: '#160f05', secondaryHex: '#f59e0b' },
    { id: 'pom2-onlyne', glyph: '◎', primaryHex: '#12091c', secondaryHex: '#ec4899' }
  ]
} as const

interface HslTriplet {
  h: number
  s: number
  l: number
}

function hexToHsl(hex: string): HslTriplet {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) {
      h = (g - b) / d + (g < b ? 6 : 0)
    } else if (max === g) {
      h = (b - r) / d + 2
    } else {
      h = (r - g) / d + 4
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

export function isOsReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function resolveEffectiveMotion(
  appearance: Pick<UserSettings['appearance'], 'animationLevel' | 'respectOsReducedMotion'>
): AnimationLevel {
  const level: AnimationLevel = appearance.animationLevel ?? 'full'
  if (level === 'off') return 'off'
  if (level === 'reduced') return 'reduced'
  if (appearance.respectOsReducedMotion !== false && isOsReducedMotionPreferred()) {
    return 'reduced'
  }
  return 'full'
}

export function subscribeOsReducedMotion(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => undefined
  }
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

/**
 * Applies the user's dual-color theme (Primary surface + Secondary accent) onto
 * shadcn/ui root CSS variables while guaranteeing accessible text contrast,
 * including pure OLED #000000 and pure #FFFFFF themes.
 */
export function applyThemeToDocument(appearance: UserSettings['appearance']): void {
  const presetMatch = THEME_PRESETS.find((p) => p.id === appearance.preset)
  const surfaceHex = presetMatch ? presetMatch.primaryHex : appearance.primaryColor
  const accentHex = presetMatch ? presetMatch.secondaryHex : appearance.secondaryColor

  const bg = hexToHsl(surfaceHex)
  const ac = hexToHsl(accentHex)
  const isLightTheme = bg.l > 55
  const isAchromatic = bg.s === 0

  const glassEnabled = Boolean(appearance.glassModeEnabled)
  const glassStyle: GlassStyle = appearance.glassStyle ?? 'liquid-glass'
  const activeStyle: GlassStyle | 'off' = glassEnabled ? glassStyle : 'off'
  const isMedievalActive = activeStyle === 'medieval'
  const isOrokinActive = activeStyle === 'orokin'

  const root = document.documentElement
  root.classList.toggle('dark', !isLightTheme)
  root.dataset.motion = resolveEffectiveMotion(appearance)
  document.body.classList.toggle('glow-enabled', appearance.glowEnabled)

  const fg =
    isMedievalActive || isOrokinActive
      ? isLightTheme
        ? '28 52% 11%'
        : '40 48% 94%'
      : isLightTheme
        ? '222 47% 11%'
        : '210 40% 96%'
  const cardL =
    bg.l === 0
      ? 3
      : bg.l === 100
        ? 100
        : isLightTheme
          ? clamp(bg.l - 2, 90, 100)
          : clamp(bg.l + 4, 6, 30)
  const mutedL = isLightTheme ? clamp(bg.l - 5, 84, 96) : clamp(bg.l + 8, 8, 35)
  const borderL = isLightTheme ? clamp(bg.l - 12, 72, 90) : clamp(bg.l + 12, 13, 42)
  const surfaceSat = isAchromatic ? 0 : clamp(bg.s, 8, 35)
  const mutedSat = isAchromatic ? 0 : clamp(bg.s, 8, 30)
  const borderSat = isAchromatic ? 0 : clamp(bg.s, 10, 35)
  const mutedFg = isMedievalActive
    ? isLightTheme
      ? '28 34% 34%'
      : '34 26% 70%'
    : isAchromatic
      ? isLightTheme
        ? '215 16% 42%'
        : '215 15% 65%'
      : isLightTheme
        ? `${bg.h} 16% 40%`
        : `${bg.h} 18% 66%`
  const accentFg = ac.l > 62 ? '222 47% 11%' : '210 40% 98%'

  const cornerStyle = appearance.cornerRadius ?? 'auto'
  const autoStyleRadius =
    activeStyle === 'medieval'
      ? '0.25rem'
      : activeStyle === 'orokin'
        ? '0.375rem'
        : activeStyle === 'cephalon' || activeStyle === 'pom2-1999'
          ? '0.125rem'
          : '0.5rem'
  const resolvedRadius =
    cornerStyle === 'sharp'
      ? '0rem'
      : cornerStyle === 'subtle'
        ? '0.25rem'
        : cornerStyle === 'rounded'
          ? '0.5rem'
          : cornerStyle === 'pill'
            ? '0.875rem'
            : autoStyleRadius

  root.style.setProperty('--radius', resolvedRadius)
  root.dataset.corners = cornerStyle
  root.dataset.density = appearance.uiDensity ?? 'comfortable'
  root.dataset.tabsPosition = appearance.tabsPosition ?? 'top'
  root.style.setProperty('--background', `${bg.h} ${bg.s}% ${bg.l}%`)
  root.style.setProperty('--foreground', fg)
  root.style.setProperty('--card', `${bg.h} ${bg.s}% ${cardL}%`)
  root.style.setProperty('--card-foreground', fg)
  root.style.setProperty('--popover', `${bg.h} ${bg.s}% ${cardL}%`)
  root.style.setProperty('--popover-foreground', fg)
  root.style.setProperty('--secondary', `${bg.h} ${surfaceSat}% ${mutedL}%`)
  root.style.setProperty('--secondary-foreground', fg)
  root.style.setProperty('--muted', `${bg.h} ${mutedSat}% ${mutedL}%`)
  root.style.setProperty('--muted-foreground', mutedFg)
  root.style.setProperty('--border', `${bg.h} ${borderSat}% ${borderL}%`)
  root.style.setProperty('--input', `${bg.h} ${borderSat}% ${borderL}%`)

  root.style.setProperty('--primary', `${ac.h} ${ac.s}% ${ac.l}%`)
  root.style.setProperty('--primary-foreground', accentFg)
  root.style.setProperty('--accent', `${ac.h} ${ac.s}% ${ac.l}%`)
  root.style.setProperty('--accent-foreground', accentFg)
  root.style.setProperty('--ring', `${ac.h} ${ac.s}% ${ac.l}%`)

  const grad = normalizeGradientSettings(appearance.backgroundGradient)
  const gradientCss = buildGradientCssImage({
    style: grad.style,
    colorMode: grad.colorMode,
    themeAccentHex: accentHex,
    customColorHex: grad.customColorHex,
    customSecondaryHex: grad.customSecondaryHex,
    intensityPercent: grad.intensityPercent,
    angleDeg: grad.angleDeg,
    isLightTheme
  })
  root.style.setProperty('--wf-app-gradient', gradientCss)
  root.dataset.hasGradient = grad.style !== 'none' ? 'true' : 'false'

  const desktopBackdrop = appearance.glassDesktopBackdropEnabled !== false
  const glassPct = clamp(
    appearance.glassOpacityPercent ?? GLASS_OPACITY_DEFAULT,
    GLASS_OPACITY_MIN,
    GLASS_OPACITY_MAX
  )
  root.dataset.glass = glassEnabled ? glassStyle : 'off'
  root.dataset.glassBackdrop = glassEnabled && desktopBackdrop ? 'true' : 'false'
  root.style.setProperty('--wf-glass-bg-alpha', (glassPct / 100).toFixed(3))
  root.style.setProperty('--wf-glass-bar-alpha', (clamp(glassPct + 12, 28, 90) / 100).toFixed(3))
  root.style.setProperty('--wf-glass-card-alpha', (clamp(glassPct - 6, 18, 82) / 100).toFixed(3))
  root.style.setProperty('--wf-glass-modal-alpha', (clamp(glassPct + 18, 40, 93) / 100).toFixed(3))
  root.style.setProperty('--wf-glass-pill-alpha', (clamp(glassPct - 2, 20, 84) / 100).toFixed(3))

  const resolvedFont = resolveFontStacks(appearance.fontFamily ?? 'auto', activeStyle)
  root.dataset.font = resolvedFont.effectiveId
  root.style.setProperty('--wf-font-sans', resolvedFont.definition.bodyStack)
  root.style.setProperty('--wf-font-heading', resolvedFont.definition.headingStack)
  root.style.setProperty('--wf-font-mono', resolvedFont.definition.monoStack)
}
