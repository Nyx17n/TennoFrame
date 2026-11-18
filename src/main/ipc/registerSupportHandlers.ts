import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import { SupportTicketInputSchema } from '@shared/schemas/support.schema'
import type { SupportService } from '../services/SupportService'
import type { WindowOverlayService } from '../services/WindowOverlayService'
import { assertTrustedSender } from './security'

export interface SupportHandlersDeps {
  supportService: SupportService
  windowService: WindowOverlayService
}

export function registerSupportHandlers({
  supportService,
  windowService
}: SupportHandlersDeps): void {
  ipcMain.handle(IPC_CHANNELS.SUPPORT_GET_STATUS, (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return supportService.getStatus()
  })

  ipcMain.handle(IPC_CHANNELS.SUPPORT_PREPARE_ATTACHMENT, (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return supportService.prepareAttachment(rawPayload)
  })

  ipcMain.handle(IPC_CHANNELS.SUPPORT_SEND_TICKET, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const parsed = SupportTicketInputSchema.parse(rawPayload)
    return supportService.sendTicket(parsed)
  })
}
