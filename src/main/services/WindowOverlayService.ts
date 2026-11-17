import { app, BrowserWindow, nativeTheme, screen, type Point, type Rectangle } from 'electron'
import { join } from 'node:path'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import type { UserSettings } from '@shared/schemas/settings.schema'
import type {
  BeginDragPayload,
  BeginResizePayload,
  ResizeDirection,
  SnapZone,
  WindowState
} from '@shared/schemas/window.schema'
import { openAllowedExternalHttpsUrl } from '../ipc/security'
import type { StorageService } from './StorageService'
import {
  computeResizedBounds,
  computeSnapBounds,
  detectSnapZone
} from './windowSnapGeometry'

function isLightHexColor(hex: string): boolean {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return false
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  return (Math.max(r, g, b) + Math.min(r, g, b)) / 2 > 0.55
}

interface ActiveDragSession {
  startCursor: Point
  startBounds: Rectangle
  ratioX: number
  offsetY: number
  moved: boolean
  lastX: number
  lastY: number
}

interface ActiveResizeSession {
  direction: ResizeDirection
  startCursor: Point
  startBounds: Rectangle
  moved: boolean
  lastBoundsKey: string
}

/**
 * Manages the hardened Electron BrowserWindow, Frameless custom chrome,
 * 120Hz DIP-accurate Window Drag + Aero Snap + Tear-off Unmaximize,
 * Always-on-Top ('screen-saver' level for borderless Warframe), and Compact Mode.
 */
export class WindowOverlayService {
  private mainWindow: BrowserWindow | null = null
  private isCompactMode = false
  private isClickThrough = false
  private isWorkAreaMaximized = false
  private isHalfSnapped = false
  private activeSnapPreview: SnapZone | null = null
  private preMaximizeBounds: Rectangle | null = null
  private interactionTimer: NodeJS.Timeout | null = null
  private dragSession: ActiveDragSession | null = null
  private resizeSession: ActiveResizeSession | null = null
  private isQuitting = false

  constructor(private readonly storageService: StorageService) {}

  public markQuitting(): void {
    this.isQuitting = true
    this.stopInteractiveLoop()
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  public async createMainWindow(iconPath: string): Promise<BrowserWindow> {
    const settings = await this.storageService.getSettings()
    const { desktopBounds, alwaysOnTop } = settings.window

    // Sur Windows 10/11 :
    // 1. `thickFrame: false` + `resizable: false` + `roundedCorners: false` retire `WS_THICKFRAME | WS_CAPTION`
    //    et désactive tout contour non-client DWM (les coins arrondis sont rendus en GPU dans `.wf-app-root`).
    // 2. Electron >= 37.3.1 (PR #47386) supprime l'appel erroné `DefWindowProc(WM_NCACTIVATE, FALSE, 0)`
    //    qui peignait une barre de titre blanche Win32 en haut derrière les fenêtres `transparent: true` au `blur`.
    const win = new BrowserWindow({
      title: 'TennoFrame',
      width: desktopBounds.width,
      height: desktopBounds.height,
      x: desktopBounds.x,
      y: desktopBounds.y,
      minWidth: 720,
      minHeight: 500,
      frame: false,
      transparent: true,
      thickFrame: false,
      roundedCorners: false,
      resizable: false,
      maximizable: false,
      hasShadow: false,
      autoHideMenuBar: true,
      show: false,
      icon: iconPath,
      backgroundColor: '#00000000',
      webPreferences: {
        preload: join(__dirname, '../preload/index.cjs'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        spellcheck: false
      }
    })

    win.on('page-title-updated', (event) => {
      event.preventDefault()
    })

    this.mainWindow = win
    this.applyAppearanceInternal(win, settings.appearance)
    this.applyAlwaysOnTopInternal(alwaysOnTop)
    win.webContents.setZoomFactor(settings.appearance.zoomPercent / 100)

    this.hardenNavigation(win)
    this.attachWindowListeners(win)

    win.once('ready-to-show', () => {
      win.show()
      this.emitStateChanged()
    })

    if (process.env['ELECTRON_RENDERER_URL']) {
      await win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      await win.loadFile(join(__dirname, '../renderer/index.html'))
    }

    if (!win.isDestroyed() && !win.isVisible()) {
      win.show()
      win.focus()
      this.emitStateChanged()
    }

    return win
  }

  public async getState(): Promise<WindowState> {
    const settings = await this.storageService.getSettings()
    return {
      isMaximized: this.isWorkAreaMaximized || (this.mainWindow?.isMaximized() ?? false),
      isSnapped: this.isHalfSnapped,
      snapPreview: this.activeSnapPreview,
      isAlwaysOnTop: this.mainWindow?.isAlwaysOnTop() ?? settings.window.alwaysOnTop,
      isCompactMode: this.isCompactMode,
      isClickThrough: this.isClickThrough,
      zoomPercent: settings.appearance.zoomPercent
    }
  }

  public minimize(): void {
    this.stopInteractiveLoop()
    this.mainWindow?.minimize()
  }

  public beginDrag(payload: BeginDragPayload): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed() || this.isClickThrough) return
    this.stopInteractiveLoop()

    const bounds = this.mainWindow.getBounds()
    const cursor = screen.getCursorScreenPoint()
    this.dragSession = {
      startCursor: cursor,
      startBounds: bounds,
      ratioX: payload.ratioX,
      offsetY: payload.offsetY,
      moved: false,
      lastX: bounds.x,
      lastY: bounds.y
    }

    this.interactionTimer = setInterval(() => this.tickDrag(), 8)
  }

