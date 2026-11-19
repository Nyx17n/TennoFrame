import type { SoundChoice } from '@shared/schemas/settings.schema'

export interface SoundCatalogItem {
  readonly id: SoundChoice
  readonly labelFr: string
  readonly labelEn: string
  readonly descFr: string
  readonly descEn: string
  readonly durationMs: number
}

export interface SynthToneSpec {
  readonly freq: number
  readonly endFreq?: number
  readonly type: OscillatorType
  readonly startSec: number
  readonly attackSec: number
  readonly holdSec: number
  readonly releaseSec: number
  readonly peakGain: number
  readonly detuneCents?: number
}

export interface SynthPresetSpec {
  readonly filterHz?: number
  readonly tones: readonly SynthToneSpec[]
}

export type SynthesizedSoundChoice = Exclude<SoundChoice, 'classic' | 'bell'>

export const SOUND_CHOICES_CATALOG: readonly SoundCatalogItem[] = [
  { id: 'classic', labelFr: 'Classique Tenno', labelEn: 'Tenno Classic', descFr: 'Alerte standard équilibrée', descEn: 'Balanced standard alert', durationMs: 750 },
  { id: 'bell', labelFr: 'Cloche Cristalline', labelEn: 'Crystal Bell', descFr: 'Tintement clair et limpide', descEn: 'Bright crystal bell chime', durationMs: 850 },
  { id: 'orokin-chime', labelFr: "Carillon d'Or Orokin", labelEn: 'Orokin Golden Chime', descFr: 'Arpège harmonique des caches du Néant', descEn: 'Luminous Void cache harmonic arpeggio', durationMs: 1050 },
  { id: 'cephalon-ping', labelFr: 'Impulsion Céphalon', labelEn: 'Cephalon Telemetry Ping', descFr: 'Double impulsion nette façon Ordis', descEn: 'Crisp Ordis-style dual telemetry pulse', durationMs: 520 },
  { id: 'lotus-transmission', labelFr: 'Transmission du Lotus', labelEn: 'Lotus Transmission', descFr: 'Accord chaud montant en quarte', descEn: 'Warm rising fourth harmonic pad', durationMs: 1150 },
  { id: 'pom2-retro', labelFr: 'Terminal POM-2 (1999)', labelEn: 'POM-2 Terminal (1999)', descFr: 'Synthé rétro 16-bit messagerie KIM', descEn: '16-bit retro KIM messenger synth', durationMs: 680 },
  { id: 'platinum-coin', labelFr: 'Éclat de Platine', labelEn: 'Platinum Shimmer', descFr: 'Tintement métallique d’échange conclu', descEn: 'Metallic trade-completed chime', durationMs: 750 },
  { id: 'eidolon-pulse', labelFr: 'Résonance Eidolon', labelEn: 'Eidolon Resonance', descFr: 'Onde grave nocturne des Plaines', descEn: 'Deep nocturnal Plains harmonic wave', durationMs: 1250 },
  { id: 'stalker-whisper', labelFr: 'Alerte Acolyte / Stalker', labelEn: 'Acolyte / Stalker Alert', descFr: 'Pulsation tendue Route de l’Acier', descEn: 'Urgent Steel Path dark pulse', durationMs: 920 },
  { id: 'soft-drop', labelFr: 'Goutte Zen Discrète', labelEn: 'Zen Soft Droplet', descFr: 'Sonar feutré pour sessions nocturnes', descEn: 'Gentle sonar drop for late-night play', durationMs: 550 }
] as const

