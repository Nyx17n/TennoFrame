import * as React from 'react'

export interface WfIconProps {
  readonly className?: string
}

/** 1. Orbiteur — Étoile de Navigation / Carte Céleste (Général & Navigation) */
export function WfNavigationStarIcon({ className = 'h-4 w-4' }: WfIconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2" opacity="0.55" />
      <path
        d="M12 2.5L14.3 9.7L21.5 12L14.3 14.3L12 21.5L9.7 14.3L2.5 12L9.7 9.7L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  )
}

/** 2. Emblème stylisé du Lotus & Prisme Orokin (Apparence) */
export function WfLotusEmblemIcon({ className = 'h-4 w-4' }: WfIconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3C9.6 6.4 8.6 9.8 12 14.6C15.4 9.8 14.4 6.4 12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 14.6C8.2 13.8 5.2 11.4 3.5 7.5C3.4 12.6 6.2 16.5 12 18.5C17.8 16.5 20.6 12.6 20.5 7.5C18.8 11.4 15.8 13.8 12 14.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8.5 20.5H15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** 3. Réticule tactique Céphalon / HUD en jeu (En Jeu & Overlay) */
export function WfCephalonReticleIcon({ className = 'h-4 w-4' }: WfIconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <polygon
        points="12,2.5 20.2,7.2 20.2,16.8 12,21.5 3.8,16.8 3.8,7.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 6.5V9M12 15V17.5M6.5 12H9M15 12H17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <polygon points="12,10 14,12 12,14 10,12" fill="currentColor" />
    </svg>
  )
}

/** 4. Sceau octogonal du Platine Warframe (Marché & Alertes) */
export function WfPlatinumCrestIcon({ className = 'h-4 w-4' }: WfIconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <polygon
        points="8.2,3 15.8,3 21,8.2 21,15.8 15.8,21 8.2,21 3,15.8 3,8.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <polygon
        points="12,6.8 17.2,12 12,17.2 6.8,12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  )
}

/** 5. Cube fracturé Céphalon Ordis / Noyau Données (Système) */
export function WfOrdisCubeIcon({ className = 'h-4 w-4' }: WfIconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.8L20 7.4V16.6L12 21.2L4 16.6V7.4L12 2.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 2.8V12M20 7.4L12 12M4 7.4L12 12M15.5 14L19.5 16.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** Sous-onglet : Polarité Madurai (V offensif Warframe) */
export function WfMaduraiGlyphIcon({ className = 'h-3.5 w-3.5' }: WfIconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4.5 5.5L12 19L19.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 5.5L12 12L15.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Sous-onglet : Polarité Vazarin (D défensif Warframe) */
export function WfVazarinGlyphIcon({ className = 'h-3.5 w-3.5' }: WfIconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3.5L19.5 7.5C19.5 14 16.2 18.2 12 20.5C7.8 18.2 4.5 14 4.5 7.5L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M12 7.5V15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** Sous-onglet : Polarité Naramon (Trait tactique Warframe) */
export function WfNaramonGlyphIcon({ className = 'h-3.5 w-3.5' }: WfIconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M3.5 9.5H20.5M6.5 14.5H17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <polygon points="12,4 14,6.5 10,6.5" fill="currentColor" />
    </svg>
  )
}

/** Sous-onglet : Polarité Zenurik (Double onde énergétique Warframe) */
export function WfZenurikGlyphIcon({ className = 'h-3.5 w-3.5' }: WfIconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 8.5L9.5 6.5H14.5L19 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 15.5L9.5 17.5H14.5L19 15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  )
}

/** Sous-onglet : Cristal d'Aya / Verre du Néant Orokin */
export function WfAyaCrystalIcon({ className = 'h-3.5 w-3.5' }: WfIconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 2.5L18.5 10.5L12 21.5L5.5 10.5L12 2.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M5.5 10.5H18.5M12 2.5V21.5" stroke="currentColor" strokeWidth="1.3" opacity="0.7" />
    </svg>
  )
}

/** Sous-onglet : Glyphe Tennobet / Plume Orokin (Polices & Animations) */
export function WfTennobetIcon({ className = 'h-3.5 w-3.5' }: WfIconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 18.5C8.5 16 13.5 11 19.5 4.5C18.5 11.5 14.5 16.5 8.5 19.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M4 12.5H11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** Sous-onglet : Relais Tenno & Murmure /w */
export function WfRelaySignalIcon({ className = 'h-3.5 w-3.5' }: WfIconProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6.5 6.5C3.5 9.5 3.5 14.5 6.5 17.5M17.5 6.5C20.5 9.5 20.5 14.5 17.5 17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 3V5.5M12 18.5V21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
