import type { FontFamilyId, GlassStyle } from '@shared/schemas/settings.schema'

export type FontCategoryFilter = 'all' | 'sans' | 'scifi' | 'medieval' | 'mono-fun'

export interface FontOptionDefinition {
  readonly id: FontFamilyId
  readonly category: Exclude<FontCategoryFilter, 'all'> | 'auto'
  readonly glyph: string
  readonly name: string
  readonly badgeEn: string
  readonly badgeFr: string
  readonly sampleText: string
  readonly bodyStack: string
  readonly headingStack: string
  readonly monoStack: string
}

const INTL_SANS_FALLBACK =
  "'Segoe UI', 'Yu Gothic UI', 'Meiryo', 'Malgun Gothic', 'Microsoft YaHei UI', 'Microsoft JhengHei UI', 'Leelawadee UI', system-ui, sans-serif"

const INTL_SERIF_FALLBACK =
  "'Palatino Linotype', 'Book Antiqua', Georgia, 'Times New Roman', 'Yu Mincho', 'Batang', 'SimSun', serif"

const DEFAULT_MONO_STACK =
  "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace"

export const FONT_CATALOG: readonly FontOptionDefinition[] = [
  {
    id: 'auto',
    category: 'auto',
    glyph: '✦',
    name: 'Auto',
    badgeEn: 'Follows active style',
    badgeFr: 'Suit le style actif',
    sampleText: 'Aa · Nikana 145p',
    bodyStack: INTL_SANS_FALLBACK,
    headingStack: INTL_SANS_FALLBACK,
    monoStack: DEFAULT_MONO_STACK
  },
  {
    id: 'system',
    category: 'sans',
    glyph: '⊞',
    name: 'Segoe UI',
    badgeEn: 'Windows Native',
    badgeFr: 'Windows Natif',
    sampleText: 'Aa · Nikana 145p',
    bodyStack: INTL_SANS_FALLBACK,
    headingStack: INTL_SANS_FALLBACK,
    monoStack: DEFAULT_MONO_STACK
  },
  {
    id: 'inter',
    category: 'sans',
    glyph: '◆',
    name: 'Inter',
    badgeEn: 'Modern UI (Discord / GitHub)',
    badgeFr: 'UI Moderne (Discord / GitHub)',
    sampleText: 'Aa · Nikana 145p',
    bodyStack: `'Inter', ${INTL_SANS_FALLBACK}`,
    headingStack: `'Inter', ${INTL_SANS_FALLBACK}`,
    monoStack: DEFAULT_MONO_STACK
  },
  {
    id: 'roboto',
    category: 'sans',
    glyph: '●',
    name: 'Roboto',
    badgeEn: 'Universal Classic',
    badgeFr: 'Classique Universel',
    sampleText: 'Aa · Nikana 145p',
    bodyStack: `'Roboto', ${INTL_SANS_FALLBACK}`,
    headingStack: `'Roboto', ${INTL_SANS_FALLBACK}`,
    monoStack: DEFAULT_MONO_STACK
  },
  {
    id: 'poppins',
    category: 'sans',
    glyph: '◯',
    name: 'Poppins',
    badgeEn: 'Soft Geometric',
    badgeFr: 'Géométrique Douce',
    sampleText: 'Aa · Nikana 145p',
    bodyStack: `'Poppins', ${INTL_SANS_FALLBACK}`,
    headingStack: `'Poppins', ${INTL_SANS_FALLBACK}`,
    monoStack: DEFAULT_MONO_STACK
  },
  {
    id: 'montserrat',
    category: 'sans',
    glyph: '▲',
    name: 'Montserrat',
    badgeEn: 'Bold & Elegant',
    badgeFr: 'Élégante & Affirmée',
    sampleText: 'Aa · Nikana 145p',
    bodyStack: `'Montserrat', ${INTL_SANS_FALLBACK}`,
    headingStack: `'Montserrat', ${INTL_SANS_FALLBACK}`,
    monoStack: DEFAULT_MONO_STACK
  },
  {
    id: 'rajdhani',
    category: 'scifi',
    glyph: '⚡',
    name: 'Rajdhani',
    badgeEn: 'Sci-Fi HUD / Warframe',
    badgeFr: 'HUD Sci-Fi / Warframe',
    sampleText: 'AA · NIKANA 145P',
    bodyStack: `'Rajdhani', ${INTL_SANS_FALLBACK}`,
    headingStack: `'Rajdhani', ${INTL_SANS_FALLBACK}`,
    monoStack: DEFAULT_MONO_STACK
  },
  {
    id: 'orbitron',
    category: 'scifi',
    glyph: '◈',
    name: 'Orbitron',
    badgeEn: 'Futuristic Cephalon',
    badgeFr: 'Futuriste Céphalon',
    sampleText: 'AA · 145P',
    bodyStack: `'Orbitron', 'Rajdhani', ${INTL_SANS_FALLBACK}`,
    headingStack: `'Orbitron', ${INTL_SANS_FALLBACK}`,
    monoStack: DEFAULT_MONO_STACK
  },
  {
    id: 'medieval',
    category: 'medieval',
    glyph: '🏰',
    name: 'Cinzel & Palatino',
    badgeEn: 'Medieval / Duviri Grimoire',
    badgeFr: 'Médiéval / Grimoire Duviri',
    sampleText: 'Aa · Grimoire 145p',
    bodyStack: INTL_SERIF_FALLBACK,
    headingStack: `'Cinzel', ${INTL_SERIF_FALLBACK}`,
    monoStack: DEFAULT_MONO_STACK
  },
  {
    id: 'georgia',
    category: 'medieval',
    glyph: '📖',
    name: 'Georgia & Times',
    badgeEn: 'Classic Book Serif',
    badgeFr: 'Roman Classique',
    sampleText: 'Aa · Chronique 145p',
    bodyStack: `Georgia, 'Times New Roman', ${INTL_SERIF_FALLBACK}`,
    headingStack: `Georgia, 'Times New Roman', ${INTL_SERIF_FALLBACK}`,
    monoStack: DEFAULT_MONO_STACK
  },
  {
    id: 'jetbrains-mono',
    category: 'mono-fun',
    glyph: '⌨',
    name: 'JetBrains Mono',
    badgeEn: 'Developer Monospace',
    badgeFr: 'Code & Alignement Pro',
    sampleText: 'Aa · 145p [03:42]',
    bodyStack: `'JetBrains Mono', Consolas, ${INTL_SANS_FALLBACK}`,
    headingStack: `'JetBrains Mono', Consolas, ${INTL_SANS_FALLBACK}`,
    monoStack: DEFAULT_MONO_STACK
  },
  {
    id: 'comic',
    category: 'mono-fun',
    glyph: '😊',
    name: 'Comic Sans / Neue',
    badgeEn: 'Casual & Easy Reading',
    badgeFr: 'Décontractée & Lecture Aisée',
    sampleText: 'Aa · Tenno 145p',
    bodyStack: `'Comic Sans MS', 'Comic Neue', ${INTL_SANS_FALLBACK}`,
    headingStack: `'Comic Sans MS', 'Comic Neue', ${INTL_SANS_FALLBACK}`,
    monoStack: DEFAULT_MONO_STACK
  }
]

