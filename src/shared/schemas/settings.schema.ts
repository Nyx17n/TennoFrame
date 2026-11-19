import { z } from 'zod'
import { APP_LANGUAGE_IDS } from '../data/languages'
import { WORLD_RULES_MAX } from '../data/world-rule-options'
import { PriceSniperRuleSchema, WorldAlertTogglesSchema } from './alerts.schema'
import {
  CodexFarmOverlayPatchSchema,
  CodexFarmOverlaySettingsSchema,
  ExtensionsSettingsSchema
} from './extensions.schema'
import { TabsSessionSchema } from './navigation.schema'
import { CartItemEntrySchema } from './tools.schema'
import { WindowBoundsSchema } from './window.schema'
import { WorldAlertRuleSchema } from './world-rules.schema'

export const HexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid 6-digit hex color')

export const ThemePresetIdSchema = z.enum([
  'dark',
  'light',
  'full-black',
  'full-white',
  'blue-dark',
  'blue-light',
  'cyan-dark',
  'cyan-light',
  'green-dark',
  'green-light',
  'yellow-dark',
  'yellow-light',
  'red-dark',
  'red-light',
  'orange-dark',
  'orange-light',
  'purple-dark',
  'purple-light',
  'pink-dark',
  'pink-light',
  'custom'
])

export type ThemePresetId = z.infer<typeof ThemePresetIdSchema>

export const PlatformSchema = z.enum(['pc', 'ps4', 'xbox', 'switch', 'mobile'])
export type MarketPlatform = z.infer<typeof PlatformSchema>

export const AppLanguageSchema = z.enum(APP_LANGUAGE_IDS)
export type AppLanguage = z.infer<typeof AppLanguageSchema>

export const SoundChoiceSchema = z.enum(['classic', 'bell'])
export type SoundChoice = z.infer<typeof SoundChoiceSchema>

export const SellerStatusFilterSchema = z.enum(['ingame', 'online', 'all'])

export const GlobalShortcutsMapSchema = z.object({
  toggleOverlay: z.string().min(1).max(64).default('Alt+Shift+W'),
  toggleCompact: z.string().min(1).max(64).default('Alt+M'),
  toggleAlwaysOnTop: z.string().min(1).max(64).default('Alt+P'),
  toggleClickThrough: z.string().min(1).max(64).default('Alt+G')
})

export const CatalogLayoutModeSchema = z.enum(['square', 'rect', 'list'])
export type CatalogLayoutMode = z.infer<typeof CatalogLayoutModeSchema>

export const CatalogCardSizeSchema = z.enum(['sm', 'md', 'lg'])
export type CatalogCardSize = z.infer<typeof CatalogCardSizeSchema>

export const AnimationLevelSchema = z.enum(['full', 'reduced', 'off'])
export type AnimationLevel = z.infer<typeof AnimationLevelSchema>

export const BackgroundGradientStyleSchema = z.enum([
  'none',
  'aurora-top',
  'diagonal',
  'dual-corners',
  'radial-center',
  'horizon-bottom',
  'mesh-nebula',
  'vertical-split'
])
export type BackgroundGradientStyle = z.infer<typeof BackgroundGradientStyleSchema>

export const BackgroundGradientColorModeSchema = z.enum(['theme-accent', 'custom'])
export type BackgroundGradientColorMode = z.infer<typeof BackgroundGradientColorModeSchema>

export const BackgroundGradientSettingsSchema = z.object({
  style: BackgroundGradientStyleSchema.default('none'),
  colorMode: BackgroundGradientColorModeSchema.default('theme-accent'),
  customColorHex: HexColorSchema.default('#7c3aed'),
  customSecondaryHex: HexColorSchema.default('#06b6d4'),
  intensityPercent: z.number().int().min(5).max(65).default(26),
  angleDeg: z.number().int().min(0).max(360).default(135)
})
export type BackgroundGradientSettings = z.infer<typeof BackgroundGradientSettingsSchema>

export const DEFAULT_BACKGROUND_GRADIENT: BackgroundGradientSettings =
  BackgroundGradientSettingsSchema.parse({})

