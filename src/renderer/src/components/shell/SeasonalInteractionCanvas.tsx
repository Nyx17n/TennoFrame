import * as React from 'react'
import type { SeasonalTheme } from '@shared/schemas/settings.schema'

type ParticleShape = 'gift' | 'confetti' | 'violet-orb' | 'violet-shard' | 'egg' | 'petal' | 'sparkle'

interface SeasonalParticle {
  x: number
  y: number
  vx: number
  vy: number
  gravity: number
  rot: number
  vRot: number
  size: number
  life: number
  maxLife: number
  color: string
  accent: string
  shape: ParticleShape
}

const MAX_PARTICLES = 64
const XMAS_COLORS = ['#ef4444', '#22c55e', '#38bdf8', '#f43f5e', '#a855f7'] as const
const HALLOWEEN_COLORS = ['#a855f7', '#c084fc', '#d946ef', '#7e22ce', '#e879f9'] as const
const EASTER_COLORS = ['#f9a8d4', '#a7f3d0', '#fde68a', '#c4b5fd', '#93c5fd'] as const

type BurstListener = (x: number, y: number, forcedTheme?: Exclude<SeasonalTheme, 'none'>) => void
let activeBurstListener: BurstListener | null = null

export function triggerSeasonalParticleBurst(
  x: number,
  y: number,
  forcedTheme?: Exclude<SeasonalTheme, 'none'>
): void {
  activeBurstListener?.(x, y, forcedTheme)
}

