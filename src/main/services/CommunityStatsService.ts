import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import { DISCORD_INVITE_CODE } from '@shared/constants'
import {
  CommunityStatsSnapshotSchema,
  type CommunityStatsSnapshot
} from '@shared/schemas/system.schema'
import type { RateLimitedHttpClient } from '../infrastructure/http/RateLimitedHttpClient'

const GITHUB_RELEASES_API_URL =
  'https://api.github.com/repos/Nyx17n/TennoFrame/releases?per_page=100'
const DISCORD_INVITE_COUNTS_URL = `https://discord.com/api/v10/invites/${DISCORD_INVITE_CODE}?with_counts=true`

const MEMORY_CACHE_TTL_MS = 15 * 60_000
const MANUAL_REFRESH_COOLDOWN_MS = 10_000

const GitHubReleaseAssetSchema = z.object({
  name: z.string(),
  download_count: z.number().int().nonnegative()
})

const GitHubReleaseItemSchema = z.object({
  draft: z.boolean().optional().default(false),
  assets: z.array(GitHubReleaseAssetSchema).default([])
})

const GitHubReleasesArraySchema = z.array(GitHubReleaseItemSchema)

const DiscordInviteCountsSchema = z.object({
  approximate_member_count: z.number().int().nonnegative().optional().default(0),
  approximate_presence_count: z.number().int().nonnegative().optional().default(0)
})

export class CommunityStatsService {
  private readonly cacheFilePath: string
  private memorySnapshot: CommunityStatsSnapshot | null = null
  private lastNetworkFetchAt = 0
  private diskLoaded = false

  constructor(
    private readonly httpClient: RateLimitedHttpClient,
    userDataPath: string
  ) {
    this.cacheFilePath = join(userDataPath, 'community-stats-cache.json')
  }

  public async getStats(forceRefresh = false): Promise<CommunityStatsSnapshot> {
    if (!this.diskLoaded) {
      await this.loadDiskCache()
    }

    const now = Date.now()
    const cacheAge = now - this.lastNetworkFetchAt
    if (this.memorySnapshot && !this.memorySnapshot.fromOfflineCache) {
      if (!forceRefresh && cacheAge < MEMORY_CACHE_TTL_MS) {
        return this.memorySnapshot
      }
      if (forceRefresh && cacheAge < MANUAL_REFRESH_COOLDOWN_MS) {
        return this.memorySnapshot
      }
    }

    const [githubOutcome, discordOutcome] = await Promise.allSettled([
      this.fetchInstalledUsersEstimate(),
      this.fetchDiscordMetrics()
    ])

    const ghInstalled = githubOutcome.status === 'fulfilled' ? githubOutcome.value : null
    const dc = discordOutcome.status === 'fulfilled' ? discordOutcome.value : null

    if (ghInstalled === null && !dc) {
      if (this.memorySnapshot) {
        return {
          ...this.memorySnapshot,
          fromOfflineCache: true
        }
      }
      return this.buildBootstrapFallback()
    }

    const previous = this.memorySnapshot
    const discordMemberCount = dc?.memberCount ?? previous?.discordMemberCount ?? 0
    const onlineCount = Math.max(1, dc?.onlineCount ?? previous?.onlineCount ?? 1)
    const installedUsersCount = Math.max(
      1,
      ghInstalled ?? previous?.installedUsersCount ?? 1,
      discordMemberCount
    )

    const snapshot: CommunityStatsSnapshot = CommunityStatsSnapshotSchema.parse({
      installedUsersCount,
      onlineCount,
      discordMemberCount,
      updatedAt: new Date().toISOString(),
      fromOfflineCache: ghInstalled === null
    })

    this.memorySnapshot = snapshot
    if (ghInstalled !== null) {
      this.lastNetworkFetchAt = now
    }
    await this.persistDiskCache(snapshot)
    return snapshot
  }

  private async fetchInstalledUsersEstimate(): Promise<number> {
    const rawReleases = await this.httpClient.getJson(
      GITHUB_RELEASES_API_URL,
      GitHubReleasesArraySchema,
      {
        bypassRateLimit: true,
        timeoutMs: 10_000,
        headers: {
          Accept: 'application/vnd.github+json'
        }
      }
    )

    const peakSingleRelease = rawReleases
      .filter((rel) => !rel.draft)
      .reduce((max, rel) => {
        const exeDownloads = rel.assets
          .filter((asset) => asset.name.toLowerCase().endsWith('.exe'))
          .reduce((sum, asset) => sum + asset.download_count, 0)
        return Math.max(max, exeDownloads)
      }, 0)

    return Math.max(1, peakSingleRelease)
  }

  private async fetchDiscordMetrics(): Promise<{ memberCount: number; onlineCount: number }> {
    const data = await this.httpClient.getJson(
      DISCORD_INVITE_COUNTS_URL,
      DiscordInviteCountsSchema,
      {
        bypassRateLimit: true,
        timeoutMs: 8_000
      }
    )
    return {
      memberCount: data.approximate_member_count,
      onlineCount: data.approximate_presence_count
    }
  }

  private buildBootstrapFallback(): CommunityStatsSnapshot {
    return {
      installedUsersCount: 1,
      onlineCount: 1,
      discordMemberCount: 0,
      updatedAt: new Date().toISOString(),
      fromOfflineCache: true
    }
  }

  private async loadDiskCache(): Promise<void> {
    this.diskLoaded = true
    try {
      const raw = await fs.readFile(this.cacheFilePath, 'utf-8')
      const parsed = CommunityStatsSnapshotSchema.safeParse(JSON.parse(raw))
      if (parsed.success) {
        this.memorySnapshot = parsed.data
      }
    } catch {
      // Cache file does not exist yet on first startup
    }
  }

  private async persistDiskCache(snapshot: CommunityStatsSnapshot): Promise<void> {
    try {
      const tmpPath = `${this.cacheFilePath}.tmp`
      await fs.writeFile(tmpPath, JSON.stringify(snapshot, null, 2), 'utf-8')
      await fs.rename(tmpPath, this.cacheFilePath)
    } catch {
      // Ignore transient filesystem lock errors
    }
  }
}