  public async endDrag(): Promise<WindowState> {
    const session = this.dragSession
    const snapToApply = this.activeSnapPreview
    this.stopInteractiveLoop()

    if (session?.moved && this.mainWindow && !this.mainWindow.isDestroyed()) {
      if (snapToApply && !this.isCompactMode) {
        this.preMaximizeBounds = session.startBounds
        const cursor = screen.getCursorScreenPoint()
        const display = screen.getDisplayNearestPoint(cursor)
        const target = computeSnapBounds(snapToApply, display.workArea, 520, 420)
        this.isWorkAreaMaximized = snapToApply === 'maximize'
        this.isHalfSnapped = snapToApply !== 'maximize'
        this.mainWindow.setBounds(target)
      } else {
        await this.saveCurrentBounds(this.isCompactMode ? 'compact' : 'desktop')
      }
    }

    const state = await this.getState()
    this.emitStateChanged()
    return state
  }

  public beginResize(payload: BeginResizePayload): void {
    if (
      !this.mainWindow ||
      this.mainWindow.isDestroyed() ||
      this.isWorkAreaMaximized ||
      this.isClickThrough
    ) {
      return
    }
    this.stopInteractiveLoop()

    const bounds = this.mainWindow.getBounds()
    this.resizeSession = {
      direction: payload.direction,
      startCursor: screen.getCursorScreenPoint(),
      startBounds: bounds,
      moved: false,
      lastBoundsKey: `${bounds.x}:${bounds.y}:${bounds.width}:${bounds.height}`
    }

    this.interactionTimer = setInterval(() => this.tickResize(), 8)
  }

  public async endResize(): Promise<void> {
    const session = this.resizeSession
    this.stopInteractiveLoop()

    if (session?.moved) {
      if (this.isHalfSnapped) {
        this.isHalfSnapped = false
        this.emitStateChanged()
      }
      await this.saveCurrentBounds(this.isCompactMode ? 'compact' : 'desktop')
    }
  }

  public async toggleMaximize(): Promise<WindowState> {
    this.stopInteractiveLoop()
    if (this.mainWindow && !this.isCompactMode) {
      if (this.isWorkAreaMaximized || this.mainWindow.isMaximized()) {
        if (this.mainWindow.isMaximized()) {
          this.mainWindow.unmaximize()
        }
        this.isWorkAreaMaximized = false
        this.isHalfSnapped = false
        if (this.preMaximizeBounds) {
          this.mainWindow.setBounds(this.preMaximizeBounds)
        }
      } else {
        if (!this.isHalfSnapped) {
          this.preMaximizeBounds = this.mainWindow.getBounds()
        }
        const display = screen.getDisplayMatching(this.mainWindow.getBounds())
        this.isWorkAreaMaximized = true
        this.isHalfSnapped = false
        this.mainWindow.setBounds(display.workArea)
      }
    }
    const state = await this.getState()
    this.emitStateChanged()
    return state
  }

