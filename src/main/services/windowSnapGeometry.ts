import type { Display, Point, Rectangle } from 'electron'
import type { ResizeDirection, SnapZone } from '@shared/schemas/window.schema'

const SNAP_EDGE_PX = 8
const SNAP_CORNER_PX = 44

/**
 * Détecte la zone d'ancrage Aero Snap Windows (plein écran zone de travail,
 * moitié gauche/droite ou quart d'écran dans les 4 coins), tout en respectant
 * les configurations multi-écrans (ne bloque pas le passage entre deux écrans adjacents).
 */
export function detectSnapZone(
  cursor: Point,
  currentDisplay: Display,
  allDisplays: readonly Display[]
): SnapZone | null {
  const wa = currentDisplay.workArea
  const db = currentDisplay.bounds

  const hasMonitorAbove = allDisplays.some(
    (d) =>
      d.id !== currentDisplay.id &&
      d.bounds.y + d.bounds.height <= db.y + 4 &&
      cursor.x >= d.bounds.x &&
      cursor.x < d.bounds.x + d.bounds.width
  )
  const hasMonitorLeft = allDisplays.some(
    (d) =>
      d.id !== currentDisplay.id &&
      d.bounds.x + d.bounds.width <= db.x + 4 &&
      cursor.y >= d.bounds.y &&
      cursor.y < d.bounds.y + d.bounds.height
  )
  const hasMonitorRight = allDisplays.some(
    (d) =>
      d.id !== currentDisplay.id &&
      d.bounds.x >= db.x + db.width - 4 &&
      cursor.y >= d.bounds.y &&
      cursor.y < d.bounds.y + d.bounds.height
  )

  const nearTop = !hasMonitorAbove && cursor.y <= wa.y + SNAP_EDGE_PX
  const nearLeft = !hasMonitorLeft && cursor.x <= wa.x + SNAP_EDGE_PX
  const nearRight = !hasMonitorRight && cursor.x >= wa.x + wa.width - SNAP_EDGE_PX

  if (
    (nearLeft && cursor.y <= wa.y + SNAP_CORNER_PX) ||
    (nearTop && !hasMonitorLeft && cursor.x <= wa.x + SNAP_CORNER_PX)
  ) {
    return 'top-left'
  }
  if (
    (nearRight && cursor.y <= wa.y + SNAP_CORNER_PX) ||
    (nearTop && !hasMonitorRight && cursor.x >= wa.x + wa.width - SNAP_CORNER_PX)
  ) {
    return 'top-right'
  }
  if (nearLeft && cursor.y >= wa.y + wa.height - SNAP_CORNER_PX) {
    return 'bottom-left'
  }
  if (nearRight && cursor.y >= wa.y + wa.height - SNAP_CORNER_PX) {
    return 'bottom-right'
  }

  if (nearTop) return 'maximize'
  if (nearLeft) return 'left'
  if (nearRight) return 'right'

  return null
}

/**
 * Calcule le rectangle cible d'une zone Aero Snap sur la `workArea` de l'écran actif.
 */
export function computeSnapBounds(
  zone: SnapZone,
  workArea: Rectangle,
  minW: number,
  minH: number
): Rectangle {
  if (zone === 'maximize') {
    return { ...workArea }
  }

  const halfW = Math.max(minW, Math.round(workArea.width / 2))
  const rightW = Math.max(minW, workArea.width - Math.round(workArea.width / 2))
  const rightX = workArea.x + workArea.width - rightW
  const halfH = Math.max(minH, Math.round(workArea.height / 2))
  const bottomH = Math.max(minH, workArea.height - Math.round(workArea.height / 2))
  const bottomY = workArea.y + workArea.height - bottomH

  switch (zone) {
    case 'left':
      return { x: workArea.x, y: workArea.y, width: halfW, height: workArea.height }
    case 'right':
      return { x: rightX, y: workArea.y, width: rightW, height: workArea.height }
    case 'top-left':
      return { x: workArea.x, y: workArea.y, width: halfW, height: halfH }
    case 'top-right':
      return { x: rightX, y: workArea.y, width: rightW, height: halfH }
    case 'bottom-left':
      return { x: workArea.x, y: bottomY, width: halfW, height: bottomH }
    case 'bottom-right':
      return { x: rightX, y: bottomY, width: rightW, height: bottomH }
  }
}

/**
 * Calcule les nouvelles coordonnées d'une fenêtre redimensionnée par un bord ou un coin
 * en gardant le bord opposé parfaitement ancré lorsqu'on atteint `minW` ou `minH`.
 */
export function computeResizedBounds(
  dir: ResizeDirection,
  start: Rectangle,
  dx: number,
  dy: number,
  minW: number,
  minH: number
): Rectangle {
  let x = start.x
  let y = start.y
  let width = start.width
  let height = start.height

  if (dir.includes('e')) {
    width = Math.max(minW, Math.round(start.width + dx))
  } else if (dir.includes('w')) {
    const rightEdge = start.x + start.width
    width = Math.max(minW, Math.round(start.width - dx))
    x = rightEdge - width
  }

  if (dir.includes('s')) {
    height = Math.max(minH, Math.round(start.height + dy))
  } else if (dir.includes('n')) {
    const bottomEdge = start.y + start.height
    height = Math.max(minH, Math.round(start.height - dy))
    y = bottomEdge - height
  }

  return { x, y, width, height }
}
