import { BrowserWindow, session, type Cookie } from 'electron'
import type { WfmSessionState, WfmSignInWebInput } from '@shared/schemas/wfm-account.schema'
import type { WfmAuthService } from './WfmAuthService'
import type { WindowOverlayService } from './WindowOverlayService'

const WFM_SIGNIN_URL = 'https://warframe.market/fr/auth/signin'
const EPHEMERAL_PARTITION = 'wfm-web-auth'

const ALLOWED_HTTPS_SUFFIXES = [
  'warframe.market',
  'warframe.com',
  'steamcommunity.com',
  'steampowered.com',
  'discord.com',
  'google.com',
  'accounts.google.com',
  'youtube.com',
  'live.com',
  'microsoftonline.com',
  'microsoft.com',
  'xboxlive.com',
  'playstation.com',
  'sonyentertainmentnetwork.com',
  'sony.com',
  'twitch.tv',
  'apple.com',
  'cloudflare.com'
] as const

function isAllowedAuthUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl)
    if (parsed.protocol !== 'https:') return false
    const host = parsed.hostname.toLowerCase()
    return ALLOWED_HTTPS_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`)
    )
  } catch {
    return false
  }
}

function buildCleanBrowserUserAgent(defaultUa: string): string {
  return defaultUa
    .replace(/\s+Electron\/[^\s]+/gi, '')
    .replace(/\s+TennoFrame\/[^\s]+/gi, '')
    .trim()
}

/**
 * Opens an isolated, hardened Electron `BrowserWindow` on `https://warframe.market/fr/auth/signin`
 * with an ephemeral in-memory partition (no preload, sandbox: true, contextIsolation: true).
 * Automatically captures the verified `JWT` upon login (via cookie changes, periodic inspection,
 * or outgoing WFM API Authorization headers), encrypts it via `safeStorage` (DPAPI),
 * wipes temporary web session RAM, and closes the login window without any manual copy-paste.
 */
export class WfmWebLoginService {
  private activeWindow: BrowserWindow | null = null
  private pendingFlow: Promise<WfmSessionState> | null = null

  constructor(
    private readonly wfmAuth: WfmAuthService,
    private readonly windowService: WindowOverlayService
  ) {}

  public dispose(): void {
    if (this.activeWindow && !this.activeWindow.isDestroyed()) {
      this.activeWindow.close()
    }
    this.activeWindow = null
  }

  public signInViaWebWindow(input: WfmSignInWebInput): Promise<WfmSessionState> {
    if (this.pendingFlow && this.activeWindow && !this.activeWindow.isDestroyed()) {
      if (this.activeWindow.isMinimized()) this.activeWindow.restore()
      this.activeWindow.focus()
      return this.pendingFlow
    }

    const flow = this.runWebSignInFlow(input).finally(() => {
      this.pendingFlow = null
    })
    this.pendingFlow = flow
    return flow
  }

