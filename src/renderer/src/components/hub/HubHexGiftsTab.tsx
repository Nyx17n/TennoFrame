import * as React from 'react'
import { Clock, Gift, RotateCcw, Search } from 'lucide-react'
import {
  HEX_GIFT_GUIDES,
  type HexMemberId
} from '@shared/data/hex-gifts'
import { HubHexMemberCard } from '@/components/hub/HubHexMemberCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'
import { useUiTranslations } from '@/lib/i18n'

const DAILY_GIFT_STORAGE_KEY = 'tennoframe:hex-daily-gifted:v1'

function getUtcDayKey(nowMs: number): string {
  return new Date(nowMs).toISOString().slice(0, 10)
}

function formatRemainingToUtcMidnight(nowMs: number): string {
  const now = new Date(nowMs)
  const nextUtcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0
  )
  const diffSec = Math.max(0, Math.floor((nextUtcMidnight - nowMs) / 1000))
  const h = Math.floor(diffSec / 3600)
  const m = Math.floor((diffSec % 3600) / 60)
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
}

function loadGiftedSetForDay(utcDay: string): Set<HexMemberId> {
  try {
    const raw = localStorage.getItem(DAILY_GIFT_STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as { day?: string; ids?: string[] }
    if (parsed.day !== utcDay || !Array.isArray(parsed.ids)) return new Set()
    return new Set(parsed.ids as HexMemberId[])
  } catch {
    return new Set()
  }
}

function saveGiftedSetForDay(utcDay: string, set: ReadonlySet<HexMemberId>): void {
  try {
    localStorage.setItem(
      DAILY_GIFT_STORAGE_KEY,
      JSON.stringify({ day: utcDay, ids: Array.from(set) })
    )
  } catch {
    // Ignore storage quota errors
  }
}

export function HubHexGiftsTab({ nowMs }: { nowMs: number }): React.JSX.Element {
  const { lang } = useUiTranslations()
  const isFr = lang === 'fr'

  const utcDay = getUtcDayKey(nowMs)
  const [selectedMember, setSelectedMember] = React.useState<HexMemberId | 'all'>('all')
  const [query, setQuery] = React.useState('')
  const [giftedIds, setGiftedIds] = React.useState<Set<HexMemberId>>(() =>
    loadGiftedSetForDay(utcDay)
  )

  React.useEffect(() => {
    setGiftedIds(loadGiftedSetForDay(utcDay))
  }, [utcDay])

  const toggleGifted = (id: HexMemberId): void => {
    setGiftedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveGiftedSetForDay(utcDay, next)
      return next
    })
  }

  const resetDailyChecks = (): void => {
    const empty = new Set<HexMemberId>()
    saveGiftedSetForDay(utcDay, empty)
    setGiftedIds(empty)
  }

  const normalizedQuery = query.trim().toLowerCase()

  const filteredCards = React.useMemo(() => {
    return HEX_GIFT_GUIDES.filter((m) => selectedMember === 'all' || m.id === selectedMember)
      .map((member) => {
        if (!normalizedQuery) {
          return { member, visibleGifts: member.gifts }
        }
        const memberMatches =
          member.name.toLowerCase().includes(normalizedQuery) ||
          member.kimHandle.toLowerCase().includes(normalizedQuery) ||
          member.protoframe.toLowerCase().includes(normalizedQuery)

        const matchingGifts = member.gifts.filter(
          (g) =>
            g.nameFr.toLowerCase().includes(normalizedQuery) ||
            g.nameEn.toLowerCase().includes(normalizedQuery)
        )

        return {
          member,
          visibleGifts: memberMatches ? member.gifts : matchingGifts
        }
      })
      .filter((entry) => entry.visibleGifts.length > 0)
  }, [selectedMember, normalizedQuery])

  return (
    <div className="space-y-4">
      <div className="wf-glass-panel flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/70 p-3.5">
        <div className="space-y-0.5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Gift className="h-4 w-4 text-primary" />
            <span>
              {isFr
                ? 'Guide des Cadeaux — Syndicat L’Hexagone (Warframe: 1999 · DIRECTGIFTZ)'
                : 'The Hex Gifting Guide — Warframe: 1999 (KIM DIRECTGIFTZ)'}
            </span>
          </h2>
          <p className="text-xs text-muted-foreground">
            {isFr
              ? '1 cadeau max par membre et par jour via la boutique DIRECTGIFTZ du terminal POM-2 (cœur rouge = gain de Chimie).'
              : 'Send up to 1 gift per Hex member each day from the POM-2 DIRECTGIFTZ store to boost Chemistry.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-primary">
            <Clock className="h-3.5 w-3.5" />
            <span>Reset UTC: {formatRemainingToUtcMidnight(nowMs)}</span>
          </span>
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-emerald-300">
            {giftedIds.size} / {HEX_GIFT_GUIDES.length} {isFr ? 'offerts' : 'gifted'}
          </span>
          {giftedIds.size > 0 && (
            <Button size="sm" variant="ghost" onClick={resetDailyChecks}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isFr
                ? 'Rechercher un cadeau ou un personnage (FR/EN : Grille-pain, Toaster, GPU, Café, Aoi...)'
                : 'Search a gift or Hex member (Toaster, Coffee, GPU, Headphones, Aoi...)'
            }
            className="h-8 pl-8 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedMember('all')}
            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
              selectedMember === 'all'
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            {isFr ? 'Tous (6)' : 'All (6)'}
          </button>
          {HEX_GIFT_GUIDES.map((m) => {
            const active = selectedMember === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMember(m.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <SafeAssetImage
                  src={m.pixelGlyphAssetUrl}
                  alt={m.name}
                  className="h-4 w-4 rounded-sm object-contain"
                />
                <span>{m.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {filteredCards.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/50 p-8 text-center">
          <Gift className="h-7 w-7 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {isFr
              ? 'Aucun cadeau ni membre ne correspond à cette recherche.'
              : 'No gift or Hex member matches your search.'}
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setQuery('')
              setSelectedMember('all')
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{isFr ? 'Réinitialiser' : 'Reset filters'}</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredCards.map(({ member, visibleGifts }) => (
            <HubHexMemberCard
              key={member.id}
              member={member}
              visibleGifts={visibleGifts}
              isFr={isFr}
              isGiftedToday={giftedIds.has(member.id)}
              onToggleGifted={() => toggleGifted(member.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
