import * as React from 'react'
import { MessageSquare, Star } from 'lucide-react'
import {
  formatWhisperMessage,
  getRecommendedLabel,
  RECOMMENDED_WHISPER_LANGUAGE,
  WHISPER_LANGUAGES
} from '@shared/data/languages'
import type { MarketPlatform } from '@shared/schemas/settings.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { WfPlatinumCrestIcon } from '@/components/settings/WarframeSettingsIcons'
import { useUiTranslations } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'

const PLATFORMS: readonly MarketPlatform[] = ['pc', 'ps4', 'xbox', 'switch', 'mobile']

export function MarketTradingSettingsTab(): React.JSX.Element {
  const market = useAppStore((s) => s.settings.market)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const { t } = useUiTranslations()

  const sampleWhisper = formatWhisperMessage(
    {
      ingameName: 'TennoTrader',
      itemNameEn: 'Glaive Prime Set',
      itemNameFr: 'Glaive Prime Set',
      platinum: 320
    },
    market.whisperLanguage
  )

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lg border border-border/80 bg-card/60 p-3.5">
        <div className="space-y-0.5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
            <WfPlatinumCrestIcon className="h-4 w-4 shrink-0" />
            <span>{t.market.settingsTitle}</span>
          </h3>
          <p className="text-xs text-muted-foreground">{t.market.settingsDesc}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <span>{t.market.platformLabel}</span>
          <div className="flex flex-wrap gap-1">
            {PLATFORMS.map((plat) => (
              <Button
                key={plat}
                size="sm"
                variant={market.platform === plat ? 'default' : 'outline'}
                onClick={() => void updateSettings({ market: { platform: plat } })}
                className="uppercase"
              >
                {plat}
              </Button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between border-t border-border/60 pt-2.5 text-xs">
          <span>{t.market.crossplayLabel}</span>
          <Switch
            checked={market.crossplay}
            onCheckedChange={(checked) => void updateSettings({ market: { crossplay: checked } })}
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2.5 text-xs">
          <span>{t.market.defaultSellerFilter}</span>
          <div className="flex flex-wrap gap-1">
            {(
              [
                { id: 'ingame', label: t.market.sellerIngame },
                { id: 'online', label: t.market.sellerOnline },
                { id: 'all', label: t.market.sellerAll }
              ] as const
            ).map((opt) => (
              <Button
                key={opt.id}
                size="sm"
                variant={market.defaultSellerStatus === opt.id ? 'default' : 'outline'}
                onClick={() => void updateSettings({ market: { defaultSellerStatus: opt.id } })}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border/80 bg-card/60 p-3.5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-primary">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{t.market.whisperLanguageLabel}</span>
            </div>
            <Badge
              variant="outline"
              className="gap-1 border-emerald-500/50 bg-emerald-500/10 text-[10px] text-emerald-300"
            >
              <Star className="h-2.5 w-2.5 fill-emerald-400 text-emerald-400" />
              <span>EN · {getRecommendedLabel(market.language)}</span>
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-5">
            {WHISPER_LANGUAGES.map((entry) => {
              const active = market.whisperLanguage === entry.id
              const isRec = entry.id === RECOMMENDED_WHISPER_LANGUAGE
              return (
                <button
                  key={entry.id}
                  type="button"
                  title={
                    isRec
                      ? `${entry.nativeLabel} — ${getRecommendedLabel(market.language)}`
                      : entry.nativeLabel
                  }
                  onClick={() => void updateSettings({ market: { whisperLanguage: entry.id } })}
                  className={cn(
                    'flex items-center justify-between gap-1 rounded-md border px-2 py-1 text-left text-[11px] transition-colors',
                    active
                      ? 'border-emerald-500/70 bg-emerald-500/15 font-semibold text-emerald-300'
                      : isRec
                        ? 'border-emerald-500/40 bg-card/60 text-foreground hover:bg-secondary'
                        : 'border-border bg-card/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold">{entry.shortCode}</span>
                    <span className="truncate">{entry.nativeLabel}</span>
                  </span>
                  {isRec && <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />}
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded border border-border bg-background/70 p-2.5 text-[11px]">
          <div className="mb-1 flex items-center gap-1.5 font-semibold text-primary">
            <MessageSquare className="h-3 w-3" />
            <span>{t.market.whisperPreviewLabel}</span>
          </div>
          <code className="block break-all text-muted-foreground">{sampleWhisper}</code>
        </div>
      </div>
    </div>
  )
}
