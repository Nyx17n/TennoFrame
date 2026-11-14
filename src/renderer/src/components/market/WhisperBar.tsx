import * as React from 'react'
import { Check, ChevronDown, Copy, Languages, MessageSquare, User, X } from 'lucide-react'
import { getLanguageMeta, WARFRAME_LANGUAGES } from '@shared/data/languages'
import { buildWhisperCommand } from '@shared/schemas/market.schema'
import type { AppLanguage } from '@shared/schemas/settings.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useUiTranslations } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { notify } from '@/stores/useNotificationStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function WhisperBar(): React.JSX.Element | null {
  const activeWhisper = useMarketStore((s) => s.activeWhisper)
  const whisperCopiedAt = useMarketStore((s) => s.whisperCopiedAt)
  const dismissWhisper = useMarketStore((s) => s.dismissWhisper)
  const whisperLanguage = useAppStore((s) => s.settings.market.whisperLanguage)
  const whisperExtensionEnabled = useAppStore((s) => s.settings.extensions.whisperBarPersistent)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const openTab = useTabsStore((s) => s.openTab)
  const { t } = useUiTranslations()

  const [justCopied, setJustCopied] = React.useState(true)

  React.useEffect(() => {
    if (!whisperCopiedAt) return
    setJustCopied(true)
    const timer = window.setTimeout(() => setJustCopied(false), 2500)
    return () => window.clearTimeout(timer)
  }, [whisperCopiedAt])

  if (!activeWhisper || !whisperExtensionEnabled) return null

  const commandText = buildWhisperCommand(activeWhisper, whisperLanguage)
  const whisperMeta = getLanguageMeta(whisperLanguage)

  const handleCopyAgain = async (): Promise<void> => {
    await ipcClient.clipboard.writeText(commandText)
    setJustCopied(true)
    notify({ kind: 'info', title: t.market.whisperCopiedBadge, message: commandText })
  }

  const handleSelectWhisperLanguage = async (nextLang: AppLanguage): Promise<void> => {
    await updateSettings({ market: { whisperLanguage: nextLang } })
    const nextCmd = buildWhisperCommand(activeWhisper, nextLang)
    await ipcClient.clipboard.writeText(nextCmd)
    setJustCopied(true)
    notify({
      kind: 'info',
      title: `${t.market.whisperCopiedBadge} (${getLanguageMeta(nextLang).shortCode})`,
      message: nextCmd
    })
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-primary/40 bg-primary/10 px-3 py-1.5 text-xs">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Badge variant="success" className="shrink-0">
          {justCopied ? <Check className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
          <span>{justCopied ? t.market.whisperCopiedBadge : t.market.whisperReadyBadge}</span>
        </Badge>
        <code className="truncate font-mono text-[11px] text-foreground">{commandText}</code>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="secondary" title={t.market.whisperLanguageLabel}>
              <Languages className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono text-[11px]">{whisperMeta.shortCode}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" side="top" className="w-72 p-2.5">
            <div className="mb-1.5 text-[10px] font-semibold text-muted-foreground">
              {t.market.whisperLanguageLabel}
            </div>
            <div className="grid grid-cols-3 gap-1">
              {WARFRAME_LANGUAGES.map((entry) => {
                const active = whisperLanguage === entry.id
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => void handleSelectWhisperLanguage(entry.id)}
                    className={cn(
                      'flex items-center gap-1 rounded border px-1.5 py-1 text-left text-[10px] transition-colors',
                      active
                        ? 'border-primary bg-primary/15 font-semibold text-primary'
                        : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span className="font-mono font-bold">{entry.shortCode}</span>
                    <span className="truncate">{entry.nativeLabel}</span>
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>

        <Button size="sm" variant="default" onClick={() => void handleCopyAgain()}>
          <Copy className="h-3.5 w-3.5" />
          <span>{t.market.copyButton}</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            openTab(
              { kind: 'market-user', slug: activeWhisper.ingameName.toLowerCase() },
              { title: activeWhisper.ingameName }
            )
          }
        >
          <User className="h-3.5 w-3.5" />
        </Button>

        <Button size="icon" variant="ghost" onClick={dismissWhisper} aria-label="Close /w bar">
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
