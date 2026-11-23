import * as React from 'react'
import type { SeasonalTheme } from '@shared/schemas/settings.schema'
import { cn } from '@/lib/utils'

function ChristmasGarlandFrame({ compact }: { compact: boolean }): React.JSX.Element {
  const thickness = compact ? 10 : 14
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[55] overflow-hidden select-none">
      {/* Top & Bottom Horizontal Garlands */}
      <svg className="absolute inset-x-0 top-0 w-full" style={{ height: thickness }} preserveAspectRatio="none">
        <defs>
          <pattern id="wf-xmas-h" width="64" height="14" patternUnits="userSpaceOnUse">
            <path d="M0 4 Q16 11 32 4 T64 4" fill="none" stroke="#15803d" strokeWidth="4.2" strokeLinecap="round" />
            <path d="M0 4 Q16 11 32 4 T64 4" fill="none" stroke="#22c55e" strokeWidth="1.6" strokeDasharray="3 4" />
            <path d="M0 5 Q16 12 32 5 T64 5" fill="none" stroke="#eab308" strokeWidth="0.9" opacity="0.85" />
            <circle cx="8" cy="6.5" r="2.5" fill="#ef4444" className="wf-seasonal-bulb-a" />
            <circle cx="24" cy="8.5" r="2.5" fill="#facc15" className="wf-seasonal-bulb-b" />
            <circle cx="40" cy="6.5" r="2.5" fill="#38bdf8" className="wf-seasonal-bulb-a" />
            <circle cx="56" cy="4.8" r="2.5" fill="#4ade80" className="wf-seasonal-bulb-b" />
          </pattern>
        </defs>
        <rect width="100%" height="14" fill="url(#wf-xmas-h)" />
      </svg>

      <svg className="absolute inset-x-0 bottom-0 w-full rotate-180" style={{ height: thickness }} preserveAspectRatio="none">
        <rect width="100%" height="14" fill="url(#wf-xmas-h)" />
      </svg>

      {/* Left & Right Vertical Garlands */}
      <svg className="absolute inset-y-0 left-0 h-full" style={{ width: thickness }} preserveAspectRatio="none">
        <defs>
          <pattern id="wf-xmas-v" width="14" height="64" patternUnits="userSpaceOnUse">
            <path d="M4 0 Q11 16 4 32 T4 64" fill="none" stroke="#15803d" strokeWidth="4.2" strokeLinecap="round" />
            <path d="M4 0 Q11 16 4 32 T4 64" fill="none" stroke="#22c55e" strokeWidth="1.6" strokeDasharray="3 4" />
            <path d="M5 0 Q12 16 5 32 T5 64" fill="none" stroke="#eab308" strokeWidth="0.9" opacity="0.85" />
            <circle cx="6.5" cy="8" r="2.5" fill="#facc15" className="wf-seasonal-bulb-b" />
            <circle cx="8.5" cy="24" r="2.5" fill="#ef4444" className="wf-seasonal-bulb-a" />
            <circle cx="6.5" cy="40" r="2.5" fill="#4ade80" className="wf-seasonal-bulb-b" />
            <circle cx="4.8" cy="56" r="2.5" fill="#38bdf8" className="wf-seasonal-bulb-a" />
          </pattern>
        </defs>
        <rect width="14" height="100%" fill="url(#wf-xmas-v)" />
      </svg>

      <svg className="absolute inset-y-0 right-0 h-full rotate-180" style={{ width: thickness }} preserveAspectRatio="none">
        <rect width="14" height="100%" fill="url(#wf-xmas-v)" />
      </svg>

      {/* 4 Festive Holly & Ribbon Corner Rosettes */}
      {(['top-0 left-0', 'top-0 right-0 -scale-x-100', 'bottom-0 left-0 -scale-y-100', 'bottom-0 right-0 scale-[-1]'] as const).map(
        (pos, idx) => (
          <svg
            key={idx}
            viewBox="0 0 36 36"
            className={cn('absolute', pos, compact ? 'h-6 w-6' : 'h-8 w-8')}
          >
            <path d="M4 18 C4 9 9 4 18 4 C14 11 11 14 4 18 Z" fill="#16a34a" stroke="#14532d" strokeWidth="1" />
            <path d="M6 26 C5 17 10 11 20 10 C16 17 13 21 6 26 Z" fill="#15803d" />
            <path d="M26 6 C17 5 11 10 10 20 C17 16 21 13 26 6 Z" fill="#22c55e" />
            <circle cx="10" cy="10" r="3" fill="#ef4444" />
            <circle cx="15" cy="8" r="2.4" fill="#dc2626" />
            <circle cx="8" cy="15" r="2.4" fill="#facc15" />
          </svg>
        )
      )}
    </div>
  )
}

