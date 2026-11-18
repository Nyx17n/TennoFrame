import * as React from 'react'
import { Bug, HelpCircle, Lightbulb, Loader2, MessageSquarePlus, Send } from 'lucide-react'
import { DISCORD_INVITE_URL } from '@shared/constants'
import { formatRouteUri } from '@shared/schemas/navigation.schema'
import type {
  SupportSanitizedAttachment,
  SupportTicketCategory,
  SupportTicketResult
} from '@shared/schemas/support.schema'
import {
  isCandidateRasterImageFile,
  SupportAttachmentDropzone
} from '@/components/modals/SupportAttachmentDropzone'
import { SupportTicketResultBanner } from '@/components/modals/SupportTicketResultBanner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { getFontAndSupportStrings } from '@/lib/i18n/typography-support-i18n'
import { getTabCurrentRoute } from '@/lib/tab-helpers'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { notify } from '@/stores/useNotificationStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function SupportTicketModal(): React.JSX.Element {
  const isOpen = useAppStore((s) => s.isSupportOpen)
  const setOpen = useAppStore((s) => s.setSupportOpen)
  const settings = useAppStore((s) => s.settings)
  const appVersion = useAppStore((s) => s.systemStatus?.appVersion ?? '2.14.0')
  const isCompactMode = useAppStore((s) => s.windowState.isCompactMode)
  const hubActive = useTabsStore((s) => s.hubActive)
  const tabs = useTabsStore((s) => s.tabs)
  const activeTabId = useTabsStore((s) => s.activeTabId)

  const [category, setCategory] = React.useState<SupportTicketCategory>('bug')
  const [subject, setSubject] = React.useState('')
  const [contact, setContact] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [attachment, setAttachment] = React.useState<SupportSanitizedAttachment | null>(null)
  const [isProcessingImage, setIsProcessingImage] = React.useState(false)
  const [imageError, setImageError] = React.useState<string | null>(null)
  const [includeDiagnostics, setIncludeDiagnostics] = React.useState(true)
  const [isSending, setIsSending] = React.useState(false)
  const [cooldownSec, setCooldownSec] = React.useState(0)
  const [dailyRemaining, setDailyRemaining] = React.useState(3)
  const [dailyMax, setDailyMax] = React.useState(3)
  const [result, setResult] = React.useState<SupportTicketResult | null>(null)

  const language = settings.market.language
  const strings = React.useMemo(() => getFontAndSupportStrings(language), [language])

  const activeRoute = React.useMemo(() => {
    if (hubActive) return 'wf://hub'
    const tab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]
    return tab ? formatRouteUri(getTabCurrentRoute(tab)) : 'wf://market'
  }, [hubActive, tabs, activeTabId])

  const diagPreview = `v${appVersion} · ${language.toUpperCase()} · ${
    settings.appearance.glassModeEnabled ? settings.appearance.glassStyle : 'opaque'
  } · font:${settings.appearance.fontFamily ?? 'auto'} · ${
    isCompactMode ? 'Compact' : 'Desktop'
  } · ${activeRoute}`

  React.useEffect(() => {
    if (!isOpen) return
    void ipcClient.support.getStatus().then((st) => {
      setCooldownSec(st.cooldownRemainingSec)
      setDailyRemaining(st.dailyRemaining)
      setDailyMax(st.dailyMax)
    })
  }, [isOpen])

  React.useEffect(() => {
    if (cooldownSec <= 0) return
    const timer = window.setInterval(() => {
      setCooldownSec((prev) => (prev > 1 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [cooldownSec])

  const isValid = subject.trim().length >= 5 && message.trim().length >= 15

  const handleSelectImageFile = React.useCallback(async (file: File): Promise<void> => {
    setImageError(null)
    const precheckErr = isCandidateRasterImageFile(file)
    if (precheckErr) {
      setImageError(precheckErr)
      return
    }
    setIsProcessingImage(true)
    try {
      const arrayBuf = await file.arrayBuffer()
      const res = await ipcClient.support.prepareAttachment({
        bytes: new Uint8Array(arrayBuf),
        fileNameHint: file.name
      })
      if (res.ok && res.attachment) {
        setAttachment(res.attachment)
        setImageError(null)
      } else {
        setImageError(res.errorMessage ?? 'Unsupported or unsafe image file.')
      }
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Unable to read image file.')
    } finally {
      setIsProcessingImage(false)
    }
  }, [])

  const handleDialogPaste = (e: React.ClipboardEvent<HTMLDivElement>): void => {
    if (isSending || isProcessingImage) return
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item && item.kind === 'file' && item.type.toLowerCase().startsWith('image/')) {
        const pastedFile = item.getAsFile()
        if (pastedFile) {
          e.preventDefault()
          void handleSelectImageFile(pastedFile)
          return
        }
      }
    }
  }

  const handleSubmit = async (e?: React.FormEvent): Promise<void> => {
    e?.preventDefault()
    if (!isValid || isSending || isProcessingImage || cooldownSec > 0 || dailyRemaining <= 0) {
      return
    }
    setIsSending(true)
    setResult(null)
    try {
      const res = await ipcClient.support.sendTicket({
        category,
        subject: subject.trim(),
        message: message.trim(),
        contact: contact.trim(),
        includeDiagnostics,
        activeRoute,
        attachment
      })
      setResult(res)
      if (res.cooldownRemainingSec > 0) setCooldownSec(res.cooldownRemainingSec)
      if (res.dailyRemaining !== undefined) setDailyRemaining(res.dailyRemaining)
      if (res.ok) {
        setSubject('')
        setMessage('')
        setAttachment(null)
        setImageError(null)
      }
    } finally {
      setIsSending(false)
    }
  }

  const handleCopyAndOpenDiscord = async (): Promise<void> => {
    const tag = category === 'bug' ? 'BUG' : category === 'feature' ? 'SUGGESTION' : 'SUPPORT'
    const formatted = [
      `**[${tag}] ${subject.trim() || 'TennoFrame Support'}**`,
      contact.trim() ? `Contact: ${contact.trim()}` : '',
      '',
      message.trim(),
      includeDiagnostics ? `\n\`${diagPreview}\`` : ''
    ]
      .filter(Boolean)
      .join('\n')
      .slice(0, 1000)

    await ipcClient.clipboard.writeText(formatted)
    notify({ kind: 'info', title: strings.supportCopiedToast, message: DISCORD_INVITE_URL })
    await ipcClient.window.openExternalUrl(DISCORD_INVITE_URL)
  }

  const activeCategoryLabel =
    category === 'bug'
      ? strings.supportCatBug
      : category === 'feature'
        ? strings.supportCatFeature
        : strings.supportCatHelp

  const placeholder =
    category === 'bug'
      ? strings.supportBugPlaceholder
      : category === 'feature'
        ? strings.supportFeaturePlaceholder
        : strings.supportHelpPlaceholder

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent
        onPaste={handleDialogPaste}
        className="max-h-[88vh] max-w-xl overflow-y-auto p-5"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <MessageSquarePlus className="h-4 w-4 text-primary" />
            <span>
              {strings.supportModalTitle} - {activeCategoryLabel}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs">{strings.supportModalSubtitle}</DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3 pt-1 text-xs">
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'bug', label: strings.supportCatBug, Icon: Bug },
                { id: 'feature', label: strings.supportCatFeature, Icon: Lightbulb },
                { id: 'help', label: strings.supportCatHelp, Icon: HelpCircle }
              ] as const
            ).map(({ id, label, Icon }) => {
              const active = category === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCategory(id)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 font-semibold transition-colors ${
                    active
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="font-medium text-foreground">{strings.supportSubjectLabel} *</span>
              <input
                type="text"
                value={subject}
                maxLength={90}
                disabled={isSending}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={strings.supportSubjectPlaceholder}
                className="w-full rounded-md border border-input bg-background/80 px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
            </label>
            <label className="space-y-1">
              <span className="font-medium text-foreground">{strings.supportContactLabel}</span>
              <input
                type="text"
                value={contact}
                maxLength={48}
                disabled={isSending}
                onChange={(e) => setContact(e.target.value)}
                placeholder={strings.supportContactPlaceholder}
                className="w-full rounded-md border border-input bg-background/80 px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{strings.supportMessageLabel} *</span>
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                {message.trim().length} / 1500
              </span>
            </div>
            <textarea
              rows={4}
              value={message}
              maxLength={1500}
              disabled={isSending}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={placeholder}
              className="w-full resize-y rounded-md border border-input bg-background/80 p-2.5 text-xs text-foreground outline-none focus:border-primary"
            />
          </label>

          <SupportAttachmentDropzone
            attachment={attachment}
            isProcessing={isProcessingImage}
            errorMessage={imageError}
            disabled={isSending}
            isCompactMode={isCompactMode}
            strings={strings}
            onSelectFile={(file) => void handleSelectImageFile(file)}
            onRemove={() => {
              setAttachment(null)
              setImageError(null)
            }}
          />

          <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border/80 bg-card/50 p-2.5">
            <input
              type="checkbox"
              checked={includeDiagnostics}
              disabled={isSending}
              onChange={(e) => setIncludeDiagnostics(e.target.checked)}
              className="mt-0.5 accent-[hsl(var(--primary))]"
            />
            <div className="min-w-0 space-y-0.5">
              <div className="text-[11px] font-medium text-foreground">
                {strings.supportDiagLabel}
              </div>
              {includeDiagnostics && (
                <div className="truncate font-mono text-[10px] text-primary/90">{diagPreview}</div>
              )}
            </div>
          </label>

          <SupportTicketResultBanner
            result={result}
            cooldownSec={cooldownSec}
            dailyRemaining={dailyRemaining}
            strings={strings}
            isSending={isSending}
            canRetry={isValid}
            onRetry={() => void handleSubmit()}
            onCopyAndOpenDiscord={() => void handleCopyAndOpenDiscord()}
            onOpenDiscordOnly={() => void ipcClient.window.openExternalUrl(DISCORD_INVITE_URL)}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span
              className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums ${
                dailyRemaining > 0
                  ? 'border-primary/35 bg-primary/10 text-primary'
                  : 'border-red-500/45 bg-red-500/10 text-red-300'
              }`}
            >
              {strings.supportDailyQuotaLabel}: {dailyRemaining} / {dailyMax}
            </span>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                ✕
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  !isValid ||
                  isSending ||
                  isProcessingImage ||
                  cooldownSec > 0 ||
                  dailyRemaining <= 0
                }
              >
                {isSending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>{isSending ? strings.supportSendingBtn : strings.supportSendBtn}</span>
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
