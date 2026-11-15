import * as React from 'react'
import type { ResizeDirection } from '@shared/schemas/window.schema'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'

interface HandleSpec {
  dir: ResizeDirection
  className: string
}

const RESIZE_HANDLES: readonly HandleSpec[] = [
  { dir: 'n', className: 'top-0 left-2.5 right-28 h-1 cursor-ns-resize' },
  { dir: 's', className: 'bottom-0 left-2.5 right-2.5 h-1.5 cursor-ns-resize' },
  { dir: 'w', className: 'left-0 top-2.5 bottom-2.5 w-1.5 cursor-ew-resize' },
  { dir: 'e', className: 'right-0 top-9 bottom-2.5 w-1.5 cursor-ew-resize' },
  { dir: 'nw', className: 'top-0 left-0 h-2.5 w-2.5 cursor-nwse-resize' },
  { dir: 'sw', className: 'bottom-0 left-0 h-2.5 w-2.5 cursor-nesw-resize' },
  { dir: 'se', className: 'bottom-0 right-0 h-2.5 w-2.5 cursor-nwse-resize' }
] as const

/**
 * Bords et coins de redimensionnement personnalisés pilotés à 120 Hz côté Main Process
 * (`screen.getCursorScreenPoint()`) pour une précision multi-écran / multi-DPI absolue.
 */
export function WindowResizeHandles(): React.JSX.Element | null {
  const isMaximized = useAppStore((s) => s.windowState.isMaximized)
  const isClickThrough = useAppStore((s) => s.windowState.isClickThrough)

  if (isMaximized || isClickThrough) {
    return null
  }

  const startResize = (dir: ResizeDirection, e: React.PointerEvent<HTMLDivElement>): void => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    const el = e.currentTarget
    const pointerId = e.pointerId
    try {
      el.setPointerCapture(pointerId)
    } catch {
      // Ignore si le pointeur est déjà relâché
    }

    let ended = false
    void ipcClient.window.beginResize({ direction: dir })

    const finish = (): void => {
      if (ended) return
      ended = true
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
      window.removeEventListener('blur', finish)
      void ipcClient.window.endResize()
    }

    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
    window.addEventListener('blur', finish)
  }

  return (
    <>
      {RESIZE_HANDLES.map((h) => (
        <div
          key={h.dir}
          aria-hidden="true"
          onPointerDown={(e) => startResize(h.dir, e)}
          className={`app-no-drag fixed z-[60] select-none ${h.className}`}
        />
      ))}
    </>
  )
}