  public async requestClose(): Promise<void> {
    this.stopInteractiveLoop()
    if (!this.mainWindow) return
    const settings = await this.storageService.getSettings()
    if (settings.window.closeToTray && !this.isQuitting) {
      this.mainWindow.hide()
    } else {
      this.mainWindow.close()
    }
  }

  public toggleVisibility(): void {
    this.stopInteractiveLoop()
    if (!this.mainWindow) return
    if (this.mainWindow.isVisible() && this.mainWindow.isFocused()) {
      this.mainWindow.hide()
    } else {
      this.applyClickThroughInternal(false)
      if (this.mainWindow.isMinimized()) this.mainWindow.restore()
      this.mainWindow.show()
      this.mainWindow.focus()
      this.emitStateChanged()
    }
  }

  public async setClickThrough(enabled: boolean): Promise<WindowState> {
    this.stopInteractiveLoop()
    this.applyClickThroughInternal(enabled)
    const state = await this.getState()
    this.emitStateChanged()
    return state
  }

  public async toggleClickThroughShortcut(): Promise<WindowState> {
    this.stopInteractiveLoop()
    if (!this.mainWindow) return this.getState()

    if (!this.mainWindow.isVisible()) {
      this.applyClickThroughInternal(false)
      if (this.mainWindow.isMinimized()) this.mainWindow.restore()
      this.mainWindow.show()
      this.mainWindow.focus()
    } else if (this.isClickThrough) {
      this.applyClickThroughInternal(false)
      if (this.mainWindow.isMinimized()) this.mainWindow.restore()
      this.mainWindow.show()
      this.mainWindow.focus()
    } else if (this.mainWindow.isAlwaysOnTop()) {
      this.applyClickThroughInternal(true)
      this.mainWindow.blur()
    }

    const state = await this.getState()
    this.emitStateChanged()
    return state
  }

  public syncClickThroughWithSettings(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return
    const settings = this.storageService.getSettingsSync()
    if (!settings.window.clickThroughWhenPinned || !this.mainWindow.isAlwaysOnTop()) {
      this.applyClickThroughInternal(false)
    } else if (!this.mainWindow.isFocused()) {
      this.applyClickThroughInternal(true)
    }
    this.emitStateChanged()
  }

  public syncAppearanceWithSettings(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return
    const { appearance } = this.storageService.getSettingsSync()
    this.applyAppearanceInternal(this.mainWindow, appearance)
  }

  private applyAppearanceInternal(
    win: BrowserWindow,
    appearance: UserSettings['appearance']
  ): void {
    if (win.isDestroyed()) return
    nativeTheme.themeSource = isLightHexColor(appearance.primaryColor) ? 'light' : 'dark'
    win.setBackgroundColor('#00000000')
  }

  public async setAlwaysOnTop(enabled: boolean): Promise<WindowState> {
    this.applyAlwaysOnTopInternal(enabled)
    if (!enabled) {
      this.applyClickThroughInternal(false)
    }
    await this.storageService.updateSettings({ window: { alwaysOnTop: enabled } })
    const state = await this.getState()
    this.emitStateChanged()
    return state
  }