export const SYNTH_SOUND_PRESETS: Record<SynthesizedSoundChoice, SynthPresetSpec> = {
  'orokin-chime': {
    tones: [
      { freq: 739.99, type: 'sine', startSec: 0, attackSec: 0.008, holdSec: 0.04, releaseSec: 0.45, peakGain: 0.42 },
      { freq: 932.33, type: 'sine', startSec: 0.085, attackSec: 0.008, holdSec: 0.04, releaseSec: 0.48, peakGain: 0.42 },
      { freq: 1108.73, type: 'sine', startSec: 0.17, attackSec: 0.008, holdSec: 0.05, releaseSec: 0.52, peakGain: 0.45 },
      { freq: 1661.22, type: 'sine', startSec: 0.26, attackSec: 0.01, holdSec: 0.08, releaseSec: 0.65, peakGain: 0.48 },
      { freq: 3322.44, type: 'triangle', startSec: 0.26, attackSec: 0.01, holdSec: 0.03, releaseSec: 0.45, peakGain: 0.14 }
    ]
  },
  'cephalon-ping': {
    filterHz: 4200,
    tones: [
      { freq: 783.99, type: 'triangle', startSec: 0, attackSec: 0.004, holdSec: 0.025, releaseSec: 0.08, peakGain: 0.36 },
      { freq: 1046.5, type: 'triangle', startSec: 0.065, attackSec: 0.004, holdSec: 0.035, releaseSec: 0.11, peakGain: 0.44 },
      { freq: 1567.98, type: 'sine', startSec: 0.145, attackSec: 0.005, holdSec: 0.06, releaseSec: 0.28, peakGain: 0.52 },
      { freq: 2093.0, type: 'sine', startSec: 0.145, attackSec: 0.005, holdSec: 0.03, releaseSec: 0.2, peakGain: 0.16 }
    ]
  },
  'lotus-transmission': {
    filterHz: 2200,
    tones: [
      { freq: 587.33, type: 'triangle', startSec: 0, attackSec: 0.04, holdSec: 0.14, releaseSec: 0.55, peakGain: 0.32, detuneCents: -6 },
      { freq: 783.99, type: 'sine', startSec: 0.16, attackSec: 0.045, holdSec: 0.16, releaseSec: 0.6, peakGain: 0.36, detuneCents: 6 },
      { freq: 880.0, type: 'sine', startSec: 0.34, attackSec: 0.05, holdSec: 0.18, releaseSec: 0.58, peakGain: 0.42 },
      { freq: 440.0, type: 'triangle', startSec: 0.34, attackSec: 0.06, holdSec: 0.15, releaseSec: 0.55, peakGain: 0.2 }
    ]
  },
  'pom2-retro': {
    filterHz: 2500,
    tones: [
      { freq: 659.25, type: 'square', startSec: 0, attackSec: 0.005, holdSec: 0.055, releaseSec: 0.06, peakGain: 0.24 },
      { freq: 830.61, type: 'square', startSec: 0.09, attackSec: 0.005, holdSec: 0.055, releaseSec: 0.06, peakGain: 0.24 },
      { freq: 987.77, type: 'square', startSec: 0.18, attackSec: 0.005, holdSec: 0.055, releaseSec: 0.07, peakGain: 0.26 },
      { freq: 1318.51, type: 'square', startSec: 0.28, attackSec: 0.005, holdSec: 0.09, releaseSec: 0.26, peakGain: 0.28 },
      { freq: 659.25, type: 'triangle', startSec: 0.28, attackSec: 0.008, holdSec: 0.08, releaseSec: 0.24, peakGain: 0.22 }
    ]
  },
  'platinum-coin': {
    tones: [
      { freq: 987.77, type: 'sine', startSec: 0, attackSec: 0.004, holdSec: 0.03, releaseSec: 0.28, peakGain: 0.44 },
      { freq: 2726.2, type: 'sine', startSec: 0, attackSec: 0.003, holdSec: 0.015, releaseSec: 0.12, peakGain: 0.16 },
      { freq: 1318.51, type: 'sine', startSec: 0.08, attackSec: 0.004, holdSec: 0.05, releaseSec: 0.56, peakGain: 0.5 },
      { freq: 2637.02, type: 'triangle', startSec: 0.08, attackSec: 0.004, holdSec: 0.025, releaseSec: 0.36, peakGain: 0.18 }
    ]
  },
  'eidolon-pulse': {
    filterHz: 1450,
    tones: [
      { freq: 146.83, type: 'sawtooth', startSec: 0, attackSec: 0.09, holdSec: 0.22, releaseSec: 0.82, peakGain: 0.3 },
      { freq: 220.0, type: 'triangle', startSec: 0.04, attackSec: 0.1, holdSec: 0.24, releaseSec: 0.8, peakGain: 0.34 },
      { freq: 369.99, type: 'sine', startSec: 0.12, attackSec: 0.12, holdSec: 0.22, releaseSec: 0.72, peakGain: 0.36 },
      { freq: 880.0, endFreq: 854.0, type: 'sine', startSec: 0.2, attackSec: 0.08, holdSec: 0.16, releaseSec: 0.65, peakGain: 0.22 }
    ]
  },
  'stalker-whisper': {
    filterHz: 1650,
    tones: [
      { freq: 130.81, type: 'sawtooth', startSec: 0, attackSec: 0.02, holdSec: 0.16, releaseSec: 0.62, peakGain: 0.32 },
      { freq: 277.18, endFreq: 261.63, type: 'triangle', startSec: 0, attackSec: 0.015, holdSec: 0.18, releaseSec: 0.55, peakGain: 0.38 },
      { freq: 783.99, endFreq: 830.61, type: 'sine', startSec: 0.18, attackSec: 0.006, holdSec: 0.08, releaseSec: 0.48, peakGain: 0.36 }
    ]
  },
  'soft-drop': {
    tones: [
      { freq: 392.0, endFreq: 587.33, type: 'sine', startSec: 0, attackSec: 0.008, holdSec: 0.035, releaseSec: 0.22, peakGain: 0.42 },
      { freq: 493.88, type: 'sine', startSec: 0.14, attackSec: 0.012, holdSec: 0.03, releaseSec: 0.3, peakGain: 0.24 }
    ]
  }
}
