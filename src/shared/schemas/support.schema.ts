import { z } from 'zod'

export const SUPPORT_COOLDOWN_SECONDS = 600 as const // 10 minutes
export const SUPPORT_DAILY_MAX = 3 as const // Max 3 tickets per rolling 24h
export const SUPPORT_RAW_IMAGE_MAX_BYTES = 8 * 1024 * 1024 // 8 MiB raw input cap
export const SUPPORT_SANITIZED_IMAGE_MAX_BYTES = 2_621_440 // 2.5 MiB sanitized output cap
export const SUPPORT_IMAGE_MAX_DIMENSION = 8192 // Anti-decompression-bomb header cap
export const SUPPORT_IMAGE_TARGET_MAX_EDGE = 1920 // Downscale longest edge for crisp Discord embeds

export const SupportTicketCategorySchema = z.enum(['bug', 'feature', 'help'])
export type SupportTicketCategory = z.infer<typeof SupportTicketCategorySchema>

export const SupportImageMimeSchema = z.enum(['image/png', 'image/jpeg'])
export type SupportImageMime = z.infer<typeof SupportImageMimeSchema>

export const SupportRawAttachmentInputSchema = z.object({
  bytes: z
    .instanceof(Uint8Array)
    .refine(
      (b) => b.byteLength >= 32 && b.byteLength <= SUPPORT_RAW_IMAGE_MAX_BYTES,
      'Image size must be between 32 bytes and 8 MB.'
    ),
  fileNameHint: z.string().trim().max(128).optional().default('')
})
export type SupportRawAttachmentInput = z.infer<typeof SupportRawAttachmentInputSchema>

export const SupportSanitizedAttachmentSchema = z.object({
  mimeType: SupportImageMimeSchema,
  dataBase64: z
    .string()
    .min(32)
    .max(3_600_000)
    .regex(/^[A-Za-z0-9+/=]+$/, 'Invalid base64 image payload'),
  width: z.number().int().min(8).max(4096),
  height: z.number().int().min(8).max(4096),
  byteLength: z.number().int().min(32).max(SUPPORT_SANITIZED_IMAGE_MAX_BYTES)
})
export type SupportSanitizedAttachment = z.infer<typeof SupportSanitizedAttachmentSchema>

export const SupportPrepareAttachmentResultSchema = z.object({
  ok: z.boolean(),
  attachment: SupportSanitizedAttachmentSchema.optional(),
  errorMessage: z.string().optional()
})
export type SupportPrepareAttachmentResult = z.infer<typeof SupportPrepareAttachmentResultSchema>

export const SupportTicketInputSchema = z.object({
  category: SupportTicketCategorySchema,
  subject: z.string().trim().min(5).max(90),
  message: z.string().trim().min(15).max(1500),
  contact: z.string().trim().max(48).optional().default(''),
  includeDiagnostics: z.boolean().default(true),
  activeRoute: z.string().trim().max(120).optional().default('wf://market'),
  attachment: SupportSanitizedAttachmentSchema.nullable().optional().default(null)
})
export type SupportTicketInput = z.infer<typeof SupportTicketInputSchema>

export const SupportStatusSchema = z.object({
  relayConfigured: z.boolean(),
  cooldownRemainingSec: z.number().int().nonnegative(),
  dailyRemaining: z.number().int().min(0).max(SUPPORT_DAILY_MAX).default(SUPPORT_DAILY_MAX),
  dailyMax: z.number().int().positive().default(SUPPORT_DAILY_MAX),
  lastTicketId: z.string().nullable()
})
export type SupportStatus = z.infer<typeof SupportStatusSchema>

export const SupportErrorCodeSchema = z.enum([
  'NOT_CONFIGURED',
  'COOLDOWN',
  'DAILY_LIMIT',
  'SPAM_CONTENT',
  'INVALID_IMAGE',
  'DUPLICATE',
  'BANNED',
  'RATE_LIMITED',
  'NETWORK_ERROR',
  'VALIDATION_ERROR'
])
export type SupportErrorCode = z.infer<typeof SupportErrorCodeSchema>

export const SupportTicketResultSchema = z.object({
  ok: z.boolean(),
  ticketId: z.string().nullable(),
  cooldownRemainingSec: z.number().int().nonnegative(),
  dailyRemaining: z.number().int().min(0).max(SUPPORT_DAILY_MAX).optional(),
  errorCode: SupportErrorCodeSchema.optional(),
  errorMessage: z.string().optional()
})
export type SupportTicketResult = z.infer<typeof SupportTicketResultSchema>
