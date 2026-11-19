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
import type { AppRoute } from '@shared/schemas/navigation.schema'
import type { AppLanguage, BookmarkItemId } from '@shared/schemas/settings.schema'
import type { UiMessages } from '@/lib/i18n'
import { getProToolsStrings, type ProToolsStrings } from '@/lib/i18n/pro-tools-i18n'

export interface BookmarkDefinition {
  readonly id: BookmarkItemId
  readonly labelKey?: keyof UiMessages['bookmarks']
  readonly proLabelKey?: keyof ProToolsStrings
  readonly tooltip: string
  readonly icon: LucideIcon
  readonly route: AppRoute
}

export const BOOKMARK_DEFINITIONS: Readonly<Record<BookmarkItemId, BookmarkDefinition>> = {
  'market-home': {
    id: 'market-home',
    labelKey: 'market',
    tooltip: 'wf://market',
    icon: Store,
    route: { kind: 'market-home' }
  },
  'market-favorites': {
    id: 'market-favorites',
    labelKey: 'favorites',
    tooltip: 'wf://market/favorites',
    icon: Star,
    route: { kind: 'market-favorites' }
  },
  'market-cart': {
    id: 'market-cart',
    labelKey: 'cart',
    tooltip: 'wf://market/cart',
    icon: ShoppingCart,
    route: { kind: 'market-cart' }
  },
  'market-recent': {
    id: 'market-recent',
    labelKey: 'recent',
    tooltip: 'wf://market/recent',
    icon: Clock,
    route: { kind: 'market-recent' }
  },
  'codex-home': {
    id: 'codex-home',
    labelKey: 'codex',
    tooltip: 'wf://codex',
    icon: BookOpen,
    route: { kind: 'codex-home' }
  },
  builds: {
    id: 'builds',
    proLabelKey: 'navBuilds',
    tooltip: 'wf://builds',
    icon: Wrench,
    route: { kind: 'builds' }
  },
  foundry: {
    id: 'foundry',
    proLabelKey: 'navFoundry',
    tooltip: 'wf://foundry',
    icon: Hammer,
    route: { kind: 'foundry' }
  },
  'profit-scanner': {
    id: 'profit-scanner',
    proLabelKey: 'navProfitScanner',
    tooltip: 'wf://market/profit-scanner',
    icon: TrendingUp,
    route: { kind: 'profit-scanner' }
  },
  'market-ducats': {
    id: 'market-ducats',
    labelKey: 'ducats',
    tooltip: 'wf://market/ducats',
    icon: Coins,
    route: { kind: 'market-ducats' }
  },
  'market-rivens': {
    id: 'market-rivens',
    labelKey: 'rivens',
    tooltip: 'wf://market/rivens',
    icon: Flame,
    route: { kind: 'market-rivens' }
  },
  'platinum-ledger': {
    id: 'platinum-ledger',
    proLabelKey: 'navLedger',
    tooltip: 'wf://market/ledger',
    icon: Wallet,
    route: { kind: 'platinum-ledger' }
  },
  'wfm-account': {
    id: 'wfm-account',
    labelKey: 'wfmAccount',
    tooltip: 'wf://wfm-account',
    icon: UserCheck,
    route: { kind: 'wfm-account' }
  },
  'browser-history': {
    id: 'browser-history',
    labelKey: 'history',
    tooltip: 'Ctrl+H · wf://history',
    icon: History,
    route: { kind: 'browser-history' }
  }
}

export function resolveBookmarkLabel(
  def: BookmarkDefinition,
  t: UiMessages,
  lang: AppLanguage
): string {
  if (def.proLabelKey) {
    return getProToolsStrings(lang)[def.proLabelKey]
  }
  if (def.labelKey) {
    return t.bookmarks[def.labelKey]
  }
  return def.id
}
