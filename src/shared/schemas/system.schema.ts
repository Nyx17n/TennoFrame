import { z } from 'zod'

export const SystemStatusSchema = z.object({
  appVersion: z.string(),
  apiConnected: z.boolean(),
  rateLimiterInWindow: z.number().int().nonnegative(),
  rateLimiterMaxPerSec: z.number().int().positive(),
  memoryCacheEntries: z.number().int().nonnegative(),
  userDataPath: z.string()
})

export type SystemStatus = z.infer<typeof SystemStatusSchema>

export const CommunityStatsSnapshotSchema = z.object({
  installedUsersCount: z.number().int().min(1),
  onlineCount: z.number().int().nonnegative(),
  discordMemberCount: z.number().int().nonnegative(),
  updatedAt: z.string(),
  fromOfflineCache: z.boolean()
})

export type CommunityStatsSnapshot = z.infer<typeof CommunityStatsSnapshotSchema>

export const CommunityStatsQuerySchema = z
  .object({
    forceRefresh: z.boolean().optional()
  })
  .default({})
