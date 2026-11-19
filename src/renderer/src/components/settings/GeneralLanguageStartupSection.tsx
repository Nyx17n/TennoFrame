import * as React from 'react'
import { Play, ZoomIn, ZoomOut } from 'lucide-react'
import { WARFRAME_LANGUAGES } from '@shared/data/languages'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  WfLotusEmblemIcon,
  WfNavigationStarIcon
} from '@/components/settings/WarframeSettingsIcons'
import { useUiTranslations } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'

export function GeneralLanguageStartupSection(): React.JSX.Element {
  const { t } = useUiTranslations()
  const market = useAppStore((s) => s.settings.market)
  const appearance = useAppStore((s) => s.settings.appearance)
  const windowState = useAppStore((s) => s.windowState)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const setWindowZoom = useAppStore((s) => s.setWindowZoom)
  const replayStartupAnimation = useAppStore((s) => s.replayStartupAnimation)

  return (
    <div className="space-y-4">
      <Card className="space-y-3 border-border/80 bg-card/60 p-3.5">
        <div className="space-y-0.5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
            <WfNavigationStarIcon className="h-4 w-4 shrink-0" />
            <span>{t.market.appLanguageLabel}</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Sélectionnez la langue d’affichage globale de l’interface, du Codex et des menus parmi les 15 langues officielles de Warframe.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-5">
          {WARFRAME_LANGUAGES.map((entry) => {
            const active = market.language === entry.id
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => void updateSettings({ market: { language: entry.id } })}
                className={cn(
                  'flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-left text-xs transition-colors',
                  active
                    ? 'border-primary bg-primary/15 font-semibold text-primary'
                    : 'border-border bg-card/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <span className="rounded bg-secondary px-1 py-0.5 font-mono text-[10px] font-bold">
                  {entry.shortCode}
                </span>
                <span className="truncate">{entry.nativeLabel}</span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="space-y-3 border-border/80 bg-card/60 p-3.5 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <WfLotusEmblemIcon className="h-4 w-4 text-primary" />
              <span>Animation d’ouverture « Tenno » au lancement</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Affiche l’animation cinétique du Lotus à l’ouverture de l’application.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={replayStartupAnimation}>
              <Play className="h-3 w-3 text-primary" />
              <span>Rejouer</span>
            </Button>
            <Switch
              checked={appearance.startupAnimationEnabled}
              onCheckedChange={(checked) =>
                void updateSettings({ appearance: { startupAnimationEnabled: checked } })
              }
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
          <div>
            <div className="font-semibold text-foreground">
              Zoom d’interface natif ({windowState.zoomPercent} %)
            </div>
            <p className="text-[11px] text-muted-foreground">
              Ajuste la taille globale de TennoFrame selon votre résolution d’écran (1080p, 1440p, 4K).
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => void setWindowZoom(windowState.zoomPercent - 10)}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => void setWindowZoom(100)}>
              100 %
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => void setWindowZoom(windowState.zoomPercent + 10)}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
