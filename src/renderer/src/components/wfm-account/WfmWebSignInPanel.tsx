import * as React from 'react'
import { Globe, RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WfmWebSignInPanelProps {
  readonly webPending: boolean
  readonly onLaunchWebLogin: () => Promise<void>
}

export function WfmWebSignInPanel({
  webPending,
  onLaunchWebLogin
}: WfmWebSignInPanelProps): React.JSX.Element {
  return (
    <div className="space-y-3 rounded-lg border border-primary/40 bg-primary/10 p-4">
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Connexion Web Automatique (Steam, Discord, Google, Console, E-mail)</span>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Ouvre la page officielle <span className="font-mono text-foreground">warframe.market</span>{' '}
          dans une fenêtre navigateur sécurisée. Dès que vous êtes connecté, TennoFrame récupère
          votre profil et referme la fenêtre tout seul.
        </p>
      </div>

      <Button type="button" className="w-full gap-2" onClick={() => void onLaunchWebLogin()}>
        {webPending ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Globe className="h-4 w-4" />
        )}
        <span>
          {webPending
            ? 'Fenêtre ouverte — connectez-vous sur Warframe Market…'
            : 'Ouvrir la page de connexion Warframe Market'}
        </span>
      </Button>

      {webPending && (
        <p className="text-center text-[11px] text-primary">
          Astuce : si la fenêtre est passée en arrière-plan, recliquez sur le bouton ci-dessus pour
          la ramener devant, ou fermez-la pour annuler.
        </p>
      )}
    </div>
  )
}
