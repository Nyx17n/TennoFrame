import { safeStorage } from 'electron'
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { z } from 'zod'
import {
  WfmAccountUserSchema,
  WfmPresenceStatusSchema,
  type WfmAccountUser,
  type WfmPresenceStatus,
  type WfmSessionState
} from '@shared/schemas/wfm-account.schema'
import { HttpStatusError, type RateLimitedHttpClient } from '../infrastructure/http/RateLimitedHttpClient'
import { RawWfmMeResponseSchema } from './wfm-account-raw.schemas'
import { WfmPresenceService } from './WfmPresenceService'

const WFM_API_BASE = 'https://api.warframe.market'
const JWT_THREE_PART_REGEX = /[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/

const EncryptedEnvelopeSchema = z.object({
  v: z.literal(1),
  cipherBase64: z.string().min(1),
  preferredStatus: WfmPresenceStatusSchema.default('ingame'),
  deviceId: z.string().min(8).max(80)
})

export class WfmAuthRequiredError extends Error {
  constructor(
    message = 'Connexion requise : vous devez être connecté à votre compte Warframe Market pour vendre ou gérer des annonces.'
  ) {
    super(message)
    this.name = 'WfmAuthRequiredError'
  }
}

/**
 * Handles optional Warframe Market browser-based authentication and OS-level encrypted
 * token persistence using Electron `safeStorage` (Windows DPAPI).
 * TennoFrame NEVER collects or handles user passwords; only the verified session JWT
 * is kept in Main Process memory and encrypted on disk.
 */
export class WfmAuthService {
  private readonly sessionFilePath: string
  private readonly presence: WfmPresenceService
  private jwtToken: string | null = null
  private authScheme: 'Bearer' | 'JWT' = 'Bearer'
  private currentUser: WfmAccountUser | null = null
  private persistedOnDisk = false
  private deviceId: string = randomUUID()
  private sessionSalesCount = 0
  private sessionPlatinumEarned = 0
  private readonly listeners = new Set<(state: WfmSessionState) => void>()

  constructor(
    userDataDir: string,
    private readonly http: RateLimitedHttpClient
  ) {
    this.sessionFilePath = join(userDataDir, 'wfm-session.enc')
    this.presence = new WfmPresenceService(() => {
      this.emitSessionChanged()
    })
  }

  public onSessionChanged(listener: (state: WfmSessionState) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public dispose(): void {
    this.presence.dispose()
    this.listeners.clear()
  }

  public getSessionState(): WfmSessionState {
    const encryptionAvailable = this.isEncryptionAvailableSafe()
    return {
      connected: Boolean(this.jwtToken && this.currentUser),
      encryptionAvailable,
      persistedOnDisk: this.persistedOnDisk,
      status: this.jwtToken && this.currentUser ? this.presence.getStatus() : 'invisible',
      wsConnected: this.presence.isSocketConnected(),
      user: this.currentUser,
      sessionSalesCount: this.sessionSalesCount,
      sessionPlatinumEarned: this.sessionPlatinumEarned
    }
  }

  /**
   * Hard security gate: throws immediately if no verified WFM account is connected.
   */
  public requireAuthenticatedContext(): { jwt: string; user: WfmAccountUser } {
    if (!this.jwtToken || !this.currentUser) {
      throw new WfmAuthRequiredError()
    }
    if (this.currentUser.banned) {
      throw new Error('Votre compte Warframe Market est restreint et ne peut pas publier d’annonces.')
    }
    return { jwt: this.jwtToken, user: this.currentUser }
  }

  public buildAuthHeaders(
    jwt: string,
    extraHeaders: Record<string, string> = {},
    scheme: 'Bearer' | 'JWT' = this.authScheme
  ): Record<string, string> {
    return {
      Authorization: `${scheme} ${jwt}`,
      Language: 'fr',
      ...extraHeaders
    }
  }

  public recordCompletedSale(platinumEarned: number, unitsSold = 1): void {
    this.sessionSalesCount += Math.max(1, unitsSold)
    this.sessionPlatinumEarned += Math.max(0, platinumEarned)
    this.emitSessionChanged()
  }

  public async restorePersistedSession(): Promise<WfmSessionState> {
    if (!existsSync(this.sessionFilePath) || !this.isEncryptionAvailableSafe()) {
      return this.getSessionState()
    }

    try {
      const rawContent = await readFile(this.sessionFilePath, 'utf-8')
      const envelope = EncryptedEnvelopeSchema.parse(JSON.parse(rawContent))
      this.deviceId = envelope.deviceId
      const decryptedJwt = safeStorage
        .decryptString(Buffer.from(envelope.cipherBase64, 'base64'))
        .trim()
      if (!decryptedJwt) {
        await this.clearDiskSession()
        return this.getSessionState()
      }

      const verifiedUser = await this.verifyJwtAndFetchMe(decryptedJwt)
      this.jwtToken = decryptedJwt
      this.currentUser = verifiedUser
      this.persistedOnDisk = true
      this.presence.syncPresence(decryptedJwt, envelope.preferredStatus)
      this.emitSessionChanged()
    } catch (err) {
      if (err instanceof HttpStatusError && (err.status === 401 || err.status === 403)) {
        await this.clearDiskSession()
      }
      // On transient offline startup error, leave encrypted file intact without crashing app boot
    }

    return this.getSessionState()
  }

  public async signInWithToken(input: {
    jwtToken: string
    initialStatus: WfmPresenceStatus
  }): Promise<WfmSessionState> {
    const cleaned = this.extractCleanJwt(input.jwtToken)
    if (!cleaned) {
      throw new Error('Jeton de session Warframe Market invalide.')
    }
    return this.activateVerifiedJwt(cleaned, input.initialStatus)
  }

  public async setPresenceStatus(status: WfmPresenceStatus): Promise<WfmSessionState> {
    const { jwt } = this.requireAuthenticatedContext()
    this.presence.syncPresence(jwt, status)
    if (this.persistedOnDisk) {
      await this.persistJwtSafely(jwt, status)
    }
    this.emitSessionChanged()
    return this.getSessionState()
  }

  public async signOut(): Promise<WfmSessionState> {
    this.presence.syncPresence(null, 'invisible')
    this.jwtToken = null
    this.currentUser = null
    this.persistedOnDisk = false
    await this.clearDiskSession()
    this.emitSessionChanged()
    return this.getSessionState()
  }

  public async invalidateExpiredSession(): Promise<void> {
    await this.signOut()
  }

  public async refreshCurrentUser(): Promise<WfmAccountUser> {
    const { jwt } = this.requireAuthenticatedContext()
    const fresh = await this.verifyJwtAndFetchMe(jwt)
    this.currentUser = fresh
    this.emitSessionChanged()
    return fresh
  }

  private async activateVerifiedJwt(
    jwt: string,
    initialStatus: WfmPresenceStatus
  ): Promise<WfmSessionState> {
    let user: WfmAccountUser
    try {
      user = await this.verifyJwtAndFetchMe(jwt)
    } catch (err) {
      if (err instanceof HttpStatusError && (err.status === 401 || err.status === 403)) {
        throw new Error(
          'Ce jeton JWT est expiré ou correspond à un visiteur non connecté. Connectez-vous d’abord sur warframe.market puis recopiez le cookie JWT.'
        )
      }
      throw err
    }

    this.jwtToken = jwt
    this.currentUser = user
    this.persistedOnDisk = await this.persistJwtSafely(jwt, initialStatus)
    this.presence.syncPresence(jwt, initialStatus)
    this.emitSessionChanged()
    return this.getSessionState()
  }

  private async verifyJwtAndFetchMe(jwt: string): Promise<WfmAccountUser> {
    let raw: z.infer<typeof RawWfmMeResponseSchema>
    try {
      raw = await this.http.getJson(`${WFM_API_BASE}/v2/me`, RawWfmMeResponseSchema, {
        headers: this.buildAuthHeaders(jwt, {}, 'Bearer')
      })
      this.authScheme = 'Bearer'
    } catch (err) {
      if (err instanceof HttpStatusError && err.status === 401) {
        raw = await this.http.getJson(`${WFM_API_BASE}/v2/me`, RawWfmMeResponseSchema, {
          headers: this.buildAuthHeaders(jwt, {}, 'JWT')
        })
        this.authScheme = 'JWT'
      } else {
        throw err
      }
    }

    const d = raw.data
    const fallbackName = d.ingameName || d.slug || 'Tenno'
    return WfmAccountUserSchema.parse({
      id: d.id,
      ingameName: fallbackName,
      slug: d.slug || fallbackName.toLowerCase(),
      avatar: d.avatar ?? null,
      reputation: d.reputation,
      masteryRank: d.masteryRank ?? 0,
      platform: d.platform,
      crossplay: d.crossplay,
      locale: d.locale,
      verified: d.verified,
      banned: d.banned,
      about: (d.aboutRaw ?? d.about ?? '').trim()
    })
  }

  /**
   * Extracts a clean 3-segment JWT (`header.payload.signature`) from any browser copy format:
   * - direct cookie value (`eyJhbG...`),
   * - full Chrome/Edge/Firefox DevTools row (`JWT\teyJhbG...\t.warframe.market\t/...`),
   * - `Cookie: JWT=...` or `Authorization: Bearer ...`,
   * - URL-encoded strings (`JWT%20eyJhbG...`).
   */
  public extractCleanJwt(raw: string): string | null {
    let candidate = raw.trim()
    if (!candidate) return null

    if (candidate.includes('%')) {
      try {
        candidate = decodeURIComponent(candidate)
      } catch {
        // Keep raw string if malformed percent-encoding
      }
    }

    // Standard base64 to base64url normalization just in case '+' or '/' appear without padding
    const directMatch = JWT_THREE_PART_REGEX.exec(candidate)
    if (directMatch?.[0]) {
      return directMatch[0]
    }

    const normalizedBase64Url = candidate.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
    const fallbackMatch = JWT_THREE_PART_REGEX.exec(normalizedBase64Url)
    return fallbackMatch?.[0] ?? null
  }

  private isEncryptionAvailableSafe(): boolean {
    try {
      return safeStorage.isEncryptionAvailable()
    } catch {
      return false
    }
  }

  private async persistJwtSafely(jwt: string, status: WfmPresenceStatus): Promise<boolean> {
    if (!this.isEncryptionAvailableSafe()) {
      // Never write unencrypted tokens to disk if OS DPAPI is unavailable!
      return false
    }
    try {
      const encrypted = safeStorage.encryptString(jwt)
      const payload = EncryptedEnvelopeSchema.parse({
        v: 1,
        cipherBase64: encrypted.toString('base64'),
        preferredStatus: status,
        deviceId: this.deviceId
      })
      await mkdir(dirname(this.sessionFilePath), { recursive: true })
      const tmpPath = `${this.sessionFilePath}.tmp`
      await writeFile(tmpPath, JSON.stringify(payload, null, 2), 'utf-8')
      await rename(tmpPath, this.sessionFilePath)
      return true
    } catch {
      return false
    }
  }

  private async clearDiskSession(): Promise<void> {
    try {
      if (existsSync(this.sessionFilePath)) {
        await rm(this.sessionFilePath, { force: true })
      }
    } catch {
      // Ignore cleanup error
    }
  }

  private emitSessionChanged(): void {
    const snapshot = this.getSessionState()
    for (const listener of this.listeners) {
      listener(snapshot)
    }
  }
}
