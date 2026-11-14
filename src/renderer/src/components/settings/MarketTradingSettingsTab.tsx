import * as React from 'react'
import { Globe, MessageSquare } from 'lucide-react'
import { formatWhisperMessage, WARFRAME_LANGUAGES } from '@shared/data/languages'
import type { MarketPlatform } from '@shared/schemas/settings.schema'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
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
      <div>
        <h3 className="text-sm font-semibold">{t.market.settingsTitle}</h3>
        <p className="text-xs text-muted-foreground">{t.market.settingsDesc}</p>
      </div>

      <div className="space-y-3 rounded-md border border-border bg-background/50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
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

        <label className="flex cursor-pointer items-center justify-between text-xs">
          <span>{t.market.crossplayLabel}</span>
          <Switch
            checked={market.crossplay}
            onCheckedChange={(checked) => void updateSettings({ market: { crossplay: checked } })}
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
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

      <div className="space-y-3 rounded-md border border-border bg-background/50 p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span>{t.market.appLanguageLabel}</span>
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
        </div>

        <div className="space-y-2 border-t border-border/60 pt-3">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            <span>{t.market.whisperLanguageLabel}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-5">
            {WARFRAME_LANGUAGES.map((entry) => {
              const active = market.whisperLanguage === entry.id
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => void updateSettings({ market: { whisperLanguage: entry.id } })}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md border px-2 py-1 text-left text-[11px] transition-colors',
                    active
                      ? 'border-emerald-500/70 bg-emerald-500/15 font-semibold text-emerald-300'
                      : 'border-border bg-card/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <span className="font-mono text-[10px] font-bold">{entry.shortCode}</span>
                  <span className="truncate">{entry.nativeLabel}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded border border-border bg-card p-2.5 text-[11px]">
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
