import * as React from 'react'
import {
  BookOpen,
  Clock,
  Coins,
  Flame,
  Hammer,
  History,
  ShoppingCart,
  Star,
  Store,
  TrendingUp,
  UserCheck,
  Wallet,
  Wrench,
  type LucideIcon
} from 'lucide-react'
import type { AppRoute, RouteKind } from '@shared/schemas/navigation.schema'
import { useUiTranslations, type UiMessages } from '@/lib/i18n'
import { getProToolsStrings, type ProToolsStrings } from '@/lib/i18n/pro-tools-i18n'
import { getTabCurrentRoute } from '@/lib/tab-helpers'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { useTabsStore } from '@/stores/useTabsStore'
import { useWfmAccountStore } from '@/stores/useWfmAccountStore'

interface BookmarkShortcut {
  readonly id: RouteKind
  readonly labelKey?: keyof UiMessages['bookmarks']
  readonly proLabelKey?: keyof ProToolsStrings
  readonly tooltip: string
  readonly icon: LucideIcon
  readonly route: AppRoute
}

const HISTORY_SHORTCUT: BookmarkShortcut = {
  id: 'browser-history',
  labelKey: 'history',
  tooltip: 'Ctrl+H · wf://history',
  icon: History,
  route: { kind: 'browser-history' }
}

const CENTER_SHORTCUTS: readonly BookmarkShortcut[] = [
  {
    id: 'market-home',
    labelKey: 'market',
    tooltip: 'wf://market',
    icon: Store,
    route: { kind: 'market-home' }
  },
  {
    id: 'market-favorites',
    labelKey: 'favorites',
    tooltip: 'wf://market/favorites',
    icon: Star,
    route: { kind: 'market-favorites' }
  },
  {
    id: 'market-cart',
    labelKey: 'cart',
    tooltip: 'wf://market/cart',
    icon: ShoppingCart,
    route: { kind: 'market-cart' }
  },
  {
    id: 'market-recent',
    labelKey: 'recent',
    tooltip: 'wf://market/recent',
    icon: Clock,
    route: { kind: 'market-recent' }
  },
  {
    id: 'codex-home',
    labelKey: 'codex',
    tooltip: 'wf://codex',
    icon: BookOpen,
    route: { kind: 'codex-home' }
  },
  {
    id: 'builds',
    proLabelKey: 'navBuilds',
    tooltip: 'wf://builds',
    icon: Wrench,
    route: { kind: 'builds' }
  },
  {
    id: 'foundry',
    proLabelKey: 'navFoundry',
    tooltip: 'wf://foundry',
    icon: Hammer,
    route: { kind: 'foundry' }
  },
  {
    id: 'profit-scanner',
    proLabelKey: 'navProfitScanner',
    tooltip: 'wf://market/profit-scanner',
    icon: TrendingUp,
    route: { kind: 'profit-scanner' }
  },
  {
    id: 'market-ducats',
    labelKey: 'ducats',
    tooltip: 'wf://market/ducats',
    icon: Coins,
    route: { kind: 'market-ducats' }
  },
  {
    id: 'market-rivens',
    labelKey: 'rivens',
    tooltip: 'wf://market/rivens',
    icon: Flame,
    route: { kind: 'market-rivens' }
  },
  {
    id: 'platinum-ledger',
    proLabelKey: 'navLedger',
    tooltip: 'wf://market/ledger',
    icon: Wallet,
    route: { kind: 'platinum-ledger' }
  },
  {
    id: 'wfm-account',
    labelKey: 'wfmAccount',
    tooltip: 'wf://wfm-account',
    icon: UserCheck,
    route: { kind: 'wfm-account' }
  }
]

export function BookmarksBar(): React.JSX.Element | null {
  const { t } = useUiTranslations()
  const lang = useAppStore((s) => s.settings.market.language)
  const proStrings = getProToolsStrings(lang)
  const navigateActive = useTabsStore((s) => s.navigateActive)
  const openTab = useTabsStore((s) => s.openTab)
  const hubActive = useTabsStore((s) => s.hubActive)
  const activeTab = useTabsStore((s) => s.tabs.find((t) => t.id === s.activeTabId) ?? s.tabs[0])

  const favoritesCount = useAppStore((s) => s.settings.favorites.length)
  const cartCount = useAppStore((s) => s.settings.cart.length)
  const ownSellCount = useWfmAccountStore((s) =>
    s.session.connected && s.overview ? s.overview.sellOrders.length : 0
  )

  if (hubActive) {
    return null
  }

  const currentKind: RouteKind | null = activeTab ? getTabCurrentRoute(activeTab).kind : null

  const getBadgeCount = (kind: RouteKind): number => {
    if (kind === 'market-favorites') return favoritesCount
    if (kind === 'market-cart') return cartCount
    if (kind === 'wfm-account') return ownSellCount
    return 0
  }

  const renderShortcutButton = (item: BookmarkShortcut): React.JSX.Element => {
    const Icon = item.icon
    const isActive = currentKind === item.id
    const badgeCount = getBadgeCount(item.id)

    return (
      <button
        key={item.id}
        type="button"
        title={`${item.tooltip} — Ctrl+Clic ou clic molette : nouvel onglet`}
        onClick={(e) => {
          if (e.ctrlKey || e.metaKey) {
            openTab(item.route)
          } else {
            navigateActive(item.route)
          }
        }}
        onMouseDown={(e) => {
          if (e.button === 1) e.preventDefault()
        }}
        onAuxClick={(e) => {
          if (e.button === 1) {
            e.preventDefault()
            openTab(item.route)
          }
        }}
        data-active={isActive ? 'true' : 'false'}
        className={cn(
          'wf-bookmark-link wf-interactive-btn inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors',
          isActive
            ? 'border-primary/50 bg-primary/15 text-foreground'
            : 'border-transparent text-muted-foreground hover:border-border/60 hover:bg-secondary/75 hover:text-foreground'
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="whitespace-nowrap">
          {item.proLabelKey
            ? proStrings[item.proLabelKey]
            : item.labelKey
              ? t.bookmarks[item.labelKey]
              : item.id}
        </span>
        {badgeCount > 0 && (
          <span className="rounded-full bg-primary/20 px-1.5 py-0 font-mono text-[10px] font-semibold text-primary">
            {badgeCount}
          </span>
        )}
      </button>
    )
  }

  return (
    <div
      onWheel={(e) => {
        if (e.currentTarget.scrollWidth > e.currentTarget.clientWidth && e.deltaY !== 0) {
          e.currentTarget.scrollLeft += e.deltaY
        }
      }}
      className="wf-shell-bar wf-no-scrollbar flex h-8 shrink-0 items-center gap-2 overflow-x-auto border-b border-border bg-card/55 px-2.5 lg:grid lg:grid-cols-[1fr_auto_1fr]"
      role="navigation"
      aria-label="Barre de raccourcis et outils"
    >
      <div className="hidden lg:block" aria-hidden="true" />

      <div className="flex shrink-0 items-center justify-center gap-1 justify-self-center">
        {CENTER_SHORTCUTS.map(renderShortcutButton)}
      </div>

      <div className="ml-auto flex shrink-0 items-center justify-self-end lg:ml-0">
        {renderShortcutButton(HISTORY_SHORTCUT)}
      </div>
    </div>
  )
}

