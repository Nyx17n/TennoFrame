import { z } from 'zod'
import { RawWfmOrderSchema } from './wfm-raw.schemas'

const nullToUndefined = <T>(v: T | null | undefined): T | undefined => (v === null ? undefined : v)

export const RawWfmMeDataSchema = z
  .object({
    id: z.string(),
    ingameName: z.string().nullish().transform((v) => v ?? ''),
    slug: z.string().nullish().transform((v) => v ?? ''),
    avatar: z.string().nullable().optional(),
    reputation: z.number().nullish().transform((v) => v ?? 0),
    masteryRank: z.number().int().nonnegative().nullish().transform(nullToUndefined),
    platform: z.string().nullish().transform((v) => v || 'pc'),
    crossplay: z.boolean().nullish().transform((v) => v ?? true),
    locale: z.string().nullish().transform((v) => v || 'fr'),
    verified: z.boolean().nullish().transform((v) => v ?? false),
    banned: z.boolean().nullish().transform((v) => v ?? false),
    about: z.string().nullable().optional(),
    aboutRaw: z.string().nullable().optional()
  })
  .passthrough()

export const RawWfmMeResponseSchema = z.object({
  data: RawWfmMeDataSchema
})

export const RawWfmSingleOrderResponseSchema = z.object({
  data: RawWfmOrderSchema
})

export const RawWfmMyOrdersResponseSchema = z.object({
  data: z.array(RawWfmOrderSchema)
})

export const RawWfmExtendedUserResponseSchema = z.object({
  data: z
    .object({
      id: z.string(),
      ingameName: z.string().nullish().transform((v) => v ?? ''),
      slug: z.string().nullish().transform((v) => v ?? ''),
      avatar: z.string().nullable().optional(),
      reputation: z.number().nullish().transform((v) => v ?? 0),
      masteryRank: z.number().int().nonnegative().nullish().transform(nullToUndefined),
      platform: z.string().nullish().transform((v) => v || 'pc'),
      crossplay: z.boolean().nullish().transform((v) => v ?? true),
      about: z.string().nullable().optional(),
      aboutRaw: z.string().nullable().optional()
    })
    .passthrough()
})

const RawV1ReviewEntrySchema = z
  .object({
    id: z.string().nullish().transform(nullToUndefined),
    _id: z.string().nullish().transform(nullToUndefined),
    text: z.string().nullish().transform((v) => v ?? ''),
    review_type: z.number().nullish().transform(nullToUndefined),
    date: z.string().nullish().transform(nullToUndefined),
    user_from: z
      .object({
        ingame_name: z.string().nullish().transform((v) => v || 'Tenno')
      })
      .passthrough()
      .nullish()
      .transform(nullToUndefined)
  })
  .passthrough()

export const RawWfmV1ReviewsResponseSchema = z.object({
  payload: z
    .object({
      reviews: z.array(RawV1ReviewEntrySchema).default([])
    })
    .passthrough()
})
