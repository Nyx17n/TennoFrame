import * as React from 'react'
import { SeasonalDecorFrames } from '@/components/shell/SeasonalDecorFrames'
import { SeasonalInteractionCanvas } from '@/components/shell/SeasonalInteractionCanvas'
import { useAppStore } from '@/stores/useAppStore'

export function SeasonalThemeLayer(): React.JSX.Element | null {
  const seasonalTheme = useAppStore((s) => s.settings.appearance.seasonalTheme ?? 'none')
  const particlesEnabled = useAppStore(
    (s) => s.settings.appearance.seasonalParticlesEnabled !== false
  )
  const animationLevel = useAppStore((s) => s.settings.appearance.animationLevel ?? 'full')
  const isCompactMode = useAppStore((s) => s.windowState.isCompactMode)

  if (seasonalTheme === 'none') {
    return null
  }

  const showParticles = particlesEnabled && animationLevel !== 'off'

  return (
    <>
      <SeasonalDecorFrames theme={seasonalTheme} compact={isCompactMode} />
      {showParticles && <SeasonalInteractionCanvas theme={seasonalTheme} />}
    </>
  )
}
