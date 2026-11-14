import * as React from 'react'
import { ChevronDown, MessageSquare } from 'lucide-react'
import {
  getLanguageMeta,
  getRecommendedLabel,
  RECOMMENDED_WHISPER_LANGUAGE,
  WARFRAME_LANGUAGES,
  WHISPER_LANGUAGES
} from '@shared/data/languages'
import type { MarketPlatform } from '@shared/schemas/settings.schema'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { useUiTranslations } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'

const PLATFORMS: readonly MarketPlatform[] = ['pc', 'ps4', 'xbox', 'switch', 'mobile']

export function QuickMarketPopover(): React.JSX.Element {
  const market = useAppStore((s) => s.settings.market)
  const zoomPercent = useAppStore((s) => s.windowState.zoomPercent)
  const isCompact = useAppStore((s) => s.windowState.isCompactMode)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const setWindowZoom = useAppStore((s) => s.setWindowZoom)
  const { t } = useUiTranslations()

  const currentLangMeta = getLanguageMeta(market.language)
  const whisperLangMeta = getLanguageMeta(market.whisperLanguage)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" title={`${t.market.platformLabel} · ${currentLangMeta.nativeLabel}`}>
          <Badge variant="secondary" className="cursor-pointer uppercase hover:border-primary/50">
            <span>{market.platform}</span>
            {market.crossplay && <span>· Cross</span>}
            <span>· {currentLangMeta.shortCode}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Badge>
        </button>
      </PopoverTrigger>

      <PopoverContent className={cn('space-y-3 p-3', isCompact ? 'w-72' : 'w-80')}>
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground">
            {t.market.platformLabel}
          </span>
          <div className="grid grid-cols-5 gap-1">
            {PLATFORMS.map((plat) => (
              <button
                key={plat}
                type="button"
                onClick={() => void updateSettings({ market: { platform: plat } })}
                className={cn(
                  'rounded border px-1.5 py-1 text-[10px] font-semibold uppercase transition-colors',
                  market.platform === plat
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                )}
              >
                {plat}
              </button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between text-xs">
          <span>{t.market.crossplayLabel}</span>
          <Switch
            checked={market.crossplay}
            onCheckedChange={(checked) => void updateSettings({ market: { crossplay: checked } })}
          />
        </label>

        <div className="space-y-1.5 border-t border-border/60 pt-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-muted-foreground">
              {currentLangMeta.shortCode} · {currentLangMeta.nativeLabel}
            </span>
            <span className="text-[10px] text-muted-foreground">15 Warframe</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {WARFRAME_LANGUAGES.map((entry) => {
              const active = market.language === entry.id
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => void updateSettings({ market: { language: entry.id } })}
                  className={cn(
                    'flex items-center gap-1 rounded border px-1.5 py-1 text-left text-[10px] transition-colors',
                    active
                      ? 'border-primary bg-primary/15 font-semibold text-primary'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                  )}
                >
                  <span className="font-mono text-[9px] font-bold">{entry.shortCode}</span>
                  <span className="truncate">{entry.nativeLabel}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2 text-xs">
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <MessageSquare className="h-3 w-3 text-primary" />
            <span>/w :</span>
          </span>
          <select
            aria-label={t.market.whisperLanguageLabel}
            value={market.whisperLanguage}
            onChange={(e) =>
              void updateSettings({
                market: { whisperLanguage: e.target.value as typeof market.whisperLanguage }
              })
            }
            className="h-6 max-w-[195px] rounded border border-border bg-background px-1.5 text-[11px] font-medium text-foreground outline-none focus:border-primary"
          >
            {WHISPER_LANGUAGES.map((entry) => {
              const isRec = entry.id === RECOMMENDED_WHISPER_LANGUAGE
              return (
                <option key={entry.id} value={entry.id}>
                  {isRec ? '★ ' : ''}
                  {entry.shortCode} — {entry.nativeLabel}
                  {isRec ? ` (${getRecommendedLabel(market.language)})` : ''}
                </option>
              )
            })}
          </select>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-2 text-xs">
          <span className="text-[11px] text-muted-foreground">{t.shell.zoomLabel}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => void setWindowZoom(zoomPercent - 10)}
              className="rounded border border-border px-2 py-0.5 font-mono text-[11px] hover:border-primary"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => void setWindowZoom(100)}
              title={`${whisperLangMeta.shortCode}`}
              className="min-w-[42px] rounded border border-border px-1.5 py-0.5 font-mono text-[11px] font-semibold hover:border-primary"
            >
              {zoomPercent}%
            </button>
            <button
              type="button"
              onClick={() => void setWindowZoom(zoomPercent + 10)}
              className="rounded border border-border px-2 py-0.5 font-mono text-[11px] hover:border-primary"
            >
              +
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
