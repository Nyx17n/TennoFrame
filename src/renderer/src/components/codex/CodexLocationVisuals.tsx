import * as React from 'react'
import { ChevronRight, Globe, Sparkles } from 'lucide-react'
import {
  extractMentionedPlanets,
  type WarframePlanetInfo
} from '@shared/data/warframe-planets'
import { parseWarframeLocation } from '@shared/lib/warframe-location-parser'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'

export function PlanetCutoutPill({
  planet,
  subRegion,
  compact = false,
  isFrench = true
}: {
  planet: WarframePlanetInfo
  subRegion?: string | null
  compact?: boolean
  isFrench?: boolean
}): React.JSX.Element {
  const planetName = isFrench ? planet.nameFr : planet.nameEn
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border border-sky-400/35 bg-sky-500/12 font-semibold text-sky-200',
        compact ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-[11px]'
      )}
    >
      <SafeAssetImage
        src={planet.imageUrl}
        alt={planetName}
        className={cn(
          'shrink-0 rounded-full object-contain drop-shadow-xs',
          compact ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5'
        )}
        fallback={<Globe className={cn('shrink-0 text-sky-300', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} />}
      />
      <span>{planetName}</span>
      {subRegion && !compact && (
        <span className="font-normal text-sky-300/80">({subRegion})</span>
      )}
    </span>
  )
}

export function PlanetChipsRow({
  text,
  compact = false,
  showRawNote = true,
  className
}: {
  text: string
  compact?: boolean
  showRawNote?: boolean
  className?: string
}): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const isFrench = lang === 'fr'
  const planets = React.useMemo(() => extractMentionedPlanets(text, 8), [text])

  if (planets.length === 0) {
    return <span className={className}>{text}</span>
  }

  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1.5', className)}>
      {planets.map((p) => (
        <PlanetCutoutPill key={p.id} planet={p} compact={compact} isFrench={isFrench} />
      ))}
      {showRawNote && (
        <span className={cn('text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')}>
          {text}
        </span>
      )}
    </span>
  )
}

export function WarframeLocationRich({
  text,
  compact = false,
  className
}: {
  text: string
  compact?: boolean
  className?: string
}): React.JSX.Element {
  const lang = useAppStore((s) => s.settings.market.language)
  const isFrench = lang === 'fr'
  const parsed = React.useMemo(() => parseWarframeLocation(text, isFrench), [text, isFrench])

  if (parsed.planet) {
    return (
      <span
        title={text}
        className={cn(
          'inline-flex max-w-full flex-wrap items-center',
          compact ? 'gap-1' : 'gap-1.5',
          className
        )}
      >
        <PlanetCutoutPill
          planet={parsed.planet}
          subRegion={parsed.planetSubRegion}
          compact={compact}
          isFrench={isFrench}
        />

        {parsed.nodeName && (
          <>
            <ChevronRight
              className={cn('shrink-0 text-muted-foreground/70', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')}
            />
            <span
              className={cn(
                'inline-flex max-w-full items-center truncate rounded border border-amber-400/45 bg-amber-500/15 font-semibold text-amber-200',
                compact ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-[11px]'
              )}
            >
              {parsed.nodeName}
            </span>
          </>
        )}

        {parsed.missionType && (
          <span
            className={cn(
              'inline-flex max-w-full items-center truncate rounded border border-cyan-400/40 bg-cyan-500/15 font-medium text-cyan-200',
              compact ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-[11px]'
            )}
          >
            {parsed.missionType}
          </span>
        )}

        {parsed.rotation && (
          <span
            className={cn(
              'inline-flex shrink-0 items-center rounded border border-violet-400/40 bg-violet-500/15 font-mono font-semibold text-violet-200',
              compact ? 'px-1 py-0 text-[9px]' : 'px-1.5 py-0.5 text-[10px]'
            )}
          >
            {parsed.rotation}
          </span>
        )}

        {parsed.isSteelPath && (
          <span
            className={cn(
              'inline-flex shrink-0 items-center rounded border border-rose-400/45 bg-rose-500/15 font-semibold text-rose-200',
              compact ? 'px-1 py-0 text-[9px]' : 'px-1.5 py-0.5 text-[10px]'
            )}
          >
            {isFrench ? 'Route Acier' : 'Steel Path'}
          </span>
        )}
      </span>
    )
  }

  if (parsed.relicLabel) {
    return (
      <span
        title={text}
        className={cn(
          'inline-flex max-w-full items-center gap-1 truncate rounded border border-amber-500/35 bg-amber-500/10 font-semibold text-amber-200',
          compact ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-[11px]',
          className
        )}
      >
        <Sparkles className="h-3 w-3 shrink-0 text-amber-400" />
        <span className="truncate">{parsed.relicLabel}</span>
      </span>
    )
  }

  if (parsed.multiPlanets.length > 0) {
    return (
      <span
        title={text}
        className={cn('inline-flex max-w-full flex-wrap items-center gap-1', className)}
      >
        {parsed.multiPlanets.slice(0, compact ? 3 : 6).map((p) => (
          <PlanetCutoutPill key={p.id} planet={p} compact={compact} isFrench={isFrench} />
        ))}
        <span className={cn('truncate text-foreground/90', compact ? 'text-[10px]' : 'text-xs')}>
          {parsed.fallbackText}
        </span>
      </span>
    )
  }

  return (
    <span
      title={text}
      className={cn('inline-flex max-w-full flex-wrap items-center gap-1.5', className)}
    >
      <span className={cn('truncate font-medium text-foreground', compact ? 'text-[10px]' : 'text-xs')}>
        {parsed.fallbackText}
      </span>
      {parsed.rotation && (
        <span className="rounded border border-violet-400/40 bg-violet-500/15 px-1.5 py-0 font-mono text-[10px] text-violet-200">
          {parsed.rotation}
        </span>
      )}
      {parsed.isSteelPath && (
        <span className="rounded border border-rose-400/45 bg-rose-500/15 px-1.5 py-0 text-[10px] font-semibold text-rose-200">
          {isFrench ? 'Route Acier' : 'Steel Path'}
        </span>
      )}
    </span>
  )
}
