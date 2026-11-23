import * as React from 'react'
import { MonitorCog, Sparkles, Wand2 } from 'lucide-react'
import type { AnimationLevel } from '@shared/schemas/settings.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { isOsReducedMotionPreferred, subscribeOsReducedMotion } from '@/lib/theme-engine'
import { useAppStore } from '@/stores/useAppStore'

const ANIMATION_LEVELS: readonly { id: AnimationLevel; label: string; hint: string }[] = [
  { id: 'full', label: 'Complètes', hint: 'Transitions fluides, cascades & micro-interactions' },
  { id: 'reduced', label: 'Réduites', hint: 'Fondus légers uniquement, sans déplacement' },
  { id: 'off', label: 'Désactivées', hint: 'Instantané (0 ms), hors spinners de chargement' }
]

export function MotionSettingsSection(): React.JSX.Element {
  const appearance = useAppStore((s) => s.settings.appearance)
  const updateSettings = useAppStore((s) => s.updateSettings)

  const [osReduced, setOsReduced] = React.useState(() => isOsReducedMotionPreferred())

  React.useEffect(
    () => subscribeOsReducedMotion(() => setOsReduced(isOsReducedMotionPreferred())),
    []
  )

  const currentLevel: AnimationLevel = appearance.animationLevel ?? 'full'
  const activeHint = ANIMATION_LEVELS.find((l) => l.id === currentLevel)?.hint ?? ''

  return (
    <div className="space-y-3 rounded-lg border border-border/80 bg-card/60 p-3.5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-2 font-semibold text-primary">
            <Wand2 className="h-4 w-4 text-primary" />
            <span>Animations & Fluidité de l’interface</span>
          </span>
          <div className="flex flex-wrap gap-1">
            {ANIMATION_LEVELS.map((lvl) => (
              <Button
                key={lvl.id}
                size="sm"
                variant={currentLevel === lvl.id ? 'default' : 'outline'}
                onClick={() => void updateSettings({ appearance: { animationLevel: lvl.id } })}
              >
                {lvl.label}
              </Button>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">{activeHint}</p>
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-border/60 pt-2.5 text-xs">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <MonitorCog className="h-3.5 w-3.5 text-primary" />
            <span>Respecter le réglage Windows « Afficher les animations »</span>
            {osReduced && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                Windows : réduites
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Si Windows réduit les mouvements, TennoFrame plafonne automatiquement sur « Réduites ».
          </p>
        </div>
        <Switch
          checked={appearance.respectOsReducedMotion !== false}
          onCheckedChange={(checked) =>
            void updateSettings({ appearance: { respectOsReducedMotion: checked } })
          }
        />
      </label>

      <label className="flex cursor-pointer items-center justify-between border-t border-border/60 pt-2.5 text-xs">
        <span className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Effet de lueur subtile sur les cartes (Glow Orokin)</span>
        </span>
        <Switch
          checked={appearance.glowEnabled}
          onCheckedChange={(checked) =>
            void updateSettings({ appearance: { glowEnabled: checked } })
          }
        />
      </label>

      <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-border/60 pt-2.5 text-xs">
        <div className="space-y-0.5">
          <span className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Particules au clic des thèmes saisonniers (Noël, Halloween, Pâques)</span>
          </span>
          <p className="text-[11px] text-muted-foreground">
            Désactive uniquement les particules d’interaction tout en conservant le décor de fenêtre.
          </p>
        </div>
        <Switch
          checked={appearance.seasonalParticlesEnabled !== false}
          onCheckedChange={(checked) =>
            void updateSettings({ appearance: { seasonalParticlesEnabled: checked } })
          }
        />
      </label>
    </div>
  )
}