export function resolveFontStacks(
  selectedId: FontFamilyId,
  activeStyle: GlassStyle | 'off' = 'off'
): {
  readonly effectiveId: Exclude<FontFamilyId, 'auto'>
  readonly definition: FontOptionDefinition
} {
  if (selectedId === 'auto') {
    if (activeStyle === 'medieval') {
      const def = FONT_CATALOG.find((item) => item.id === 'medieval') ?? FONT_CATALOG[1]!
      return { effectiveId: 'medieval', definition: def }
    }
    if (activeStyle === 'orokin') {
      const base = FONT_CATALOG.find((item) => item.id === 'montserrat') ?? FONT_CATALOG[1]!
      return {
        effectiveId: 'montserrat',
        definition: {
          ...base,
          name: 'Cinzel & Montserrat',
          headingStack: `'Cinzel', 'Montserrat', ${INTL_SANS_FALLBACK}`
        }
      }
    }
    if (activeStyle === 'cephalon') {
      const base = FONT_CATALOG.find((item) => item.id === 'rajdhani') ?? FONT_CATALOG[1]!
      return {
        effectiveId: 'rajdhani',
        definition: {
          ...base,
          name: 'Orbitron & Rajdhani',
          headingStack: `'Orbitron', 'Rajdhani', ${INTL_SANS_FALLBACK}`
        }
      }
    }
    if (activeStyle === 'pom2-1999') {
      const def = FONT_CATALOG.find((item) => item.id === 'jetbrains-mono') ?? FONT_CATALOG[1]!
      return { effectiveId: 'jetbrains-mono', definition: def }
    }
    return { effectiveId: 'system', definition: FONT_CATALOG[1]! }
  }

  const definition =
    FONT_CATALOG.find((item) => item.id === selectedId) ?? FONT_CATALOG[1]!

  return { effectiveId: selectedId, definition }
}
