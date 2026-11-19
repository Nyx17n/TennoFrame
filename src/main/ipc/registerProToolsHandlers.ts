import { ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import {
  AddLedgerEntryInputSchema,
  FoundryProjectInputSchema,
  FoundryUpdateOwnedInputSchema,
  ProfitScanRequestSchema,
  RivenGradeInputSchema,
  SavedBuildSchema,
  UpdateLedgerMetaInputSchema
} from '@shared/schemas/pro-tools.schema'
import type { BuildsService } from '../services/BuildsService'
import type { CodexRepository } from '../services/CodexRepository'
import type { FoundryPlannerService } from '../services/FoundryPlannerService'
import type { PlatinumLedgerService } from '../services/PlatinumLedgerService'
import type { ProfitScannerService } from '../services/ProfitScannerService'
import type { RivenGraderService } from '../services/RivenGraderService'
import type { WindowOverlayService } from '../services/WindowOverlayService'
import { assertTrustedSender } from './security'

const DeleteByIdPayloadSchema = z.object({
  id: z.string().trim().min(1).max(160)
})

const BuildPriceCheckPayloadSchema = z.object({
  buildId: z.string().trim().min(1).max(80),
  forceRefresh: z.boolean().optional()
})

export function registerProToolsHandlers(deps: {
  windowService: WindowOverlayService
  profitScanner: ProfitScannerService
  ledgerService: PlatinumLedgerService
  rivenGrader: RivenGraderService
  codexRepository: CodexRepository
  buildsService: BuildsService
  foundryPlanner: FoundryPlannerService
}): void {
  const {
    windowService,
    profitScanner,
    ledgerService,
    rivenGrader,
    codexRepository,
    buildsService,
    foundryPlanner
  } = deps

  ipcMain.handle(IPC_CHANNELS.PRO_PROFIT_SCAN, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const input = ProfitScanRequestSchema.parse(rawPayload)
    return profitScanner.scan(input)
  })

  ipcMain.handle(IPC_CHANNELS.PRO_LEDGER_GET, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return ledgerService.getState()
  })

  ipcMain.handle(IPC_CHANNELS.PRO_LEDGER_ADD_ENTRY, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const input = AddLedgerEntryInputSchema.parse(rawPayload)
    return ledgerService.addManualEntry(input)
  })

  ipcMain.handle(IPC_CHANNELS.PRO_LEDGER_DELETE_ENTRY, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { id } = DeleteByIdPayloadSchema.parse(rawPayload)
    return ledgerService.deleteEntry(id)
  })

  ipcMain.handle(IPC_CHANNELS.PRO_LEDGER_UPDATE_META, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const input = UpdateLedgerMetaInputSchema.parse(rawPayload)
    return ledgerService.updateMeta(input)
  })

  ipcMain.handle(IPC_CHANNELS.PRO_LEDGER_EXPORT_CSV, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return ledgerService.exportCsv(windowService.getMainWindow())
  })

  ipcMain.handle(IPC_CHANNELS.PRO_RIVEN_GRADE, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const input = RivenGradeInputSchema.parse(rawPayload)
    return rivenGrader.gradeRiven(input)
  })

  ipcMain.handle(IPC_CHANNELS.PRO_BUILDS_GET_CATALOG, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return codexRepository.getBuildStudioCatalog()
  })

  ipcMain.handle(IPC_CHANNELS.PRO_BUILDS_LIST, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return buildsService.listBuilds()
  })

  ipcMain.handle(IPC_CHANNELS.PRO_BUILDS_SAVE, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const build = SavedBuildSchema.parse(rawPayload)
    return buildsService.saveBuild(build)
  })

  ipcMain.handle(IPC_CHANNELS.PRO_BUILDS_DELETE, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { id } = DeleteByIdPayloadSchema.parse(rawPayload)
    return buildsService.deleteBuild(id)
  })

  ipcMain.handle(IPC_CHANNELS.PRO_BUILDS_PRICE_CHECK, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { buildId, forceRefresh } = BuildPriceCheckPayloadSchema.parse(rawPayload)
    return buildsService.priceCheckBuild(buildId, Boolean(forceRefresh))
  })

  ipcMain.handle(IPC_CHANNELS.PRO_FOUNDRY_GET, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return foundryPlanner.getState()
  })

  ipcMain.handle(IPC_CHANNELS.PRO_FOUNDRY_ADD_PROJECT, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const input = FoundryProjectInputSchema.parse(rawPayload)
    return foundryPlanner.addProject(input)
  })

  ipcMain.handle(IPC_CHANNELS.PRO_FOUNDRY_REMOVE_PROJECT, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const { id } = DeleteByIdPayloadSchema.parse(rawPayload)
    return foundryPlanner.removeProject(id)
  })

  ipcMain.handle(IPC_CHANNELS.PRO_FOUNDRY_SET_OWNED, async (event, rawPayload: unknown) => {
    assertTrustedSender(event, windowService.getMainWindow())
    const input = FoundryUpdateOwnedInputSchema.parse(rawPayload)
    return foundryPlanner.setOwnedCount(input)
  })

  ipcMain.handle(IPC_CHANNELS.PRO_FOUNDRY_CLEAR, async (event) => {
    assertTrustedSender(event, windowService.getMainWindow())
    return foundryPlanner.clearProjects()
  })
}
