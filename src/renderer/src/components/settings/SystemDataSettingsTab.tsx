import * as React from 'react'
import {
  Download,
  FileText,
  MessageSquarePlus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WfOrdisCubeIcon } from '@/components/settings/WarframeSettingsIcons'
import { useAppStore } from '@/stores/useAppStore'

export function SystemDataSettingsTab({
  subTab = 'updates'
}: {
  subTab?: 'updates' | 'backup'
}): React.JSX.Element {
  const systemStatus = useAppStore((s) => s.systemStatus)
  const updaterStatus = useAppStore((s) => s.updaterStatus)
  const clearSystemCache = useAppStore((s) => s.clearSystemCache)
  const checkForUpdates = useAppStore((s) => s.checkForUpdates)
  const installUpdate = useAppStore((s) => s.installUpdate)
  const setChangelogOpen = useAppStore((s) => s.setChangelogOpen)
  const setSupportOpen = useAppStore((s) => s.setSupportOpen)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)
  const exportSettingsJson = useAppStore((s) => s.exportSettingsJson)
  const importSettingsJson = useAppStore((s) => s.importSettingsJson)
  const resetSettings = useAppStore((s) => s.resetSettings)

  const [feedback, setFeedback] = React.useState<string | null>(null)

  const showFeedback = (msg: string): void => {
    setFeedback(msg)
    window.setTimeout(() => setFeedback(null), 3500)
  }

  if (subTab === 'backup') {
    return (
      <div className="space-y-4">
        <div className="space-y-3 rounded-lg border border-border/80 bg-card/60 p-3.5 text-xs">
          <div className="space-y-0.5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
              <WfOrdisCubeIcon className="h-4 w-4 shrink-0" />
              <span>Sauvegarde, Importation JSON & Réinitialisation</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Exportez tous vos réglages (thèmes, raccourcis, alertes, ordre des onglets) dans un fichier JSON portable ou restaurez-les sur un autre PC.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  void exportSettingsJson()
                    .then((ok) => ok && showFeedback('Configuration exportée avec succès.'))
                    .catch((e: unknown) =>
                      showFeedback(e instanceof Error ? e.message : 'Erreur export')
                    )
                }
              >
                <Download className="h-3.5 w-3.5 text-primary" />
                <span>Exporter JSON</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  void importSettingsJson()
                    .then((ok) => ok && showFeedback('Configuration importée et validée par Zod.'))
                    .catch((e: unknown) =>
                      showFeedback(e instanceof Error ? e.message : 'JSON invalide')
                    )
                }
              >
                <Upload className="h-3.5 w-3.5 text-primary" />
                <span>Importer JSON</span>
              </Button>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                void resetSettings().then(() =>
                  showFeedback('Réglages réinitialisés par défaut.')
                )
              }
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Réinitialiser tout</span>
            </Button>
          </div>

          {systemStatus && (
            <div className="border-t border-border/60 pt-2.5 font-mono text-[10px] text-muted-foreground">
              Dossier local : {systemStatus.userDataPath}
            </div>
          )}

          {feedback && <p className="text-[11px] font-medium text-primary">{feedback}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lg border border-border/80 bg-card/60 p-3.5 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <WfOrdisCubeIcon className="h-4 w-4 text-primary" />
            <span className="font-semibold">Version installée</span>
            <Badge variant="default">v{systemStatus?.appVersion ?? '2.0.0'}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSettingsOpen(false)
                setSupportOpen(true)
              }}
            >
              <MessageSquarePlus className="h-3.5 w-3.5 text-primary" />
              <span>Support / Bug</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSettingsOpen(false)
                setChangelogOpen(true)
              }}
            >
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Notes de Patch</span>
            </Button>
            {updaterStatus?.state === 'downloaded' ? (
              <Button size="sm" onClick={() => void installUpdate()}>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Installer v{updaterStatus.availableVersion} & Redémarrer</span>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                disabled={updaterStatus?.state === 'checking'}
                onClick={() =>
                  void checkForUpdates().catch((e: unknown) =>
                    showFeedback(e instanceof Error ? e.message : 'Erreur vérification')
                  )
                }
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${updaterStatus?.state === 'checking' ? 'animate-spin' : ''}`}
                />
                <span>Vérifier MAJ</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>
              {updaterStatus?.message ??
                'Intégrité cryptographique SHA-512 activée (electron-updater)'}
            </span>
          </span>
          {updaterStatus?.progressPercent !== null &&
            updaterStatus?.progressPercent !== undefined && (
              <Badge variant="secondary">{updaterStatus.progressPercent}%</Badge>
            )}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border/80 bg-card/60 p-3.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="font-semibold">Cache Mémoire & Icônes Disque (wf-asset://)</div>
            <div className="text-[11px] text-muted-foreground">
              Entrées actives en RAM : {systemStatus?.memoryCacheEntries ?? 0}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              void clearSystemCache()
                .then(() => showFeedback('Cache mémoire et icônes purgés.'))
                .catch((e: unknown) =>
                  showFeedback(e instanceof Error ? e.message : 'Erreur purge cache')
                )
            }
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Purger le cache</span>
          </Button>
        </div>
        {feedback && <p className="text-[11px] font-medium text-primary">{feedback}</p>}
      </div>
    </div>
  )
}
