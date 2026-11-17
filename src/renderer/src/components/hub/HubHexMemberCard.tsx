import * as React from 'react'
import { AlertTriangle, Check, Gift, Heart, User } from 'lucide-react'
import {
  HOLLARS_ICON_URL,
  type HexGiftEntry,
  type HexMemberGiftGuide
} from '@shared/data/hex-gifts'
import { SafeAssetImage } from '@/components/ui/safe-asset-image'

interface HubHexMemberCardProps {
  readonly member: HexMemberGiftGuide
  readonly visibleGifts: readonly HexGiftEntry[]
  readonly isFr: boolean
  readonly isGiftedToday: boolean
  readonly onToggleGifted: () => void
}

export function HubHexMemberCard({
  member,
  visibleGifts,
  isFr,
  isGiftedToday,
  onToggleGifted
}: HubHexMemberCardProps): React.JSX.Element {
  const bio = isFr ? member.bioFr : member.bioEn
  const warning = isFr ? member.warningFr : member.warningEn

  return (
    <article
      style={{ borderColor: `${member.accentHex}55` }}
      className="wf-glow-surface wf-glass-panel flex flex-col gap-3 rounded-xl border bg-card/75 p-4 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            style={{ borderColor: member.accentHex }}
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-background/80 shadow-md"
          >
            <SafeAssetImage
              src={member.portraitAssetUrl}
              alt={member.name}
              className="h-full w-full object-cover object-top"
              fallback={
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <User className="h-8 w-8" />
                </div>
              }
            />
            <div className="absolute bottom-1 right-1 h-6 w-6 overflow-hidden rounded border border-border/80 bg-background/90 p-0.5">
              <SafeAssetImage
                src={member.pixelGlyphAssetUrl}
                alt={member.kimHandle}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-base font-bold text-foreground">{member.name}</h3>
              <span
                style={{
                  borderColor: `${member.accentHex}66`,
                  backgroundColor: `${member.accentHex}18`,
                  color: member.accentHex
                }}
                className="rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold"
              >
                @{member.kimHandle}
              </span>
              <span className="rounded border border-border bg-secondary/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {member.protoframe}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{bio}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleGifted}
          className={`wf-interactive-btn inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
            isGiftedToday
              ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
              : 'border-border bg-background/60 text-muted-foreground hover:border-primary/50 hover:text-foreground'
          }`}
        >
          <Check className={`h-3.5 w-3.5 ${isGiftedToday ? 'text-emerald-400' : 'opacity-40'}`} />
          <span>{isFr ? (isGiftedToday ? 'Offert auj.' : 'À offrir') : isGiftedToday ? 'Gifted' : 'To gift'}</span>
        </button>
      </div>

      {warning && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <span>{warning}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {visibleGifts.map((gift) => {
          const primaryName = isFr ? gift.nameFr : gift.nameEn
          const secondaryName = isFr ? gift.nameEn : gift.nameFr
          const chemColor =
            gift.chemistry >= 20
              ? 'border-rose-500/45 bg-rose-500/15 text-rose-300'
              : gift.chemistry >= 10
                ? 'border-pink-500/35 bg-pink-500/10 text-pink-300'
                : 'border-border bg-secondary/60 text-muted-foreground'

          return (
            <div
              key={gift.id}
              className="flex items-center gap-2.5 rounded-lg border border-border/80 bg-background/65 p-2 transition-colors hover:border-primary/40"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/70 bg-card/80 p-1">
                <SafeAssetImage
                  src={gift.imageAssetUrl}
                  alt={primaryName}
                  className="h-full w-full object-contain"
                  fallback={<Gift className="h-5 w-5 text-primary/70" />}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-foreground" title={primaryName}>
                  {primaryName}
                </div>
                <div className="truncate text-[10px] text-muted-foreground" title={secondaryName}>
                  {secondaryName}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] tabular-nums">
                  <span className="inline-flex items-center gap-1 font-mono font-semibold text-amber-300">
                    <SafeAssetImage
                      src={HOLLARS_ICON_URL}
                      alt="Höllars"
                      className="h-3 w-3 object-contain"
                    />
                    <span>{gift.hollars.toLocaleString()}</span>
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {isFr ? `Stock ×${gift.stock}` : `Stock ×${gift.stock}`}
                  </span>
                </div>
              </div>

              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums ${chemColor}`}
              >
                <Heart className="h-3 w-3 fill-current" />
                <span>+{gift.chemistry}</span>
              </span>
            </div>
          )
        })}
      </div>
    </article>
  )
}