function CobwebCorner({
  className,
  withSpider,
  spiderClass,
  compact
}: {
  className: string
  withSpider?: boolean
  spiderClass?: string
  compact: boolean
}): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={cn('absolute', compact ? 'h-20 w-20' : 'h-28 w-28', className)}
    >
      {/* Radial silk threads */}
      <g stroke="#c084fc" strokeOpacity="0.45" strokeWidth="1.1">
        <line x1="0" y1="0" x2="112" y2="8" />
        <line x1="0" y1="0" x2="98" y2="42" />
        <line x1="0" y1="0" x2="76" y2="76" />
        <line x1="0" y1="0" x2="42" y2="98" />
        <line x1="0" y1="0" x2="8" y2="112" />
        {/* Concentric scalloped web arcs */}
        <path d="M28 2 Q22 14 25 25 Q14 22 2 28" />
        <path d="M54 4 Q43 24 46 46 Q24 43 4 54" />
        <path d="M82 6 Q65 34 65 65 Q34 65 6 82" />
        <path d="M106 8 Q84 44 76 76 Q44 84 8 106" />
      </g>

      {withSpider && (
        <g className={spiderClass}>
          <line x1="56" y1="18" x2="56" y2="66" stroke="#e9d5ff" strokeOpacity="0.55" strokeWidth="1" />
          <g transform="translate(56, 70)">
            {/* 8 spider legs */}
            <path
              d="M-3 -2 L-10 -7 M-4 0 L-12 0 M-4 2 L-11 6 M-3 4 L-8 10 M3 -2 L10 -7 M4 0 L12 0 M4 2 L11 6 M3 4 L8 10"
              stroke="#a855f7"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <ellipse cx="0" cy="-3" rx="3.2" ry="2.8" fill="#1e1b2e" stroke="#c084fc" strokeWidth="0.9" />
            <ellipse cx="0" cy="3.2" rx="4.6" ry="4.2" fill="#1e1b2e" stroke="#a855f7" strokeWidth="1" />
            <circle cx="-1.3" cy="-4.2" r="0.9" fill="#f0abfc" />
            <circle cx="1.3" cy="-4.2" r="0.9" fill="#f0abfc" />
          </g>
        </g>
      )}
    </svg>
  )
}

function HalloweenCobwebFrame({ compact }: { compact: boolean }): React.JSX.Element {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[55] overflow-hidden select-none">
      <CobwebCorner className="left-0 top-0" withSpider spiderClass="wf-seasonal-spider-a" compact={compact} />
      <CobwebCorner className="right-0 top-0 -scale-x-100" withSpider spiderClass="wf-seasonal-spider-b" compact={compact} />
      <CobwebCorner className="bottom-0 left-0 -scale-y-100" compact={compact} />
      <CobwebCorner className="bottom-0 right-0 scale-[-1]" withSpider spiderClass="wf-seasonal-spider-a" compact={compact} />
    </div>
  )
}

