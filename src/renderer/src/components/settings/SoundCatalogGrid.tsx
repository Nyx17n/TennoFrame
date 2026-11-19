import * as React from 'react'
import { Check, Square, Volume2 } from 'lucide-react'
import type { SoundChoice } from '@shared/schemas/settings.schema'
import {
  WfAyaCrystalIcon,
  WfCephalonReticleIcon,
  WfLotusEmblemIcon,
  WfMaduraiGlyphIcon,
  WfNavigationStarIcon,
  WfOrdisCubeIcon,
  WfPlatinumCrestIcon,
  WfRelaySignalIcon,
  WfVazarinGlyphIcon,
  WfZenurikGlyphIcon,
  type WfIconProps
} from '@/components/settings/WarframeSettingsIcons'
import { Button } from '@/components/ui/button'
import { SOUND_CHOICES_CATALOG, type SoundCatalogItem } from '@/lib/sound-catalog'
import { cn } from '@/lib/utils'
import { playAlertSoundPreview, stopAlertSoundPreview } from '@/services/audio-preview.service'

const SOUND_ICONS: Record<SoundChoice, React.ComponentType<WfIconProps>> = {
  classic: WfRelaySignalIcon,
  bell: WfNavigationStarIcon,
  'orokin-chime': WfAyaCrystalIcon,
  'cephalon-ping': WfCephalonReticleIcon,
  'lotus-transmission': WfLotusEmblemIcon,
  'pom2-retro': WfOrdisCubeIcon,
  'platinum-coin': WfPlatinumCrestIcon,
  'eidolon-pulse': WfZenurikGlyphIcon,
  'stalker-whisper': WfMaduraiGlyphIcon,
  'soft-drop': WfVazarinGlyphIcon
}

export interface SoundCatalogGridProps {
  readonly selectedChoice: SoundChoice
  readonly soundEnabled: boolean
  readonly volumePercent: number
  readonly isEnglish: boolean
  readonly onSelectChoice: (choice: SoundChoice) => void
}

export function SoundCatalogGrid({
  selectedChoice,
  soundEnabled,
  volumePercent,
  isEnglish,
  onSelectChoice
}: SoundCatalogGridProps): React.JSX.Element {
  const [playingId, setPlayingId] = React.useState<SoundChoice | null>(null)
  const timerRef = React.useRef<number | null>(null)

  const clearTimer = React.useCallback((): void => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  React.useEffect(() => {
    return () => {
      clearTimer()
      stopAlertSoundPreview()
    }
  }, [clearTimer])

  const triggerPreview = React.useCallback(
    (item: SoundCatalogItem): void => {
      clearTimer()
      if (volumePercent <= 0) {
        setPlayingId(null)
        return
      }
      setPlayingId(item.id)
      void playAlertSoundPreview(item.id, volumePercent)
      timerRef.current = window.setTimeout(() => {
        setPlayingId((curr) => (curr === item.id ? null : curr))
        timerRef.current = null
      }, item.durationMs)
    },
    [clearTimer, volumePercent]
  )

  const handleCardClick = (item: SoundCatalogItem): void => {
    onSelectChoice(item.id)
    triggerPreview(item)
  }

  const handleStop = (): void => {
    clearTimer()
    stopAlertSoundPreview()
    setPlayingId(null)
  }

  const currentItem =
    SOUND_CHOICES_CATALOG.find((it) => it.id === selectedChoice) ?? SOUND_CHOICES_CATALOG[0]

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">
            {isEnglish ? 'Alert ringtone (10 Warframe themes)' : 'Sonnerie d’alerte (10 thèmes Warframe)'}
          </span>
          {!soundEnabled && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {isEnglish ? 'Muted' : 'Silencieux'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {playingId !== null && (
            <Button size="sm" variant="ghost" onClick={handleStop} className="h-7 px-2 text-[11px]">
              <Square className="h-3 w-3 fill-current text-primary" />
              <span>{isEnglish ? 'Stop' : 'Stop'}</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            disabled={volumePercent <= 0}
            onClick={() => currentItem && triggerPreview(currentItem)}
          >
            <Volume2 className="h-3.5 w-3.5 text-primary" />
            <span>{isEnglish ? 'Test sound' : 'Tester le son'}</span>
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'grid grid-cols-2 gap-1.5 transition-opacity',
          !soundEnabled && 'opacity-60'
        )}
      >
        {SOUND_CHOICES_CATALOG.map((item) => {
          const Icon = SOUND_ICONS[item.id]
          const isSelected = selectedChoice === item.id
          const isPlaying = playingId === item.id
          const label = isEnglish ? item.labelEn : item.labelFr
          const desc = isEnglish ? item.descEn : item.descFr

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleCardClick(item)}
              className={cn(
                'group flex items-start gap-2 rounded-md border px-2.5 py-2 text-left transition-colors',
                isSelected
                  ? 'border-primary/70 bg-primary/12 text-foreground shadow-xs'
                  : 'border-border/70 bg-background/40 text-foreground/90 hover:border-primary/40 hover:bg-accent/40'
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border transition-colors',
                  isSelected
                    ? 'border-primary/50 bg-primary/20 text-primary'
                    : 'border-border/60 bg-muted/40 text-muted-foreground group-hover:text-primary'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-1">
                  <span className="truncate text-[11px] font-semibold leading-tight">{label}</span>
                  {isPlaying ? (
                    <span className="shrink-0 rounded bg-primary/20 px-1 py-0.2 text-[9px] font-medium text-primary animate-pulse">
                      {isEnglish ? 'Playing' : 'En écoute'}
                    </span>
                  ) : isSelected ? (
                    <Check className="h-3 w-3 shrink-0 text-primary" />
                  ) : null}
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                  {desc}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
