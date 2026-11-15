import * as React from 'react'
import { AlertTriangle, Globe, ShieldCheck } from 'lucide-react'
import type { WfmPresenceStatus } from '@shared/schemas/wfm-account.schema'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useWfmAccountStore } from '@/stores/useWfmAccountStore'
import { WfmWebSignInPanel } from './WfmWebSignInPanel'

export function WfmSignInModal(): React.JSX.Element {
  const open = useWfmAccountStore((s) => s.signInModalOpen)
  const closeSignInModal = useWfmAccountStore((s) => s.closeSignInModal)
  const signInWeb = useWfmAccountStore((s) => s.signInWeb)

  const [initialStatus, setInitialStatus] = React.useState<WfmPresenceStatus>('ingame')
  const [webPending, setWebPending] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setErrorMsg(null)
      setWebPending(false)
    }
  }, [open])

  const handleLaunchWebLogin = async (): Promise<void> => {
    setErrorMsg(null)
    setWebPending(true)
    try {
      await signInWeb({ initialStatus })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Échec de la connexion Web Warframe Market.'
      if (!msg.toLowerCase().includes('annulée')) {
        setErrorMsg(msg)
      }
    } finally {
      setWebPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeSignInModal()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-primary" />
            <span>Connexion à Warframe Market</span>
          </DialogTitle>
          <DialogDescription>
            Connectez-vous via la page officielle Warframe Market (Steam, Discord, Google, Console
            ou E-mail). TennoFrame détecte votre compte automatiquement sans aucun mot de passe ni
            cookie à copier.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 bg-background/60 px-3 py-2">
          <span className="text-xs text-muted-foreground">Statut initial à la connexion :</span>
          <div className="flex items-center gap-1">
            {(
              [
                ['ingame', '🟢 En jeu'],
                ['online', '🟣 En ligne'],
                ['invisible', '⚫ Invisible']
              ] as const
            ).map(([st, label]) => (
              <button
                key={st}
                type="button"
                onClick={() => setInitialStatus(st)}
                className={cn(
                  'rounded border px-2 py-1 text-[11px] font-medium transition-colors',
                  initialStatus === st
                    ? 'border-primary bg-primary/15 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <WfmWebSignInPanel webPending={webPending} onLaunchWebLogin={handleLaunchWebLogin} />

        {errorMsg && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-2.5 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>Session chiffrée sur votre PC via Windows DPAPI</span>
          </div>
          <Button type="button" size="sm" variant="ghost" onClick={closeSignInModal}>
            Continuer sans compte
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