  private async runWebSignInFlow(input: WfmSignInWebInput): Promise<WfmSessionState> {
    const authSession = session.fromPartition(EPHEMERAL_PARTITION, { cache: false })
    await authSession.clearStorageData().catch(() => undefined)
    authSession.setUserAgent(buildCleanBrowserUserAgent(authSession.getUserAgent()))

    const parentWin = this.windowService.getMainWindow()

    return new Promise<WfmSessionState>((resolve, reject) => {
      let settled = false
      let verifying = false
      let queuedCandidate: string | null = null
      const testedTokens = new Set<string>()

      const authWin = new BrowserWindow({
        width: 560,
        height: 740,
        minWidth: 420,
        minHeight: 560,
        ...(parentWin && !parentWin.isDestroyed() ? { parent: parentWin } : {}),
        modal: false,
        show: false,
        autoHideMenuBar: true,
        backgroundColor: '#0b1220',
        title: 'Connexion officielle Warframe Market — TennoFrame',
        webPreferences: {
          partition: EPHEMERAL_PARTITION,
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
          webSecurity: true,
          spellcheck: false
        }
      })

      this.activeWindow = authWin

      const tryVerifyCandidateToken = async (rawCandidate: string): Promise<void> => {
        const clean = this.wfmAuth.extractCleanJwt(rawCandidate)
        if (!clean || settled || testedTokens.has(clean)) {
          return
        }
        if (verifying) {
          queuedCandidate = clean
          return
        }

        testedTokens.add(clean)
        verifying = true
        try {
          const verifiedState = await this.wfmAuth.signInWithToken({
            jwtToken: clean,
            initialStatus: input.initialStatus
          })
          if (settled) return
          settled = true
          await cleanupSession()
          if (!authWin.isDestroyed()) {
            authWin.close()
          }
          if (parentWin && !parentWin.isDestroyed()) {
            parentWin.focus()
          }
          resolve(verifiedState)
        } catch {
          // Candidate token was anonymous/guest or not yet finalized; keep window open
        } finally {
          verifying = false
          if (!settled && queuedCandidate) {
            const next = queuedCandidate
            queuedCandidate = null
            void tryVerifyCandidateToken(next)
          }
        }
      }

      const inspectExistingCookies = async (): Promise<void> => {
        if (settled) return
        try {
          const cookies = await authSession.cookies.get({})
          for (const ck of cookies) {
            const domain = (ck.domain ?? '').toLowerCase().replace(/^\.+/, '')
            if (
              (domain === 'warframe.market' || domain.endsWith('.warframe.market')) &&
              ck.value
            ) {
              if (ck.name.toUpperCase() === 'JWT' || ck.value.split('.').length === 3) {
                await tryVerifyCandidateToken(ck.value)
              }
            }
          }
        } catch {
          // Ignore transient cookie query error
        }
      }

      const pollTimer = setInterval(() => {
        void inspectExistingCookies()
      }, 1200)

      const onCookieChanged = (
        _event: Electron.Event,
        cookie: Cookie,
        _cause: string,
        removed: boolean
      ): void => {
        if (removed || settled) return
        const domain = (cookie.domain ?? '').toLowerCase()
        if (
          domain.includes('warframe.market') &&
          (cookie.name.toUpperCase() === 'JWT' || cookie.value.split('.').length === 3)
        ) {
          void tryVerifyCandidateToken(cookie.value)
        }
      }

      authSession.cookies.on('changed', onCookieChanged)

      // Passive inspection of Authorization headers sent by warframe.market's SPA to api.warframe.market
      authSession.webRequest.onBeforeSendHeaders(
        { urls: ['https://api.warframe.market/*'] },
        (details, callback) => {
          if (!settled) {
            const authHeader =
              details.requestHeaders['Authorization'] ?? details.requestHeaders['authorization']
            if (typeof authHeader === 'string' && authHeader.length > 25) {
              void tryVerifyCandidateToken(authHeader)
            }
          }
          callback({ requestHeaders: details.requestHeaders })
        }
      )

      const cleanupSession = async (): Promise<void> => {
        clearInterval(pollTimer)
        authSession.cookies.removeListener('changed', onCookieChanged)
        authSession.webRequest.onBeforeSendHeaders(null)
        await authSession.clearStorageData().catch(() => undefined)
      }

      // Strict HTTPS + Official SSO provider navigation guard
      authWin.webContents.on('will-navigate', (event, targetUrl) => {
        if (!isAllowedAuthUrl(targetUrl)) {
          event.preventDefault()
        }
      })

      // Redirect legitimate SSO popups (Steam/Discord/Google) inside the same hardened window; block all others
      authWin.webContents.setWindowOpenHandler(({ url }) => {
        if (isAllowedAuthUrl(url) && !authWin.isDestroyed()) {
          void authWin.loadURL(url)
        }
        return { action: 'deny' }
      })

      authWin.webContents.on('did-navigate', () => {
        void inspectExistingCookies()
      })

      authWin.webContents.on('did-navigate-in-page', () => {
        void inspectExistingCookies()
      })

      authWin.once('ready-to-show', () => {
        if (!authWin.isDestroyed()) {
          authWin.show()
          authWin.focus()
        }
      })

      authWin.on('closed', () => {
        if (this.activeWindow === authWin) {
          this.activeWindow = null
        }
        if (!settled) {
          settled = true
          void cleanupSession()
          reject(new Error('Connexion annulée (fenêtre fermée).'))
        }
      })

      void authWin.loadURL(WFM_SIGNIN_URL).catch((err: unknown) => {
        if (!settled) {
          settled = true
          void cleanupSession()
          if (!authWin.isDestroyed()) authWin.close()
          reject(
            err instanceof Error
              ? err
              : new Error('Impossible de charger la page de connexion warframe.market.')
          )
        }
      })
    })
  }
}
