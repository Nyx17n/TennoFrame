import { z } from 'zod'
import rawChangelog from './changelog.json'

const RawChangelogReleaseSchema = z
  .object({
    version: z.string().min(1),
    date: z.string().min(1),
    title: z.string().min(1).optional(),
    badge: z.string().min(1).optional(),
    highlights: z.array(z.string().min(1)).readonly().optional(),
    titleFr: z.string().min(1).optional(),
    badgeFr: z.string().min(1).optional(),
    highlightsFr: z.array(z.string().min(1)).readonly().optional()
  })
  .transform((entry) => ({
    version: entry.version,
    date: entry.date,
    title: entry.title ?? entry.titleFr ?? `TennoFrame v${entry.version}`,
    badge: entry.badge ?? entry.badgeFr ?? `Release v${entry.version}`,
    highlights: entry.highlights ?? entry.highlightsFr ?? []
  }))

export interface ChangelogRelease {
  readonly version: string
  readonly date: string
  readonly title: string
  readonly badge: string
  readonly highlights: readonly string[]
}

export const CHANGELOG_RELEASES: readonly ChangelogRelease[] = z
  .array(RawChangelogReleaseSchema)
  .parse(rawChangelog)