  public async setCompactMode(enabled: boolean): Promise<WindowState> {
    this.stopInteractiveLoop()
    if (!this.mainWindow || this.isCompactMode === enabled) {
      return this.getState()
    }

    const settings = await this.storageService.getSettings()
    if (this.isWorkAreaMaximized || this.isHalfSnapped || this.mainWindow.isMaximized()) {
      if (this.mainWindow.isMaximized()) {
        this.mainWindow.unmaximize()
      }
      this.isWorkAreaMaximized = false
      this.isHalfSnapped = false
      if (this.preMaximizeBounds) {
        this.mainWindow.setBounds(this.preMaximizeBounds)
      }
    }

    if (enabled) {
      await this.saveCurrentBounds('desktop')
      this.isCompactMode = true
      const cb = settings.window.compactBounds
      this.mainWindow.setBounds({
        width: cb.width,
        height: cb.height,
        ...(cb.x !== undefined && cb.y !== undefined ? { x: cb.x, y: cb.y } : {})
      })
      this.applyAlwaysOnTopInternal(true)
    } else {
      await this.saveCurrentBounds('compact')
      this.isCompactMode = false
      const db = settings.window.desktopBounds
      this.mainWindow.setBounds({
        width: db.width,
        height: db.height,
        ...(db.x !== undefined && db.y !== undefined ? { x: db.x, y: db.y } : {})
      })
      this.applyAlwaysOnTopInternal(settings.window.alwaysOnTop)
    }

    const state = await this.getState()
    this.emitStateChanged()
    return state
  }

  public async setZoom(zoomPercent: number): Promise<WindowState> {
    const clamped = Math.min(200, Math.max(50, Math.round(zoomPercent / 10) * 10))
    this.mainWindow?.webContents.setZoomFactor(clamped / 100)
    await this.storageService.updateSettings({ appearance: { zoomPercent: clamped } })
    const state = await this.getState()
    this.emitStateChanged()
    return state
  }

  public async openExternalSafe(rawUrl: string): Promise<boolean> {
    return openAllowedExternalHttpsUrl(rawUrl)
  }

  private tickDrag(): void {
    const win = this.mainWindow
    const session = this.dragSession
    if (!win || win.isDestroyed() || !session) {
      this.stopInteractiveLoop()
      return
    }

    const cursor = screen.getCursorScreenPoint()
    const dx = cursor.x - session.startCursor.x
    const dy = cursor.y - session.startCursor.y

    if (!session.moved) {
      if (Math.hypot(dx, dy) < 5) return
      session.moved = true

      // Tear-off : si la fenêtre était en plein écran ou ancrée, on la détache
      // immédiatement à sa taille flottante centrée proportionnellement sous le curseur.
      if (this.isWorkAreaMaximized || this.isHalfSnapped) {
        const fallback = this.storageService.getSettingsSync().window.desktopBounds
        const restore = this.preMaximizeBounds ?? {
          x: cursor.x - Math.round(fallback.width / 2),
          y: cursor.y - 18,
          width: fallback.width,
          height: fallback.height
        }
        const clampedRatio = Math.min(0.92, Math.max(0.08, session.ratioX))
        const clampedOffsetY = Math.min(34, Math.max(6, Math.round(session.offsetY)))
        const restoredBounds: Rectangle = {
          x: Math.round(cursor.x - restore.width * clampedRatio),
          y: Math.round(cursor.y - clampedOffsetY),
          width: restore.width,
          height: restore.height
        }
        session.startCursor = cursor
        session.startBounds = restoredBounds
        session.lastX = restoredBounds.x
        session.lastY = restoredBounds.y
        this.isWorkAreaMaximized = false
        this.isHalfSnapped = false
        win.setBounds(restoredBounds)
        this.emitStateChanged()
        return
      }
    }

    const nextX = Math.round(session.startBounds.x + (cursor.x - session.startCursor.x))
    const nextY = Math.round(session.startBounds.y + (cursor.y - session.startCursor.y))

    if (nextX !== session.lastX || nextY !== session.lastY) {
      session.lastX = nextX
      session.lastY = nextY
      win.setBounds({
        x: nextX,
        y: nextY,
        width: session.startBounds.width,
        height: session.startBounds.height
      })
    }

    if (!this.isCompactMode) {
      const allDisplays = screen.getAllDisplays()
      const currentDisplay = screen.getDisplayNearestPoint(cursor)
      const nextSnap = detectSnapZone(cursor, currentDisplay, allDisplays)
      if (nextSnap !== this.activeSnapPreview) {
        this.activeSnapPreview = nextSnap
        this.emitStateChanged()
      }
    }
  }