export const CompactTimerKeySchema = z.enum([
  'cetus',
  'vallis',
  'cambion',
  'zariman',
  'duviri',
  'baro',
  'arbitration',
  'sortie',
  'daily-reset'
])
export type CompactTimerKey = z.infer<typeof CompactTimerKeySchema>
export const COMPACT_TIMERS_MAX_PINNED = 6

export const GLASS_OPACITY_MIN = 20
export const GLASS_OPACITY_MAX = 85
export const GLASS_OPACITY_DEFAULT = 48

export const GlassStyleSchema = z.enum([
  'liquid-glass',
  'simple',
  'medieval',
  'orokin',
  'cephalon',
  'pom2-1999'
])
export type GlassStyle = z.infer<typeof GlassStyleSchema>

export const FontFamilyIdSchema = z.enum([
  'auto',
  'system',
  'inter',
  'roboto',
  'poppins',
  'montserrat',
  'rajdhani',
  'orbitron',
  'medieval',
  'georgia',
  'jetbrains-mono',
  'comic'
])
export type FontFamilyId = z.infer<typeof FontFamilyIdSchema>

export const TabsPositionSchema = z.enum(['top', 'sidebar-left'])
export type TabsPosition = z.infer<typeof TabsPositionSchema>

export const BookmarksPositionSchema = z.enum(['top', 'left', 'right'])
export type BookmarksPosition = z.infer<typeof BookmarksPositionSchema>

export const CornerRadiusStyleSchema = z.enum(['auto', 'sharp', 'subtle', 'rounded', 'pill'])
export type CornerRadiusStyle = z.infer<typeof CornerRadiusStyleSchema>

export const UiDensitySchema = z.enum(['compact', 'comfortable', 'spacious'])
export type UiDensity = z.infer<typeof UiDensitySchema>

export const NewTabTargetSchema = z.enum([
  'speed-dial',
  'market-home',
  'hub',
  'codex-home',
  'wfm-account'
])
export type NewTabTarget = z.infer<typeof NewTabTargetSchema>

export const BOOKMARK_ITEM_IDS = [
  'market-home',
  'market-favorites',
  'market-cart',
  'market-recent',
  'codex-home',
  'builds',
  'foundry',
  'profit-scanner',
  'market-ducats',
  'market-rivens',
  'platinum-ledger',
  'wfm-account',
  'browser-history'
] as const

export const BookmarkItemIdSchema = z.enum(BOOKMARK_ITEM_IDS)
export type BookmarkItemId = z.infer<typeof BookmarkItemIdSchema>

export function normalizeBookmarksOrder(saved: readonly BookmarkItemId[] | undefined): BookmarkItemId[] {
  const seen = new Set<BookmarkItemId>()
  const result: BookmarkItemId[] = []
  for (const id of saved ?? []) {
    if ((BOOKMARK_ITEM_IDS as readonly string[]).includes(id) && !seen.has(id)) {
      seen.add(id)
      result.push(id)
    }
  }
  for (const defId of BOOKMARK_ITEM_IDS) {
    if (!seen.has(defId)) {
      seen.add(defId)
      result.push(defId)
    }
  }
  return result
}

export const CompactTimersSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  showOnDesktop: z.boolean().default(false),
  collapsed: z.boolean().default(false),
  pinned: z
    .array(CompactTimerKeySchema)
    .max(COMPACT_TIMERS_MAX_PINNED)
    .refine((keys) => new Set(keys).size === keys.length, 'Minuteur en double')
    .default(['cetus', 'vallis', 'cambion', 'baro'])
})
export type CompactTimersSettings = z.infer<typeof CompactTimersSettingsSchema>

