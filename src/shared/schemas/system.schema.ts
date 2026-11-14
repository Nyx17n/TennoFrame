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

export const ReleaseDownloadStatSchema = z.object({
  tag: z.string(),
  version: z.string(),
  downloads: z.number().int().nonnegative(),
  sharePercent: z.number().min(0).max(100),
  publishedAt: z.string()
})

export type ReleaseDownloadStat = z.infer<typeof ReleaseDownloadStatSchema>

export const CommunityStatsSnapshotSchema = z.object({
  installedUsersCount: z.number().int().min(1),
  totalDownloadsCount: z.number().int().nonnegative(),
  onlineCount: z.number().int().nonnegative(),
  discordMemberCount: z.number().int().nonnegative(),
  latestVersion: z.string(),
  latestVersionDownloads: z.number().int().nonnegative(),
  releases: z.array(ReleaseDownloadStatSchema),
  updatedAt: z.string(),
  fromOfflineCache: z.boolean()
})

export type CommunityStatsSnapshot = z.infer<typeof CommunityStatsSnapshotSchema>

export const CommunityStatsQuerySchema = z
  .object({
    forceRefresh: z.boolean().optional()
  })
  .default({})
