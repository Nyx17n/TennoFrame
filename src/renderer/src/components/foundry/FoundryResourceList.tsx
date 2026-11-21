import * as React from 'react'
import { AlertTriangle, Check, ExternalLink } from 'lucide-react'
import type { FoundryConsolidatedResource } from '@shared/schemas/pro-tools.schema'
import type { AppLanguage } from '@shared/schemas/settings.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { WarframeLocationRich } from '@/components/codex/CodexLocationVisuals'

export function FoundryResourceList({
  resources,
  lang,
  onUpdateOwned,
  onOpenCodexResource
}: {
  resources: readonly FoundryConsolidatedResource[]
  lang: AppLanguage
  onUpdateOwned: (resourceKey: string, nextOwned: number) => void
  onOpenCodexResource: (resourceId: string, name: string) => void
}): React.JSX.Element {
  if (resources.length === 0) {
    return (
      <Card className="p-8 text-center text-xs text-muted-foreground">
        Ajoutez une ou plusieurs Warframes / Armes ci-dessus (ou depuis le Codex) pour générer votre liste de courses Fonderie consolidée.
      </Card>
    )
  }

  return (
    <div className="grid gap-2">
      {resources.map((res) => {
        const done = res.missingCount === 0
        const name = lang === 'fr' ? res.nameFr : res.nameEn || res.nameFr
        const spot = lang === 'fr' ? res.bestSpotFr : res.bestSpotEn || res.bestSpotFr
        return (
          <Card
            key={res.key}
            className={`flex flex-wrap items-center justify-between gap-3 p-3 transition-colors ${
              done ? 'border-emerald-500/30 bg-emerald-500/5 opacity-75' : 'hover:border-primary/40'
            }`}
          >
            <div className="flex min-w-[220px] flex-1 items-center gap-3">
              <SafeAssetImage
                src={res.imageUrl}
                alt={name}
                className="h-9 w-9 shrink-0 rounded bg-secondary/50 object-contain p-1"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onOpenCodexResource(res.resourceId, name)}
                    className="flex items-center gap-1 text-left text-xs font-bold hover:text-primary"
                  >
                    <span>{name}</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </button>
                  {res.isArgonCrystal && !done && (
                    <Badge variant="destructive" className="gap-1 text-[10px]">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      Périssable 00:00 UTC
                    </Badge>
                  )}
                  {done && (
                    <Badge variant="default" className="bg-emerald-600 text-[10px] text-white">
                      Complet
                    </Badge>
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span>Meilleur spot :</span>
                  <WarframeLocationRich text={spot} compact />
                </div>
                <p className="truncate text-[10px] text-muted-foreground">
                  Requis par : {res.usedByNames.join(', ')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              {!done && (
                <Badge variant="outline" className="border-primary/40 text-primary">
                  Manque {res.missingCount.toLocaleString()}
                </Badge>
              )}
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  value={res.ownedCount}
                  onChange={(e) =>
                    onUpdateOwned(res.key, Math.max(0, Math.round(Number(e.target.value) || 0)))
                  }
                  className="h-7 w-24 text-right text-xs"
                />
                <span className="text-xs text-muted-foreground">
                  / {res.requiredCount.toLocaleString()}
                </span>
              </div>
              <Button
                size="sm"
                variant={done ? 'secondary' : 'outline'}
                onClick={() => onUpdateOwned(res.key, done ? 0 : res.requiredCount)}
                title={done ? 'Réinitialiser à 0' : 'Marquer comme intégralement possédé'}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
