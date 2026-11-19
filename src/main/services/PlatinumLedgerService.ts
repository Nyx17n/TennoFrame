import { dialog, type BrowserWindow } from 'electron'
import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import {
  LedgerStateSchema,
  type AddLedgerEntryInput,
  type LedgerEntry,
  type LedgerState,
  type UpdateLedgerMetaInput
} from '@shared/schemas/pro-tools.schema'

function currentUtcDayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export class PlatinumLedgerService {
  private readonly filePath: string
  private state: LedgerState | null = null

  constructor(userDataPath: string) {
    this.filePath = join(userDataPath, 'platinum-ledger.json')
  }

  private async ensureLoaded(): Promise<LedgerState> {
    if (!this.state) {
      try {
        const raw = await fs.readFile(this.filePath, 'utf-8')
        const parsed = LedgerStateSchema.safeParse(JSON.parse(raw))
        this.state = parsed.success ? parsed.data : LedgerStateSchema.parse({})
      } catch {
        this.state = LedgerStateSchema.parse({})
      }
    }

    const today = currentUtcDayKey()
    if (this.state.dailyResetUtcDay !== today) {
      this.state = {
        ...this.state,
        dailyTradesUsed: 0,
        dailyResetUtcDay: today
      }
      await this.persistAtomic(this.state)
    }
    return this.state
  }

  private async persistAtomic(next: LedgerState): Promise<void> {
    await fs.mkdir(dirname(this.filePath), { recursive: true })
    const tmp = `${this.filePath}.tmp`
    await fs.writeFile(tmp, JSON.stringify(next, null, 2), 'utf-8')
    await fs.rename(tmp, this.filePath)
  }

  public async getState(): Promise<LedgerState> {
    return this.ensureLoaded()
  }

  public async addManualEntry(input: AddLedgerEntryInput): Promise<LedgerState> {
    const current = await this.ensureLoaded()
    const totalPlatinum = input.unitPlatinum * input.quantity
    const entry: LedgerEntry = {
      id: `ldg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      type: input.type,
      source: 'manual',
      itemSlug: input.itemSlug?.trim() ?? '',
      itemNameFr: input.itemName.trim(),
      itemNameEn: input.itemName.trim(),
      unitPlatinum: input.unitPlatinum,
      quantity: input.quantity,
      totalPlatinum,
      ...(input.rank !== undefined ? { rank: input.rank } : {}),
      counterparty: input.counterparty?.trim() ?? '',
      notes: input.notes?.trim() ?? '',
      createdAtIso: new Date().toISOString()
    }

    const nextTradesUsed = input.consumeDailyTrade
      ? Math.min(60, current.dailyTradesUsed + 1)
      : current.dailyTradesUsed

    const next: LedgerState = {
      ...current,
      dailyTradesUsed: nextTradesUsed,
      entries: [entry, ...current.entries].slice(0, 2000)
    }
    this.state = next
    await this.persistAtomic(next)
    return next
  }

  public async recordAutoWfmTrade(params: {
    type: 'sell' | 'buy'
    itemSlug: string
    itemNameFr: string
    itemNameEn: string
    unitPlatinum: number
    quantity: number
    rank?: number
  }): Promise<void> {
    const current = await this.ensureLoaded()
    const entry: LedgerEntry = {
      id: `wfm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      type: params.type,
      source: 'wfm-auto',
      itemSlug: params.itemSlug,
      itemNameFr: params.itemNameFr,
      itemNameEn: params.itemNameEn,
      unitPlatinum: params.unitPlatinum,
      quantity: params.quantity,
      totalPlatinum: params.unitPlatinum * params.quantity,
      ...(params.rank !== undefined ? { rank: params.rank } : {}),
      counterparty: 'Warframe Market',
      notes: 'Synchronisé automatiquement depuis Mon Profil WFM',
      createdAtIso: new Date().toISOString()
    }

    const next: LedgerState = {
      ...current,
      dailyTradesUsed: Math.min(60, current.dailyTradesUsed + 1),
      entries: [entry, ...current.entries].slice(0, 2000)
    }
    this.state = next
    await this.persistAtomic(next)
  }

  public async deleteEntry(entryId: string): Promise<LedgerState> {
    const current = await this.ensureLoaded()
    const next: LedgerState = {
      ...current,
      entries: current.entries.filter((e) => e.id !== entryId)
    }
    this.state = next
    await this.persistAtomic(next)
    return next
  }

  public async updateMeta(patch: UpdateLedgerMetaInput): Promise<LedgerState> {
    const current = await this.ensureLoaded()
    const next: LedgerState = {
      ...current,
      masteryRank: patch.masteryRank ?? current.masteryRank,
      dailyTradesUsed: patch.dailyTradesUsed ?? current.dailyTradesUsed,
      goal: {
        label: patch.goalLabel ?? current.goal.label,
        targetPlatinum: patch.goalTargetPlatinum ?? current.goal.targetPlatinum
      }
    }
    this.state = next
    await this.persistAtomic(next)
    return next
  }

  public async exportCsv(parentWindow: BrowserWindow | null): Promise<boolean> {
    const current = await this.ensureLoaded()
    const dialogOpts = {
      title: 'Exporter le Livre de Comptes Platinum (CSV)',
      defaultPath: `tennoframe-platinum-ledger-${currentUtcDayKey()}.csv`,
      filters: [{ name: 'CSV Spreadsheet', extensions: ['csv'] }]
    }
    const res = parentWindow
      ? await dialog.showSaveDialog(parentWindow, dialogOpts)
      : await dialog.showSaveDialog(dialogOpts)

    if (res.canceled || !res.filePath) return false

    const escapeCsv = (val: string | number): string => {
      const s = String(val)
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }

    const header = [
      'DateISO',
      'Type',
      'Source',
      'ItemName',
      'ItemSlug',
      'Rank',
      'Quantity',
      'UnitPlatinum',
      'SignedPlatinum',
      'Counterparty',
      'Notes'
    ].join(',')

    const lines = current.entries.map((e) =>
      [
        escapeCsv(e.createdAtIso),
        escapeCsv(e.type),
        escapeCsv(e.source),
        escapeCsv(e.itemNameFr),
        escapeCsv(e.itemSlug),
        escapeCsv(e.rank ?? ''),
        escapeCsv(e.quantity),
        escapeCsv(e.unitPlatinum),
        escapeCsv(e.type === 'sell' ? e.totalPlatinum : -e.totalPlatinum),
        escapeCsv(e.counterparty),
        escapeCsv(e.notes)
      ].join(',')
    )

    await fs.writeFile(res.filePath, `\uFEFF${[header, ...lines].join('\r\n')}`, 'utf-8')
    return true
  }
}