  private tickResize(): void {
    const win = this.mainWindow
    const session = this.resizeSession
    if (!win || win.isDestroyed() || !session) {
      this.stopInteractiveLoop()
      return
    }

    const cursor = screen.getCursorScreenPoint()
    const dx = cursor.x - session.startCursor.x
    const dy = cursor.y - session.startCursor.y
    if (!session.moved && Math.hypot(dx, dy) < 2) return
    session.moved = true

    const minW = this.isCompactMode ? 380 : 720
    const minH = this.isCompactMode ? 500 : 500
    const next = computeResizedBounds(session.direction, session.startBounds, dx, dy, minW, minH)
    const key = `${next.x}:${next.y}:${next.width}:${next.height}`
    if (key !== session.lastBoundsKey) {
      session.lastBoundsKey = key
      win.setBounds(next)
    }
  }

  private stopInteractiveLoop(): void {
    if (this.interactionTimer) {
      clearInterval(this.interactionTimer)
      this.interactionTimer = null
    }
    this.dragSession = null
    this.resizeSession = null
    if (this.activeSnapPreview !== null) {
      this.activeSnapPreview = null
      this.emitStateChanged()
    }
  }

  private applyAlwaysOnTopInternal(enabled: boolean): void {
    if (!this.mainWindow) return
    if (enabled) {
      this.mainWindow.setAlwaysOnTop(true, 'screen-saver')
    } else {
      this.mainWindow.setAlwaysOnTop(false)
      this.applyClickThroughInternal(false)
    }
  }

  private applyClickThroughInternal(enabled: boolean): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return
    const shouldEnable = enabled && this.mainWindow.isAlwaysOnTop()
    if (shouldEnable) {
      this.mainWindow.setIgnoreMouseEvents(true, { forward: true })
      this.isClickThrough = true
    } else {
      this.mainWindow.setIgnoreMouseEvents(false)
      this.isClickThrough = false
    }
  }

  private hardenNavigation(win: BrowserWindow): void {
    win.webContents.setWindowOpenHandler(({ url }) => {
      void this.openExternalSafe(url)
      return { action: 'deny' }
    })

    win.webContents.on('will-navigate', (event, targetUrl) => {
      const devUrl = process.env['ELECTRON_RENDERER_URL']
      if (devUrl && targetUrl.startsWith(devUrl)) {
        return
      }
      event.preventDefault()
    })
  }

  private attachWindowListeners(win: BrowserWindow): void {
    win.on('maximize', () => this.emitStateChanged())
    win.on('unmaximize', () => this.emitStateChanged())
    win.on('focus', () => {
      if (this.isClickThrough) {
        this.applyClickThroughInternal(false)
        this.emitStateChanged()
      }
    })
    win.on('blur', () => {
      this.stopInteractiveLoop()
      const settings = this.storageService.getSettingsSync()
      if (win.isAlwaysOnTop() && settings.window.clickThroughWhenPinned) {
        this.applyClickThroughInternal(true)
        this.emitStateChanged()
      }
    })
    win.on('close', (event) => {
      this.stopInteractiveLoop()
      const settings = this.storageService.getSettingsSync()
      if (app.isPackaged && settings.window.closeToTray && !this.isQuitting) {
        event.preventDefault()
        win.hide()
      }
    })
  }

  private async saveCurrentBounds(mode: 'desktop' | 'compact'): Promise<void> {
    if (
      !this.mainWindow ||
      this.isWorkAreaMaximized ||
      this.isHalfSnapped ||
      this.mainWindow.isMaximized() ||
      this.mainWindow.isMinimized()
    ) {
      return
    }
    const b = this.mainWindow.getBounds()
    if (mode === 'desktop') {
      await this.storageService.updateSettings({ window: { desktopBounds: b } })
    } else {
      await this.storageService.updateSettings({ window: { compactBounds: b } })
    }
  }

  private emitStateChanged(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return
    void this.getState().then((state) => {
      this.mainWindow?.webContents.send(IPC_CHANNELS.WINDOW_ON_STATE_CHANGED, state)
    })
  }
}
