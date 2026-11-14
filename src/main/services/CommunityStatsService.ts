import { app } from 'electron'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import { DISCORD_INVITE_CODE } from '@shared/constants'
import {
  CommunityStatsSnapshotSchema,
  type CommunityStatsSnapshot,
  type ReleaseDownloadStat
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
  tag_name: z.string(),
  draft: z.boolean().optional().default(false),
  published_at: z.string().nullable().optional(),
  assets: z.array(GitHubReleaseAssetSchema).default([])
})

const GitHubReleasesArraySchema = z.array(GitHubReleaseItemSchema)

const DiscordInviteCountsSchema = z.object({
  approximate_member_count: z.number().int().nonnegative().optional().default(0),
  approximate_presence_count: z.number().int().nonnegative().optional().default(0)
})

interface GitHubComputedMetrics {
  installedUsersCount: number
  totalDownloadsCount: number
  latestVersion: string
  latestVersionDownloads: number
  releases: ReleaseDownloadStat[]
}

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
      this.fetchGitHubMetrics(),
      this.fetchDiscordMetrics()
    ])

    const gh = githubOutcome.status === 'fulfilled' ? githubOutcome.value : null
    const dc = discordOutcome.status === 'fulfilled' ? discordOutcome.value : null

    if (!gh && !dc) {
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
    const totalDownloadsCount = gh?.totalDownloadsCount ?? previous?.totalDownloadsCount ?? 1
    const installedUsersCount = Math.max(
      1,
      gh?.installedUsersCount ?? previous?.installedUsersCount ?? 1,
      discordMemberCount
    )

    const snapshot: CommunityStatsSnapshot = CommunityStatsSnapshotSchema.parse({
      installedUsersCount,
      totalDownloadsCount: Math.max(installedUsersCount, totalDownloadsCount),
      onlineCount,
      discordMemberCount,
      latestVersion: gh?.latestVersion ?? previous?.latestVersion ?? app.getVersion(),
      latestVersionDownloads:
        gh?.latestVersionDownloads ?? previous?.latestVersionDownloads ?? 0,
      releases: gh?.releases ?? previous?.releases ?? [],
      updatedAt: new Date().toISOString(),
      fromOfflineCache: !gh
    })

    this.memorySnapshot = snapshot
    if (gh) {
      this.lastNetworkFetchAt = now
    }
    await this.persistDiskCache(snapshot)
    return snapshot
  }

  private async fetchGitHubMetrics(): Promise<GitHubComputedMetrics> {
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

    const published = rawReleases.filter((rel) => !rel.draft)
    const perRelease = published.map((rel) => {
      const exeDownloads = rel.assets
        .filter((asset) => asset.name.toLowerCase().endsWith('.exe'))
        .reduce((sum, asset) => sum + asset.download_count, 0)
      const version = rel.tag_name.replace(/^v/i, '')
      return {
        tag: rel.tag_name,
        version,
        downloads: exeDownloads,
        publishedAt: rel.published_at ?? ''
      }
    })

    const totalDownloadsCount = perRelease.reduce((sum, r) => sum + r.downloads, 0)
    const peakSingleRelease = perRelease.reduce((max, r) => Math.max(max, r.downloads), 0)
    const latest = perRelease[0]

    const topFive = perRelease.slice(0, 5)
    const topFiveSum = Math.max(
      1,
      topFive.reduce((sum, item) => sum + item.downloads, 0)
    )

    const releases: ReleaseDownloadStat[] = topFive.map((item) => ({
      tag: item.tag,
      version: item.version,
      downloads: item.downloads,
      sharePercent: Math.round((item.downloads / topFiveSum) * 100),
      publishedAt: item.publishedAt
    }))

    return {
      installedUsersCount: Math.max(1, peakSingleRelease),
      totalDownloadsCount: Math.max(1, totalDownloadsCount),
      latestVersion: latest?.version ?? app.getVersion(),
      latestVersionDownloads: latest?.downloads ?? 0,
      releases
    }
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
    const currentVersion = app.getVersion()
    return {
      installedUsersCount: 1,
      totalDownloadsCount: 1,
      onlineCount: 1,
      discordMemberCount: 0,
      latestVersion: currentVersion,
      latestVersionDownloads: 1,
      releases: [
        {
          tag: `v${currentVersion}`,
          version: currentVersion,
          downloads: 1,
          sharePercent: 100,
          publishedAt: new Date().toISOString()
        }
      ],
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
