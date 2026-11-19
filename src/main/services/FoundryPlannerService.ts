import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { z } from 'zod'
import type {
  FoundryProjectInput,
  FoundryState,
  FoundryUpdateOwnedInput
} from '@shared/schemas/pro-tools.schema'
import type { CodexRepository } from './CodexRepository'

const StoredFoundryProjectSchema = z.object({
  category: z.enum(['warframes', 'weapons']),
  id: z.string().min(1).max(140),
  addedAtIso: z.string()
})

const FoundryStorageFileSchema = z.object({
  projects: z.array(StoredFoundryProjectSchema).max(30).default([]),
  ownedByKey: z.record(z.string(), z.number().int().nonnegative()).default({})
})

type FoundryStorageFile = z.infer<typeof FoundryStorageFileSchema>

export class FoundryPlannerService {
  private readonly filePath: string
  private state: FoundryStorageFile | null = null

  constructor(
    userDataPath: string,
    private readonly codex: CodexRepository
  ) {
    this.filePath = join(userDataPath, 'foundry-planner.json')
  }

  private async ensureLoaded(): Promise<FoundryStorageFile> {
    if (this.state) return this.state
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8')
      const parsed = FoundryStorageFileSchema.safeParse(JSON.parse(raw))
      if (parsed.success) {
        this.state = parsed.data
        return this.state
      }
    } catch {
      // Fresh file
    }
    this.state = { projects: [], ownedByKey: {} }
    return this.state
  }

  private async persistAtomic(next: FoundryStorageFile): Promise<void> {
    await fs.mkdir(dirname(this.filePath), { recursive: true })
    const tmp = `${this.filePath}.tmp`
    await fs.writeFile(tmp, JSON.stringify(next, null, 2), 'utf-8')
    await fs.rename(tmp, this.filePath)
  }

  public async getState(): Promise<FoundryState> {
    const stored = await this.ensureLoaded()
    return this.codex.resolveFoundryBreakdown(stored.projects, stored.ownedByKey)
  }

  public async addProject(input: FoundryProjectInput): Promise<FoundryState> {
    const stored = await this.ensureLoaded()
    const exists = stored.projects.some(
      (p) => p.category === input.category && p.id === input.id
    )
    if (!exists) {
      const next: FoundryStorageFile = {
        ...stored,
        projects: [
          ...stored.projects,
          {
            category: input.category,
            id: input.id,
            addedAtIso: new Date().toISOString()
          }
        ].slice(-30)
      }
      this.state = next
      await this.persistAtomic(next)
    }
    return this.getState()
  }

  public async removeProject(projectKey: string): Promise<FoundryState> {
    const stored = await this.ensureLoaded()
    const next: FoundryStorageFile = {
      ...stored,
      projects: stored.projects.filter((p) => `${p.category}:${p.id}` !== projectKey)
    }
    this.state = next
    await this.persistAtomic(next)
    return this.getState()
  }

  public async setOwnedCount(input: FoundryUpdateOwnedInput): Promise<FoundryState> {
    const stored = await this.ensureLoaded()
    const nextOwned = { ...stored.ownedByKey }
    if (input.ownedCount <= 0) {
      delete nextOwned[input.resourceKey]
    } else {
      nextOwned[input.resourceKey] = input.ownedCount
    }
    const next: FoundryStorageFile = {
      ...stored,
      ownedByKey: nextOwned
    }
    this.state = next
    await this.persistAtomic(next)
    return this.getState()
  }

  public async clearProjects(): Promise<FoundryState> {
    const stored = await this.ensureLoaded()
    const next: FoundryStorageFile = {
      ...stored,
      projects: []
    }
    this.state = next
    await this.persistAtomic(next)
    return this.getState()
  }
}
