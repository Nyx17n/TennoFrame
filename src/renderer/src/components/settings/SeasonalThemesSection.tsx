import * as React from 'react'
import { Ban, Sparkles } from 'lucide-react'
import type { SeasonalTheme } from '@shared/schemas/settings.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { triggerSeasonalParticleBurst } from '@/components/shell/SeasonalInteractionCanvas'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'

function XmasEmblem(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 3L6.5 11H10L5 18H19L14 11H17.5L12 3Z" stroke="#22c55e" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 18V21" stroke="#eab308" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="8.5" r="1.3" fill="#ef4444" />
      <circle cx="9.5" cy="15" r="1.3" fill="#facc15" />
      <circle cx="14.5" cy="15" r="1.3" fill="#38bdf8" />
    </svg>
  )
}

function HalloweenEmblem(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M3 3L21 21M21 3L3 21M12 2V22M2 12H22" stroke="#c084fc" strokeWidth="1.2" opacity="0.65" />
      <polygon points="12,5 17,7 19,12 17,17 12,19 7,17 5,12 7,7" stroke="#a855f7" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2.6" fill="#d946ef" />
    </svg>
  )
}

function EasterEmblem(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 3.5C8 3.5 5.5 9.5 5.5 14C5.5 18.2 8.4 20.5 12 20.5C15.6 20.5 18.5 18.2 18.5 14C18.5 9.5 16 3.5 12 3.5Z"
        stroke="#f472b6"
        strokeWidth="1.7"
      />
      <path d="M6.2 12.5L9.2 10.5L12 12.5L14.8 10.5L17.8 12.5" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="16.5" r="1.3" fill="#6ee7b7" />
    </svg>
  )
}

interface SeasonOption {
  readonly id: SeasonalTheme
  readonly titleFr: string
  readonly titleEn: string
  readonly descFr: string
  readonly descEn: string
  readonly accentClass: string
  readonly renderIcon: () => React.JSX.Element
}

const SEASON_OPTIONS: readonly SeasonOption[] = [
  {
    id: 'none',
    titleFr: 'Aucun décor (Standard)',
    titleEn: 'None (Standard)',
    descFr: 'Contour de fenêtre classique sans habillage festif ni particules.',
    descEn: 'Clean standard window border with no festive overlay or particles.',
    accentClass: 'border-border/80',
    renderIcon: () => <Ban className="h-4 w-4 text-muted-foreground" />
  },
  {
    id: 'christmas',
    titleFr: 'Noël (Tennobaum)',
    titleEn: 'Christmas (Tennobaum)',
    descFr: 'Guirlandes lumineuses autour des 4 bords + cadeaux & confettis au clic.',
    descEn: 'Glowing pine garlands around all 4 edges + gifts & confetti on click.',
    accentClass: 'border-emerald-500/50',
    renderIcon: XmasEmblem
  },
  {
    id: 'halloween',
    titleFr: 'Halloween (Naberus)',
    titleEn: 'Halloween (Naberus)',
    descFr: 'Toiles d’araignée & araignées dans les coins + particules violettes au clic.',
    descEn: 'Corner cobwebs & hanging spiders + glowing violet particles on click.',
    accentClass: 'border-purple-500/50',
    renderIcon: HalloweenEmblem
  },
  {
    id: 'easter',
    titleFr: 'Pâques (Printemps Lepus)',
    titleEn: 'Easter (Lepus Spring)',
    descFr: 'Deux œufs décorés dans les coins + pétales pastel, mini-œufs & étincelles.',
    descEn: 'Two decorated corner eggs + pastel petals, mini-eggs & golden sparkles.',
    accentClass: 'border-pink-400/50',
    renderIcon: EasterEmblem
  }
]

export function SeasonalThemesSection(): React.JSX.Element {
  const appearance = useAppStore((s) => s.settings.appearance)
  const lang = useAppStore((s) => s.settings.market.language)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const isFr = lang === 'fr'

  const currentTheme: SeasonalTheme = appearance.seasonalTheme ?? 'none'
  const particlesEnabled = appearance.seasonalParticlesEnabled !== false

  const handleTestBurst = (e: React.MouseEvent<HTMLButtonElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    if (currentTheme !== 'none') {
      triggerSeasonalParticleBurst(cx, cy, currentTheme)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>
              {isFr ? 'Décors & Thèmes Saisonniers Interactifs' : 'Interactive Seasonal Overlays'}
            </span>
          </h3>
          <p className="text-xs text-muted-foreground">
            {isFr
              ? 'Habillage festif indépendant : conserve à 100 % votre transparence (Liquid Glass) et vos couleurs personnalisées.'
              : 'Independent festive layer: 100% compatible with transparency (Liquid Glass) and custom colors.'}
          </p>
        </div>

        <Badge variant="outline" className="border-sky-400/40 bg-sky-500/10 text-[10px] text-sky-200">
          {isFr ? 'Compatible Transparence & Couleurs' : 'Transparency & Color Safe'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SEASON_OPTIONS.map((opt) => {
          const active = currentTheme === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => void updateSettings({ appearance: { seasonalTheme: opt.id } })}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3 text-left transition-all',
                active
                  ? `bg-primary/12 ring-1 ring-primary/60 ${opt.accentClass}`
                  : 'border-border/75 bg-card/60 hover:border-primary/40 hover:bg-secondary/35'
              )}
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background/80">
                {opt.renderIcon()}
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-bold text-foreground">
                    {isFr ? opt.titleFr : opt.titleEn}
                  </span>
                  {active && (
                    <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                      {isFr ? 'Actif' : 'Active'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-snug text-muted-foreground">
                  {isFr ? opt.descFr : opt.descEn}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="space-y-3 rounded-lg border border-border/80 bg-card/60 p-3.5">
        <label className="flex cursor-pointer items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="font-semibold text-foreground">
              {isFr
                ? 'Particules lors des interactions (clics)'
                : 'Interaction particles on click'}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isFr
                ? 'Désactivez cette option pour garder uniquement le décor de fenêtre (guirlandes, toiles ou œufs) sans particules au clic.'
                : 'Disable this to keep only the window border/corner decor without click particles.'}
            </p>
          </div>
          <Switch
            checked={particlesEnabled}
            onCheckedChange={(checked) =>
              void updateSettings({ appearance: { seasonalParticlesEnabled: checked } })
            }
          />
        </label>

        {currentTheme !== 'none' && particlesEnabled && (
          <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-xs">
            <span className="text-[11px] text-muted-foreground">
              {isFr
                ? 'Cliquez n’importe où dans l’application pour voir les particules en direct :'
                : 'Click anywhere in the app to trigger particles live:'}
            </span>
            <Button size="sm" variant="secondary" onClick={handleTestBurst}>
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>{isFr ? 'Tester les particules' : 'Test particles'}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
