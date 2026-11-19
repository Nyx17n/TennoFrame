import * as React from 'react'
import {
  Bell,
  BookOpen,
  Clock,
  Coins,
  Compass,
  Flame,
  Globe,
  Hammer,
  History,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  User,
  UserCheck,
  Wallet,
  Wrench
} from 'lucide-react'
import type { RouteKind } from '@shared/schemas/navigation.schema'

export function RouteIcon({
  kind,
  className = 'h-3.5 w-3.5 shrink-0'
}: {
  kind: RouteKind
  className?: string
}): React.JSX.Element {
  switch (kind) {
    case 'speed-dial':
      return <LayoutDashboard className={className} />
    case 'hub':
      return <Globe className={className} />
    case 'market-home':
      return <Store className={className} />
    case 'market-catalog':
      return <Compass className={className} />
    case 'market-item':
      return <Package className={className} />
    case 'market-cart':
      return <ShoppingCart className={className} />
    case 'market-favorites':
      return <Star className={className} />
    case 'market-ducats':
      return <Coins className={className} />
    case 'market-rivens':
      return <Flame className={className} />
    case 'market-recent':
      return <Clock className={className} />
    case 'market-user':
      return <User className={className} />
    case 'wfm-account':
      return <UserCheck className={className} />
    case 'alerts':
      return <Bell className={className} />
    case 'codex-home':
      return <BookOpen className={className} />
    case 'codex-detail':
      return <Sparkles className={className} />
    case 'profit-scanner':
      return <TrendingUp className={className} />
    case 'platinum-ledger':
      return <Wallet className={className} />
    case 'builds':
      return <Wrench className={className} />
    case 'foundry':
      return <Hammer className={className} />
    case 'browser-history':
      return <History className={className} />
  }
}

