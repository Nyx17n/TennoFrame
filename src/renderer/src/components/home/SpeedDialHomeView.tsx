import * as React from 'react'
import {
  BookOpen,
  Clock,
  Coins,
  Compass,
  Flame,
  Globe,
  Search,
  ShoppingCart,
  Star,
  Store,
  UserCheck
} from 'lucide-react'
import {
  formatSlugTitle,
  parseInputToRoute,
  type AppRoute
} from '@shared/schemas/navigation.schema'
import { SpeedDialCyclesStrip } from '@/components/home/SpeedDialCyclesStrip'
import { Button } from '@/components/ui/button'
import { getLayoutErgonomicsStrings } from '@/lib/i18n/layout-ergonomics-i18n'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function SpeedDialHomeView(): React.JSX.Element {
  const language = useAppStore((s) => s.settings.market.language)
  const favorites = useAppStore((s) => s.settings.favorites)
  const cartCount = useAppStore((s) => s.settings.cart.length)
  const setOmniboxOpen = useAppStore((s) => s.setOmniboxOpen)

  const navigateActive = useTabsStore((s) => s.navigateActive)
  const activateHub = useTabsStore((s) => s.activateHub)
  const history = useTabsStore((s) => s.navigationHistory)

  const [query, setQuery] = React.useState('')
  const strings = React.useMemo(() => getLayoutErgonomicsStrings(language), [language])

  const handleSearchSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) {
      setOmniboxOpen(true)
      return
    }
    const route = parseInputToRoute(trimmed)
    navigateActive(route)
  }

  const quickTiles: readonly {
    id: string
    title: string
    desc: string
    Icon: typeof Store
    badge?: string
    onClick: () => void
  }[] = [
    {
      id: 'market',
      title: strings.targetMarket,
      desc: strings.tileMarketDesc,
      Icon: Store,
      onClick: () => navigateActive({ kind: 'market-home' })
    },
    {
      id: 'hub',
      title: strings.targetHub,
      desc: strings.tileHubDesc,
      Icon: Globe,
      onClick: () => activateHub()
    },
    {
      id: 'codex',
      title: strings.targetCodex,
      desc: strings.tileCodexDesc,
      Icon: BookOpen,
      onClick: () => navigateActive({ kind: 'codex-home' })
    },
    {
      id: 'account',
      title: strings.targetWfmAccount,
      desc: strings.tileAccountDesc,
      Icon: UserCheck,
      onClick: () => navigateActive({ kind: 'wfm-account' })
    },
    {
      id: 'cart',
      title: 'Cart & Trade Bundler',
      desc: strings.tileCartDesc,
      Icon: ShoppingCart,
      ...(cartCount > 0 ? { badge: String(cartCount) } : {}),
      onClick: () => navigateActive({ kind: 'market-cart' })
    },
    {
      id: 'ducats',
      title: 'Ducanator',
      desc: strings.tileDucatsDesc,
      Icon: Coins,
      onClick: () => navigateActive({ kind: 'market-ducats' })
    },
    {
      id: 'rivens',
      title: 'Riven Contracts',
      desc: strings.tileRivensDesc,
      Icon: Flame,
      onClick: () => navigateActive({ kind: 'market-rivens' })
    }
  ]

  const topFavorites = favorites.slice(0, 8)
  const recentEntries = React.useMemo(
    () => history.filter((h) => h.route.kind !== 'speed-dial').slice(0, 6),
    [history]
  )

  const openRoute = (route: AppRoute): void => {
    navigateActive(route)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
      {/* Hero + Central Search Bar */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2">
          <img src="./images/logo.png" alt="TennoFrame" className="h-7 w-7 object-contain" />
          <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {strings.speedDialTitle}
          </h1>
        </div>
        <p className="text-xs text-muted-foreground">{strings.speedDialSubtitle}</p>

        <form onSubmit={handleSearchSubmit} className="mx-auto flex max-w-2xl items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={strings.speedDialSearchPlaceholder}
              className="h-10 w-full rounded-lg border border-border bg-card/80 pl-9 pr-16 text-xs text-foreground outline-none transition-colors focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setOmniboxOpen(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hover:text-foreground"
            >
              Ctrl+K
            </button>
          </div>
          <Button type="submit" size="sm" className="h-10 px-4">
            <Compass className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Live Worldstate Cycles Strip */}
      <SpeedDialCyclesStrip strings={strings} />

      {/* 7 Quick Access Tiles */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {strings.speedDialQuickAccess}
        </h2>
        <div className="wf-stagger-grid grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {quickTiles.map(({ id, title, desc, Icon, badge, onClick }) => (
            <button
              key={id}
              type="button"
              onClick={onClick}
              className="wf-glow-surface wf-card-lift group flex items-start gap-3 rounded-lg border border-border/80 bg-card/65 p-3 text-left transition-colors hover:border-primary/55"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="truncate text-xs font-bold text-foreground group-hover:text-primary">
                    {title}
                  </span>
                  {badge && (
                    <span className="rounded-full bg-primary/20 px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums text-primary">
                      {badge}
                    </span>
                  )}
                </div>
                <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                  {desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pinned Market Favorites + Recently Visited */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="wf-glow-surface space-y-2.5 rounded-lg border border-border/80 bg-card/60 p-3.5">
          <div className="flex items-center justify-between">
            <h3 className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <span>{strings.speedDialFavoritesTitle}</span>
            </h3>
            {favorites.length > 0 && (
              <button
                type="button"
                onClick={() => navigateActive({ kind: 'market-favorites' })}
                className="text-[11px] font-medium text-primary hover:underline"
              >
                ({favorites.length}) →
              </button>
            )}
          </div>

          {topFavorites.length === 0 ? (
            <div className="space-y-2 rounded-md border border-dashed border-border/80 bg-background/40 p-3 text-xs text-muted-foreground">
              <p>{strings.speedDialFavoritesEmpty}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigateActive({ kind: 'market-catalog' })}
              >
                {strings.speedDialExploreMarketBtn}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {topFavorites.map((slug) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => navigateActive({ kind: 'market-item', slug })}
                  className="flex items-center justify-between gap-2 rounded-md border border-border/70 bg-background/55 px-2.5 py-1.5 text-left text-xs transition-colors hover:border-primary/45 hover:text-primary"
                >
                  <span className="truncate font-medium">{formatSlugTitle(slug)}</span>
                  <span className="text-[10px] text-muted-foreground">→</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="wf-glow-surface space-y-2.5 rounded-lg border border-border/80 bg-card/60 p-3.5">
          <div className="flex items-center justify-between">
            <h3 className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>{strings.speedDialRecentTitle}</span>
            </h3>
            {recentEntries.length > 0 && (
              <button
                type="button"
                onClick={() => navigateActive({ kind: 'browser-history' })}
                className="text-[11px] font-medium text-primary hover:underline"
              >
                Ctrl+H →
              </button>
            )}
          </div>

          {recentEntries.length === 0 ? (
            <div className="rounded-md border border-dashed border-border/80 bg-background/40 p-3 text-xs text-muted-foreground">
              {strings.speedDialRecentEmpty}
            </div>
          ) : (
            <div className="space-y-1">
              {recentEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => openRoute(entry.route)}
                  className="flex w-full items-center justify-between gap-2 rounded-md border border-border/60 bg-background/50 px-2.5 py-1.5 text-left text-xs transition-colors hover:border-primary/45 hover:text-primary"
                >
                  <span className="truncate font-medium">{entry.title}</span>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">→</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
