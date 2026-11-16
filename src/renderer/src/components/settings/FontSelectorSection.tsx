import * as React from 'react'
import { RotateCcw, Type } from 'lucide-react'
import {
  FONT_CATALOG,
  resolveFontStacks,
  type FontCategoryFilter
} from '@/lib/font-catalog'
import { getFontAndSupportStrings } from '@/lib/i18n/typography-support-i18n'
import { useAppStore } from '@/stores/useAppStore'

export function FontSelectorSection(): React.JSX.Element {
  const appearance = useAppStore((s) => s.settings.appearance)
  const language = useAppStore((s) => s.settings.market.language)
  const updateSettings = useAppStore((s) => s.updateSettings)

  const [category, setCategory] = React.useState<FontCategoryFilter>('all')
  const strings = React.useMemo(() => getFontAndSupportStrings(language), [language])
  const isFr = language === 'fr'

  const isMedievalStyle =
    Boolean(appearance.glassModeEnabled) && appearance.glassStyle === 'medieval'
  const selectedId = appearance.fontFamily ?? 'auto'
  const resolved = resolveFontStacks(selectedId, isMedievalStyle)

  const filteredFonts = React.useMemo(() => {
    if (category === 'all') return FONT_CATALOG
    return FONT_CATALOG.filter((f) => f.category === category || f.id === 'auto')
  }, [category])

  const categories: readonly { id: FontCategoryFilter; label: string }[] = [
    { id: 'all', label: strings.fontCatAll },
    { id: 'sans', label: strings.fontCatSans },
    { id: 'scifi', label: strings.fontCatScifi },
    { id: 'medieval', label: strings.fontCatMedieval },
    { id: 'mono-fun', label: strings.fontCatMonoFun }
  ]

  return (
    <section className="wf-glass-panel space-y-3 rounded-lg border border-border/80 bg-card/60 p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <Type className="h-4 w-4 shrink-0" />
            <span>{strings.fontTitle}</span>
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{strings.fontSubtitle}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            <span>{resolved.definition.glyph}</span>
            <span>
              {selectedId === 'auto'
                ? `Auto (${resolved.definition.name})`
                : resolved.definition.name}
            </span>
          </span>
          {selectedId !== 'auto' && (
            <button
              type="button"
              onClick={() => void updateSettings({ appearance: { fontFamily: 'auto' } })}
              className="wf-interactive-btn inline-flex items-center gap-1 rounded-md border border-border bg-secondary/60 px-2 py-0.5 text-[11px] text-foreground hover:border-primary/50 hover:text-primary"
            >
              <RotateCcw className="h-3 w-3" />
              <span>{strings.fontResetAuto}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => {
          const active = category === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                active
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border/70 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {filteredFonts.map((font) => {
          const active = selectedId === font.id
          const previewStack =
            font.id === 'auto' ? resolved.definition.headingStack : font.headingStack
          return (
            <button
              key={font.id}
              type="button"
              onClick={() => void updateSettings({ appearance: { fontFamily: font.id } })}
              className={`wf-card-lift flex flex-col items-start justify-between gap-1 rounded-lg border p-2.5 text-left transition-all ${
                active
                  ? 'border-primary bg-primary/12 shadow-[0_0_14px_-5px_hsl(var(--primary)/0.55)]'
                  : 'border-border/75 bg-background/55 hover:border-primary/45 hover:bg-secondary/35'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-1">
                <span
                  style={{ fontFamily: previewStack }}
                  className={`truncate text-xs font-bold ${
                    active ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {font.glyph} {font.name}
                </span>
                {active && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                )}
              </div>
              <span className="line-clamp-1 text-[10px] text-muted-foreground">
                {isFr ? font.badgeFr : font.badgeEn}
              </span>
              <span
                style={{ fontFamily: previewStack }}
                className="mt-0.5 truncate text-xs font-semibold tabular-nums text-amber-400/95"
              >
                {font.sampleText}
              </span>
            </button>
          )
        })}
      </div>

      <div className="rounded-md border border-primary/30 bg-background/70 p-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            {strings.fontPreviewTitle}
          </span>
          <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-bold tabular-nums text-amber-300">
            💎 145 Plat · 22.56 %
          </span>
        </div>
        <h4 className="mt-1 text-sm font-bold text-foreground">
          Nikana Prime — Set Complet · Cetus 18m 42s
        </h4>
        <div className="mt-1.5 truncate rounded border border-border/70 bg-card/70 px-2 py-1 font-mono text-[11px] text-primary">
          /w TennoPrime42 Hi! I want to buy: &quot;Nikana Prime Set&quot; for 145 platinum.
        </div>
      </div>
    </section>
  )
}
