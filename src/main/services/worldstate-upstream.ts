import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import {
  WorldstateHubPayloadSchema,
  type WorldstateHubPayload
} from '@shared/schemas/worldstate.schema'
import type { RateLimitedHttpClient } from '../infrastructure/http/RateLimitedHttpClient'
import { RawWfStatResponseSchema, type RawWfStatResponse } from './wfstat-raw.schemas'

interface UpstreamCandidate {
  url: string
  acceptLanguage: string
  retryDelayMs?: number
}

function buildWfStatCandidates(langCode: string): readonly UpstreamCandidate[] {
  const safe = encodeURIComponent(langCode || 'fr')
  if (safe === 'en') {
    return [
      { url: 'https://api.warframestat.us/pc?language=en', acceptLanguage: 'en' },
      { url: 'https://api.warframestat.us/pc', acceptLanguage: 'en', retryDelayMs: 350 }
    ]
  }
  return [
    { url: `https://api.warframestat.us/pc?language=${safe}`, acceptLanguage: safe },
    { url: `https://api.warframestat.us/pc/?language=${safe}`, acceptLanguage: safe, retryDelayMs: 400 },
    { url: 'https://api.warframestat.us/pc?language=en', acceptLanguage: 'en' },
    { url: 'https://api.warframestat.us/pc', acceptLanguage: 'en' }
  ]
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Resilient upstream fetcher for `api.warframestat.us`.
 * Handles cold locale cache `404` responses by retrying canonical paths
 * and seamlessly falling back to `/pc?language=en`.
 */
export async function fetchResilientWfStatRaw(
  http: RateLimitedHttpClient,
  wfstatLangCode = 'fr'
): Promise<RawWfStatResponse> {
  let lastError: unknown = null

  for (const candidate of buildWfStatCandidates(wfstatLangCode)) {
    if (candidate.retryDelayMs) {
      await delay(candidate.retryDelayMs)
    }
    try {
      return await http.getJson(candidate.url, RawWfStatResponseSchema, {
        bypassRateLimit: true,
        timeoutMs: 10_000,
        headers: {
          'Accept-Language': candidate.acceptLanguage,
          'Cache-Control': 'no-cache'
        }
      })
    } catch (err) {
      lastError = err
    }
  }

  const detail = lastError instanceof Error ? lastError.message : 'Service injoignable'
  throw new Error(
    `Le serveur communautaire Worldstate (api.warframestat.us) est temporairement indisponible (${detail}). Réessaie dans quelques secondes.`
  )
}

/**
 * In-memory + disk-backed (`userData/worldstate-last-good.json`) fallback store
 * validated with Zod so transient upstream outages never break the Hub view.
 */
export class WorldstateSnapshotFallback {
  private memorySnapshot: WorldstateHubPayload | null = null
  private readonly snapshotPath: string | null

  constructor(userDataPath?: string) {
    this.snapshotPath = userDataPath ? join(userDataPath, 'worldstate-last-good.json') : null
  }

  public recordSuccess(payload: WorldstateHubPayload): void {
    this.memorySnapshot = payload
    if (!this.snapshotPath) return
    void fs
      .writeFile(this.snapshotPath, JSON.stringify(payload), 'utf-8')
      .catch(() => undefined)
  }

  public async loadLastGood(): Promise<WorldstateHubPayload | null> {
    if (this.memorySnapshot) {
      return this.pruneExpiredEntries(this.memorySnapshot)
    }
    if (!this.snapshotPath) return null

    try {
      const rawText = await fs.readFile(this.snapshotPath, 'utf-8')
      const parsed = WorldstateHubPayloadSchema.safeParse(JSON.parse(rawText))
      if (!parsed.success) return null
      this.memorySnapshot = parsed.data
      return this.pruneExpiredEntries(parsed.data)
    } catch {
      return null
    }
  }

  private pruneExpiredEntries(snapshot: WorldstateHubPayload): WorldstateHubPayload {
    const now = Date.now()
    return {
      ...snapshot,
      fissures: snapshot.fissures.filter((f) => Date.parse(f.expiry) > now),
      alerts: snapshot.alerts.filter((a) => Date.parse(a.expiry) > now),
      events: snapshot.events.filter((e) => Date.parse(e.expiry) > now),
      globalBoosters: snapshot.globalBoosters.filter((g) => Date.parse(g.expiry) > now)
    }
  }
}

