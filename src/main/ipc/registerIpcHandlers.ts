import { app, clipboard, dialog, ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import { UserSettingsPatchSchema } from '@shared/schemas/settings.schema'
import { CommunityStatsQuerySchema } from '@shared/schemas/system.schema'
import {
  BeginDragPayloadSchema,
  BeginResizePayloadSchema,
  BooleanTogglePayloadSchema,
  ExternalUrlPayloadSchema,
  ZoomPayloadSchema
} from '@shared/schemas/window.schema'
import type { RateLimitedHttpClient } from '../infrastructure/http/RateLimitedHttpClient'
import type { CacheService } from '../services/CacheService'
import type { CommunityStatsService } from '../services/CommunityStatsService'
import type { FarmOverlayWindowService } from '../services/FarmOverlayWindowService'
import type { StorageService } from '../services/StorageService'
import type { WindowOverlayService } from '../services/WindowOverlayService'
import { assertTrustedAnyWindowSender, assertTrustedSender } from './security'

const ClipboardTextSchema = z.object({
  text: z.string().min(1).max(1024)
})

export interface MainServicesContainer {
  httpClient: RateLimitedHttpClient
  cacheService: CacheService
  communityStatsService: CommunityStatsService
  storageService: StorageService
  windowService: WindowOverlayService
  farmOverlayService: FarmOverlayWindowService
  onShortcutsUpdated: () => Promise<void>
  onAlertsConfigUpdated?: () => Promise<void>
}

export function registerIpcHandlers(services: MainServicesContainer): void {
  const {
    httpClient,
    cacheService,
    communityStatsService,
    storageService,
    windowService,
    farmOverlayService,
    onShortcutsUpdated,
    onAlertsConfigUpdated
  } = services

  const buildSystemStatus = () => ({
    appVersion: app.getVersion(),
    apiConnected: httpClient.isHealthy(),
    rateLimiterInWindow: httpClient.getActiveCountInWindow(),
    rateLimiterMaxPerSec: httpClient.getMaxPerSecond(),
    memoryCacheEntries: cacheService.getMemorySize(),
    userDataPath: app.getPath('userData')
  })

  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_STATUS, (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return buildSystemStatus()
  })

  ipcMain.handle(IPC_CHANNELS.SYSTEM_CLEAR_CACHE, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    await cacheService.clearAll()
    return buildSystemStatus()
  })

  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_COMMUNITY_STATS, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { forceRefresh } = CommunityStatsQuerySchema.parse(rawPayload ?? {})
    return communityStatsService.getStats(Boolean(forceRefresh))
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async (event) => {
    assertTrustedAnyWindowSender(event, [
      windowService.getMainWindow(),
      farmOverlayService.getOverlayWindow()
    ])
    return storageService.getSettings()
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_UPDATE, async (event, rawPatch: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const patch = UserSettingsPatchSchema.parse(rawPatch)
    const updated = await storageService.updateSettings(patch)
    if (
      patch.window?.globalShortcutsEnabled !== undefined ||
      patch.window?.shortcuts !== undefined ||
      patch.extensions?.codexFarmOverlay !== undefined ||
      patch.codexFarmOverlay?.shortcutToggle !== undefined
    ) {
      await onShortcutsUpdated()
    }
    if (patch.extensions !== undefined || patch.codexFarmOverlay !== undefined) {
      await farmOverlayService.syncWithSettings()
    }
    if (patch.appearance !== undefined) {
      windowService.syncAppearanceWithSettings()
      await farmOverlayService.notifyAppearanceChanged()
    }
    if (patch.window?.clickThroughWhenPinned !== undefined) {
      windowService.syncClickThroughWithSettings()
    }
    if (
      patch.audio?.scanIntervalSec !== undefined ||
      patch.priceAlerts !== undefined ||
      patch.worldRules !== undefined
    ) {
      await onAlertsConfigUpdated?.()
    }
    return updated
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_RESET, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const reset = await storageService.resetSettings()
    windowService.syncAppearanceWithSettings()
    await farmOverlayService.syncWithSettings()
    await farmOverlayService.notifyAppearanceChanged()
    await onShortcutsUpdated()
    return reset
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_EXPORT_JSON, async (event) => {
    const win = windowService.getMainWindow()
    assertTrustedSender(event, win)
    if (!win) return false
    const result = await dialog.showSaveDialog(win, {
      title: 'Exporter la configuration TennoFrame v2',
      defaultPath: 'tennoframe-config.json',
      filters: [{ name: 'Fichier JSON', extensions: ['json'] }]
    })
    if (result.canceled || !result.filePath) return false
    await storageService.exportToPath(result.filePath)
    return true
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_IMPORT_JSON, async (event) => {
    const win = windowService.getMainWindow()
    assertTrustedSender(event, win)
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
      title: 'Importer une configuration TennoFrame v2',
      properties: ['openFile'],
      filters: [{ name: 'Fichier JSON', extensions: ['json'] }]
    })
    const firstFile = result.filePaths[0]
    if (result.canceled || !firstFile) return null
    const imported = await storageService.importFromPath(firstFile)
    windowService.syncAppearanceWithSettings()
    await farmOverlayService.syncWithSettings()
    await farmOverlayService.notifyAppearanceChanged()
    await onShortcutsUpdated()
    return imported
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_GET_STATE, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return windowService.getState()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_BEGIN_DRAG, (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const payload = BeginDragPayloadSchema.parse(rawPayload)
    windowService.beginDrag(payload)
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_END_DRAG, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return windowService.endDrag()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_BEGIN_RESIZE, (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const payload = BeginResizePayloadSchema.parse(rawPayload)
    windowService.beginResize(payload)
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_END_RESIZE, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    await windowService.endResize()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    windowService.minimize()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_TOGGLE_MAXIMIZE, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return windowService.toggleMaximize()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    await windowService.requestClose()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_SET_ALWAYS_ON_TOP, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { enabled } = BooleanTogglePayloadSchema.parse(rawPayload)
    return windowService.setAlwaysOnTop(enabled)
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_SET_COMPACT_MODE, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { enabled } = BooleanTogglePayloadSchema.parse(rawPayload)
    return windowService.setCompactMode(enabled)
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_SET_CLICK_THROUGH, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { enabled } = BooleanTogglePayloadSchema.parse(rawPayload)
    return windowService.setClickThrough(enabled)
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_SET_ZOOM, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { zoomPercent } = ZoomPayloadSchema.parse(rawPayload)
    return windowService.setZoom(zoomPercent)
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_OPEN_EXTERNAL, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { url } = ExternalUrlPayloadSchema.parse(rawPayload)
    return windowService.openExternalSafe(url)
  })

  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_WRITE_TEXT, (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { text } = ClipboardTextSchema.parse(rawPayload)
    clipboard.writeText(text)
  })
}

