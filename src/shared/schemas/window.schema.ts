import { z } from 'zod'

export const WindowBoundsSchema = z.object({
  x: z.number().int().optional(),
  y: z.number().int().optional(),
  width: z.number().int().min(360).max(7680),
  height: z.number().int().min(420).max(4320)
})

export type WindowBounds = z.infer<typeof WindowBoundsSchema>

export const SnapZoneSchema = z.enum([
  'maximize',
  'left',
  'right',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right'
])

export type SnapZone = z.infer<typeof SnapZoneSchema>

export const ResizeDirectionSchema = z.enum([
  'n',
  's',
  'e',
  'w',
  'nw',
  'ne',
  'sw',
  'se'
])

export type ResizeDirection = z.infer<typeof ResizeDirectionSchema>

export const BeginDragPayloadSchema = z.object({
  ratioX: z.number().min(0).max(1),
  offsetY: z.number().min(0).max(120)
})

export type BeginDragPayload = z.infer<typeof BeginDragPayloadSchema>

export const BeginResizePayloadSchema = z.object({
  direction: ResizeDirectionSchema
})

export type BeginResizePayload = z.infer<typeof BeginResizePayloadSchema>

export const WindowStateSchema = z.object({
  isMaximized: z.boolean(),
  isSnapped: z.boolean().default(false),
  snapPreview: SnapZoneSchema.nullable().default(null),
  isAlwaysOnTop: z.boolean(),
  isCompactMode: z.boolean(),
  isClickThrough: z.boolean().default(false),
  zoomPercent: z.number().int().min(50).max(200)
})

export type WindowState = z.infer<typeof WindowStateSchema>

export const ExternalUrlPayloadSchema = z.object({
  url: z.string().url().max(2048)
})

export const BooleanTogglePayloadSchema = z.object({
  enabled: z.boolean()
})

export const ZoomPayloadSchema = z.object({
  zoomPercent: z.number().int().min(50).max(200)
})