export const UserSettingsSchema = z.object({
  appearance: z.object({
    preset: ThemePresetIdSchema.default('dark'),
    primaryColor: HexColorSchema.default('#0f161d'),
    secondaryColor: HexColorSchema.default('#26b9d1'),
    glowEnabled: z.boolean().default(true),
    glassModeEnabled: z.boolean().default(false),
    glassStyle: GlassStyleSchema.default('liquid-glass'),
    glassDesktopBackdropEnabled: z.boolean().default(true),
    glassOpacityPercent: z
      .number()
      .int()
      .min(GLASS_OPACITY_MIN)
      .max(GLASS_OPACITY_MAX)
      .default(GLASS_OPACITY_DEFAULT),
    fontFamily: FontFamilyIdSchema.default('auto'),
    tabsPosition: TabsPositionSchema.default('top'),
    sidebarCollapsed: z.boolean().default(false),
    cornerRadius: CornerRadiusStyleSchema.default('auto'),
    uiDensity: UiDensitySchema.default('comfortable'),
    newTabTarget: NewTabTargetSchema.default('market-home'),
    bookmarksBarVisible: z.boolean().default(true),
    bookmarksPosition: BookmarksPositionSchema.default('top'),
    bookmarksIconsOnly: z.boolean().default(false),
    bookmarksExpandOnHover: z.boolean().default(false),
    bookmarksOrder: z.array(BookmarkItemIdSchema).max(30).default([...BOOKMARK_ITEM_IDS]),
    hiddenBookmarks: z.array(BookmarkItemIdSchema).max(30).default([]),
    startupAnimationEnabled: z.boolean().default(true),
    animationLevel: AnimationLevelSchema.default('full'),
    respectOsReducedMotion: z.boolean().default(true),
    catalogLayoutMode: CatalogLayoutModeSchema.default('rect'),
    catalogCardSize: CatalogCardSizeSchema.default('md'),
    backgroundGradient: BackgroundGradientSettingsSchema.default({}),
    compactTimers: CompactTimersSettingsSchema.default({}),
    zoomPercent: z.number().int().min(50).max(200).default(100)
  }),
  audio: z.object({
    soundEnabled: z.boolean().default(true),
    soundChoice: SoundChoiceSchema.default('classic'),
    volumePercent: z.number().int().min(0).max(100).default(80),
    repeatAlerts: z.boolean().default(true),
    scanIntervalSec: z.number().int().min(15).max(3600).default(30),
    nativeOsNotifications: z.boolean().default(true),
    actionNotificationsEnabled: z.boolean().default(true)
  }),
  window: z.object({
    closeToTray: z.boolean().default(true),
    alwaysOnTop: z.boolean().default(false),
    clickThroughWhenPinned: z.boolean().default(true),
    globalShortcutsEnabled: z.boolean().default(true),
    shortcuts: GlobalShortcutsMapSchema.default({}),
    desktopBounds: WindowBoundsSchema.default({ width: 1440, height: 900 }),
    compactBounds: WindowBoundsSchema.default({ width: 460, height: 660 })
  }),
  market: z.object({
    platform: PlatformSchema.default('pc'),
    crossplay: z.boolean().default(true),
    language: AppLanguageSchema.default('fr'),
    whisperLanguage: AppLanguageSchema.default('en'),
    defaultSellerStatus: SellerStatusFilterSchema.default('ingame')
  }),
  favorites: z.array(z.string().min(1).max(160)).max(300).default([]),
  cart: z.array(CartItemEntrySchema).max(50).default([]),
  priceAlerts: z.array(PriceSniperRuleSchema).max(40).default([]),
  worldAlerts: WorldAlertTogglesSchema.default({}),
  worldRules: z.array(WorldAlertRuleSchema).max(WORLD_RULES_MAX, `${WORLD_RULES_MAX} règles maximum`).default([]),
  extensions: ExtensionsSettingsSchema.default({}),
  codexFarmOverlay: CodexFarmOverlaySettingsSchema.default({}),
  session: TabsSessionSchema.default({})
})

export type UserSettings = z.infer<typeof UserSettingsSchema>

export const UserSettingsPatchSchema = UserSettingsSchema.deepPartial().extend({
  extensions: ExtensionsSettingsSchema.partial().optional(),
  codexFarmOverlay: CodexFarmOverlayPatchSchema.optional()
})
export type UserSettingsPatch = z.infer<typeof UserSettingsPatchSchema>

export const DEFAULT_USER_SETTINGS: UserSettings = UserSettingsSchema.parse({
  appearance: {},
  audio: {},
  window: {},
  market: {},
  favorites: [],
  cart: [],
  priceAlerts: [],
  worldAlerts: {},
  worldRules: [],
  extensions: {},
  codexFarmOverlay: {},
  session: {}
})

