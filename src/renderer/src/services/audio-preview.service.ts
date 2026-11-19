import type { SoundChoice } from '@shared/schemas/settings.schema'
import {
  SYNTH_SOUND_PRESETS,
  type SynthToneSpec,
  type SynthesizedSoundChoice
} from '@/lib/sound-catalog'

const SAMPLE_SOUND_PATHS: Partial<Record<SoundChoice, string>> = {
  classic: './sounds/notification.mp3',
  bell: './sounds/notification-bell.wav'
}

let activeAudio: HTMLAudioElement | null = null
let sharedAudioCtx: AudioContext | null = null
let activeVoiceGain: GainNode | null = null
let activeSources: AudioScheduledSourceNode[] = []

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') {
    return null
  }
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new window.AudioContext()
  }
  return sharedAudioCtx
}

export function stopAlertSoundPreview(): void {
  if (activeAudio) {
    activeAudio.pause()
    activeAudio.currentTime = 0
    activeAudio = null
  }
  if (sharedAudioCtx && activeVoiceGain) {
    const now = sharedAudioCtx.currentTime
    try {
      activeVoiceGain.gain.cancelScheduledValues(now)
      activeVoiceGain.gain.setValueAtTime(Math.max(0.0001, activeVoiceGain.gain.value), now)
      activeVoiceGain.gain.linearRampToValueAtTime(0.0001, now + 0.015)
      for (const src of activeSources) {
        try {
          src.stop(now + 0.02)
        } catch {
          // Déjà arrêté
        }
      }
    } catch {
      // Contexte fermé
    }
    activeVoiceGain = null
    activeSources = []
  }
}

function scheduleTone(
  ctx: AudioContext,
  dest: AudioNode,
  baseTime: number,
  spec: SynthToneSpec
): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = spec.type
  const t0 = baseTime + spec.startSec
  const tAttack = t0 + spec.attackSec
  const tHold = tAttack + spec.holdSec
  const tEnd = tHold + spec.releaseSec

  osc.frequency.setValueAtTime(spec.freq, t0)
  if (spec.endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, spec.endFreq), tEnd)
  }
  if (spec.detuneCents !== undefined) {
    osc.detune.setValueAtTime(spec.detuneCents, t0)
  }

  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.linearRampToValueAtTime(spec.peakGain, tAttack)
  gain.gain.setValueAtTime(spec.peakGain, tHold)
  gain.gain.exponentialRampToValueAtTime(0.0001, tEnd)

  osc.connect(gain)
  gain.connect(dest)
  osc.start(t0)
  osc.stop(tEnd + 0.01)
  activeSources.push(osc)
}

export async function playAlertSoundPreview(
  choice: SoundChoice,
  volumePercent: number
): Promise<void> {
  stopAlertSoundPreview()
  const clampedVol = Math.max(0, Math.min(1, volumePercent / 100))
  if (clampedVol <= 0) return

  const samplePath = SAMPLE_SOUND_PATHS[choice]
  if (samplePath) {
    try {
      const audio = new Audio(samplePath)
      audio.volume = clampedVol
      activeAudio = audio
      await audio.play()
    } catch {
      // Repli silencieux si périphérique audio indisponible
    }
    return
  }

  try {
    const ctx = getAudioContext()
    if (!ctx) return
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
    const master = ctx.createGain()
    master.gain.setValueAtTime(clampedVol, ctx.currentTime)
    master.connect(ctx.destination)
    activeVoiceGain = master

    const preset = SYNTH_SOUND_PRESETS[choice as SynthesizedSoundChoice]
    let voiceDest: AudioNode = master
    if (preset.filterHz !== undefined) {
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(preset.filterHz, ctx.currentTime)
      filter.Q.setValueAtTime(1.2, ctx.currentTime)
      filter.connect(master)
      voiceDest = filter
    }

    const baseTime = ctx.currentTime + 0.005
    for (const tone of preset.tones) {
      scheduleTone(ctx, voiceDest, baseTime, tone)
    }
  } catch {
    // Repli silencieux si aucun périphérique audio Windows n'est disponible
  }
}