function EasterEggCornersFrame({ compact }: { compact: boolean }): React.JSX.Element {
  const sizeClass = compact ? 'h-14 w-14' : 'h-20 w-20'
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[55] overflow-hidden select-none">
      {/* Subtle top spring blossoms */}
      {(['left-1.5 top-1.5', 'right-1.5 top-1.5 -scale-x-100'] as const).map((pos, idx) => (
        <svg key={idx} viewBox="0 0 48 48" className={cn('absolute', compact ? 'h-7 w-7' : 'h-9 w-9', pos)}>
          <path d="M4 28 Q14 12 34 6" fill="none" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
          <circle cx="18" cy="14" r="4" fill="#f9a8d4" opacity="0.85" />
          <circle cx="18" cy="14" r="1.5" fill="#fde047" />
          <circle cx="30" cy="8" r="3" fill="#c4b5fd" opacity="0.85" />
        </svg>
      ))}

      {/* Bottom-Left Decorated Pastel/Gold Easter Egg */}
      <svg
        viewBox="0 0 92 92"
        className={cn('absolute bottom-0 left-1', sizeClass)}
      >
        <defs>
          <clipPath id="wf-egg-left">
            <path d="M36 18 C22 18 14 40 14 57 C14 73 24 82 36 82 C48 82 58 73 58 57 C58 40 50 18 36 18 Z" />
          </clipPath>
        </defs>
        <g className="wf-seasonal-egg">
          <g clipPath="url(#wf-egg-left)">
            <rect x="10" y="15" width="52" height="70" fill="#c084fc" />
            <rect x="10" y="34" width="52" height="12" fill="#fde047" />
            <path d="M12 56 L20 49 L28 56 L36 49 L44 56 L52 49 L60 56" fill="none" stroke="#f9a8d4" strokeWidth="4" />
            <circle cx="26" cy="27" r="2.3" fill="#fef08a" />
            <circle cx="36" cy="25" r="2.5" fill="#a7f3d0" />
            <circle cx="46" cy="27" r="2.3" fill="#fef08a" />
            <rect x="10" y="66" width="52" height="18" fill="#6ee7b7" />
          </g>
          <path
            d="M36 18 C22 18 14 40 14 57 C14 73 24 82 36 82 C48 82 58 73 58 57 C58 40 50 18 36 18 Z"
            fill="none"
            stroke="#fde047"
            strokeWidth="1.8"
          />
        </g>
        {/* Grass blades & spring flower */}
        <path
          d="M6 88 Q12 70 8 60 M16 88 Q20 72 24 64 M34 88 Q36 74 39 67 M50 88 Q54 73 62 66 M64 88 Q68 77 74 72"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="62" cy="76" r="5" fill="#f472b6" />
        <circle cx="62" cy="76" r="2" fill="#fef08a" />
      </svg>

      {/* Bottom-Right Decorated Rose/Mint Easter Egg */}
      <svg
        viewBox="0 0 92 92"
        className={cn('absolute bottom-0 right-1', sizeClass)}
      >
        <defs>
          <clipPath id="wf-egg-right">
            <path d="M56 18 C42 18 34 40 34 57 C34 73 44 82 56 82 C68 82 78 73 78 57 C78 40 70 18 56 18 Z" />
          </clipPath>
        </defs>
        <g className="wf-seasonal-egg">
          <g clipPath="url(#wf-egg-right)">
            <rect x="30" y="15" width="52" height="70" fill="#f472b6" />
            <rect x="30" y="33" width="52" height="13" fill="#6ee7b7" />
            <path d="M32 56 L40 49 L48 56 L56 49 L64 56 L72 49 L80 56" fill="none" stroke="#fde047" strokeWidth="4" />
            <circle cx="46" cy="26" r="2.3" fill="#fff1f2" />
            <circle cx="56" cy="24" r="2.5" fill="#fde047" />
            <circle cx="66" cy="26" r="2.3" fill="#fff1f2" />
            <rect x="30" y="66" width="52" height="18" fill="#93c5fd" />
          </g>
          <path
            d="M56 18 C42 18 34 40 34 57 C34 73 44 82 56 82 C68 82 78 73 78 57 C78 40 70 18 56 18 Z"
            fill="none"
            stroke="#fde047"
            strokeWidth="1.8"
          />
        </g>
        <path
          d="M22 88 Q26 76 18 70 M34 88 Q38 72 32 64 M52 88 Q54 74 50 67 M70 88 Q68 72 74 63 M84 88 Q80 72 86 60"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="28" cy="76" r="5" fill="#c084fc" />
        <circle cx="28" cy="76" r="2" fill="#fef08a" />
      </svg>
    </div>
  )
}

export function SeasonalDecorFrames({
  theme,
  compact
}: {
  theme: SeasonalTheme
  compact: boolean
}): React.JSX.Element | null {
  if (theme === 'christmas') return <ChristmasGarlandFrame compact={compact} />
  if (theme === 'halloween') return <HalloweenCobwebFrame compact={compact} />
  if (theme === 'easter') return <EasterEggCornersFrame compact={compact} />
  return null
}