function drawParticle(ctx: CanvasRenderingContext2D, p: SeasonalParticle): void {
  const alpha = Math.max(0, 1 - p.life / p.maxLife)
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rot)

  switch (p.shape) {
    case 'gift': {
      const s = p.size
      const half = s / 2
      ctx.fillStyle = p.color
      ctx.fillRect(-half, -half, s, s)
      ctx.fillStyle = p.accent
      ctx.fillRect(-s * 0.14, -half, s * 0.28, s)
      ctx.fillRect(-half, -s * 0.14, s, s * 0.28)
      // Golden bow loops on top
      ctx.strokeStyle = p.accent
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.ellipse(-s * 0.18, -half - 1.6, s * 0.18, s * 0.11, -0.35, 0, Math.PI * 2)
      ctx.ellipse(s * 0.18, -half - 1.6, s * 0.18, s * 0.11, 0.35, 0, Math.PI * 2)
      ctx.stroke()
      break
    }
    case 'confetti': {
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size * 0.5, -p.size * 0.24, p.size, p.size * 0.48)
      break
    }
    case 'violet-orb': {
      ctx.shadowColor = p.color
      ctx.shadowBlur = 10
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(0, 0, p.size * 0.42, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fae8ff'
      ctx.beginPath()
      ctx.arc(0, 0, p.size * 0.18, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'violet-shard': {
      ctx.shadowColor = '#d946ef'
      ctx.shadowBlur = 8
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.moveTo(0, -p.size * 0.6)
      ctx.lineTo(p.size * 0.36, 0)
      ctx.lineTo(0, p.size * 0.6)
      ctx.lineTo(-p.size * 0.36, 0)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'egg': {
      const rx = p.size * 0.42
      const ry = p.size * 0.56
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = p.accent
      ctx.fillRect(-rx * 0.85, -ry * 0.16, rx * 1.7, ry * 0.32)
      break
    }
    case 'petal': {
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.ellipse(0, 0, p.size * 0.48, p.size * 0.26, 0, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'sparkle': {
      const r = p.size * 0.55
      ctx.fillStyle = '#fde047'
      ctx.beginPath()
      ctx.moveTo(0, -r)
      ctx.quadraticCurveTo(0, 0, r, 0)
      ctx.quadraticCurveTo(0, 0, 0, r)
      ctx.quadraticCurveTo(0, 0, -r, 0)
      ctx.quadraticCurveTo(0, 0, 0, -r)
      ctx.fill()
      break
    }
  }

  ctx.restore()
}

export function SeasonalInteractionCanvas({
  theme
}: {
  theme: Exclude<SeasonalTheme, 'none'>
}): React.JSX.Element {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const themeRef = React.useRef(theme)
  themeRef.current = theme

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const particles: SeasonalParticle[] = []
    let rafId: number | null = null
    let lastTs = 0

    const syncSize = (): void => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    syncSize()

    const step = (ts: number): void => {
      const dt = lastTs > 0 ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016
      lastTs = ts
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!
        p.life += dt
        if (p.life >= p.maxLife) {
          particles.splice(i, 1)
          continue
        }
        p.vy += p.gravity * dt
        p.vx *= 0.985
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rot += p.vRot * dt
        drawParticle(ctx, p)
      }

      if (particles.length > 0) {
        rafId = window.requestAnimationFrame(step)
      } else {
        rafId = null
        lastTs = 0
      }
    }

    const spawnBurst: BurstListener = (x, y, forced) => {
      const activeTheme = forced ?? themeRef.current
      const count = 16
      for (let i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) {
          particles.shift()
        }
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45
        const speed = 55 + Math.random() * 115

        if (activeTheme === 'christmas') {
          const isGift = i % 3 === 0
          const color = XMAS_COLORS[i % XMAS_COLORS.length]!
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 45,
            gravity: 210,
            rot: (Math.random() - 0.5) * 0.6,
            vRot: (Math.random() - 0.5) * (isGift ? 4 : 9),
            size: isGift ? 9 + Math.random() * 3.5 : 7 + Math.random() * 3,
            life: 0,
            maxLife: 0.68 + Math.random() * 0.25,
            color,
            accent: '#facc15',
            shape: isGift ? 'gift' : 'confetti'
          })
        } else if (activeTheme === 'halloween') {
          const isShard = i % 2 === 0
          const color = HALLOWEEN_COLORS[i % HALLOWEEN_COLORS.length]!
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed * 0.85,
            vy: Math.sin(angle) * speed * 0.85 - 25,
            gravity: -35,
            rot: Math.random() * Math.PI,
            vRot: (Math.random() - 0.5) * 6,
            size: isShard ? 8 + Math.random() * 4 : 7 + Math.random() * 4,
            life: 0,
            maxLife: 0.65 + Math.random() * 0.28,
            color,
            accent: '#fae8ff',
            shape: isShard ? 'violet-shard' : 'violet-orb'
          })
        } else {
          const roll = i % 4
          const shape: ParticleShape = roll === 0 ? 'egg' : roll === 3 ? 'sparkle' : 'petal'
          const color = EASTER_COLORS[i % EASTER_COLORS.length]!
          const accent = EASTER_COLORS[(i + 2) % EASTER_COLORS.length]!
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed * 0.9,
            vy: Math.sin(angle) * speed * 0.9 - 35,
            gravity: 130,
            rot: Math.random() * Math.PI,
            vRot: (Math.random() - 0.5) * 5,
            size: shape === 'egg' ? 9 + Math.random() * 3 : 7.5 + Math.random() * 3,
            life: 0,
            maxLife: 0.72 + Math.random() * 0.25,
            color,
            accent,
            shape
          })
        }
      }

      if (rafId === null) {
        lastTs = 0
        rafId = window.requestAnimationFrame(step)
      }
    }

    const onPointerDown = (e: PointerEvent): void => {
      if (e.button !== 0) return
      spawnBurst(e.clientX, e.clientY)
    }

    activeBurstListener = spawnBurst
    window.addEventListener('resize', syncSize)
    window.addEventListener('pointerdown', onPointerDown, { passive: true })

    return () => {
      activeBurstListener = null
      window.removeEventListener('resize', syncSize)
      window.removeEventListener('pointerdown', onPointerDown)
      if (rafId !== null) window.cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[95] h-screen w-screen"
    />
  )
}
