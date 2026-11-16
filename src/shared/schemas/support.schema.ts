import { z } from 'zod'

export const SUPPORT_COOLDOWN_SECONDS = 180 as const

export const SupportTicketCategorySchema = z.enum(['bug', 'feature', 'help'])
export type SupportTicketCategory = z.infer<typeof SupportTicketCategorySchema>

export const SupportTicketInputSchema = z.object({
  category: SupportTicketCategorySchema,
  subject: z.string().trim().min(5).max(90),
  message: z.string().trim().min(15).max(1500),
  contact: z.string().trim().max(48).optional().default(''),
  includeDiagnostics: z.boolean().default(true),
  activeRoute: z.string().trim().max(120).optional().default('wf://market')
})
export type SupportTicketInput = z.infer<typeof SupportTicketInputSchema>

export const SupportStatusSchema = z.object({
  relayConfigured: z.boolean(),
  cooldownRemainingSec: z.number().int().nonnegative(),
  lastTicketId: z.string().nullable()
})
export type SupportStatus = z.infer<typeof SupportStatusSchema>

export const SupportErrorCodeSchema = z.enum([
  'NOT_CONFIGURED',
  'COOLDOWN',
  'RATE_LIMITED',
  'NETWORK_ERROR',
  'VALIDATION_ERROR'
])
export type SupportErrorCode = z.infer<typeof SupportErrorCodeSchema>

export const SupportTicketResultSchema = z.object({
  ok: z.boolean(),
  ticketId: z.string().nullable(),
  cooldownRemainingSec: z.number().int().nonnegative(),
  errorCode: SupportErrorCodeSchema.optional(),
  errorMessage: z.string().optional()
})
export type SupportTicketResult = z.infer<typeof SupportTicketResultSchema>
