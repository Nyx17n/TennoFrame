import { z } from 'zod'

const RawI18nEntrySchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    wikiLink: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    thumb: z.string().nullable().optional()
  })
  .passthrough()

export const RawWfmCatalogResponseSchema = z.object({
  data: z.array(
    z
      .object({
        id: z.string(),
        slug: z.string(),
        tags: z.array(z.string()).default([]),
        maxRank: z.number().int().nonnegative().optional(),
        ducats: z.number().int().nonnegative().optional(),
        subtypes: z.array(z.string()).optional(),
        maxAmberStars: z.number().int().nonnegative().optional(),
        maxCyanStars: z.number().int().nonnegative().optional(),
        bulkTradable: z.boolean().optional(),
        i18n: z.record(z.string(), RawI18nEntrySchema).optional()
      })
      .passthrough()
  )
})

export const RawWfmFullItemSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    tags: z.array(z.string()).default([]),
    setRoot: z.boolean().optional(),
    quantityInSet: z.number().int().positive().optional(),
    ducats: z.number().int().nonnegative().optional(),
    reqMasteryRank: z.number().int().nonnegative().optional(),
    tradingTax: z.number().int().nonnegative().optional(),
    maxRank: z.number().int().nonnegative().optional(),
    subtypes: z.array(z.string()).optional(),
    maxAmberStars: z.number().int().nonnegative().optional(),
    maxCyanStars: z.number().int().nonnegative().optional(),
    bulkTradable: z.boolean().optional(),
    i18n: z.record(z.string(), RawI18nEntrySchema).optional()
  })
  .passthrough()

export const RawWfmSetResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    items: z.array(RawWfmFullItemSchema)
  })
})

export const RawWfmUserSchema = z
  .object({
    id: z.string(),
    ingameName: z.string(),
    slug: z.string(),
    avatar: z.string().nullable().optional(),
    reputation: z.number().nullish().transform((v) => v ?? 0),
    masteryRank: z.number().int().nonnegative().nullish().transform((v) => v ?? undefined),
    platform: z.string().nullish().transform((v) => v || 'pc'),
    crossplay: z.boolean().nullish().transform((v) => v ?? true),
    locale: z.string().nullish().transform((v) => v ?? undefined),
    verified: z.boolean().nullish().transform((v) => v ?? undefined),
    about: z.string().nullable().optional(),
    aboutRaw: z.string().nullable().optional(),
    status: z.enum(['ingame', 'online', 'offline']).catch('offline')
  })
  .passthrough()

export const RawWfmOrderSchema = z
  .object({
    id: z.string(),
    type: z.enum(['sell', 'buy']),
    platinum: z.number().nonnegative(),
    quantity: z.number().int().nonnegative().default(1),
    perTrade: z.number().int().nonnegative().nullish().transform((v) => v ?? undefined),
    rank: z.number().int().nonnegative().nullish().transform((v) => v ?? undefined),
    subtype: z.string().nullish().transform((v) => v ?? undefined),
    amberStars: z.number().int().nonnegative().nullish().transform((v) => v ?? undefined),
    cyanStars: z.number().int().nonnegative().nullish().transform((v) => v ?? undefined),
    visible: z.boolean().nullish().transform((v) => v ?? true),
    createdAt: z.string().nullish().transform((v) => v ?? ''),
    updatedAt: z.string().nullish().transform((v) => v ?? ''),
    itemId: z.string(),
    user: RawWfmUserSchema.nullish().transform((v) => v ?? undefined)
  })
  .passthrough()

export const RawWfmOrdersResponseSchema = z.object({
  data: z.array(RawWfmOrderSchema)
})

export const RawWfmUserProfileResponseSchema = z.object({
  data: RawWfmUserSchema
})

const RawV1StatPointSchema = z
  .object({
    datetime: z.string(),
    volume: z.number().nonnegative().default(0),
    min_price: z.number().nonnegative().default(0),
    max_price: z.number().nonnegative().default(0),
    avg_price: z.number().nonnegative().default(0),
    median: z.number().nonnegative().default(0)
  })
  .passthrough()

export const RawWfmV1StatsResponseSchema = z.object({
  payload: z.object({
    statistics_closed: z
      .object({
        '48hours': z.array(RawV1StatPointSchema).default([]),
        '90days': z.array(RawV1StatPointSchema).default([])
      })
      .default({ '48hours': [], '90days': [] })
  })
})

