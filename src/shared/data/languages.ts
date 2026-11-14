export const APP_LANGUAGE_IDS = [
  'fr',
  'en',
  'de',
  'es',
  'it',
  'pt',
  'ru',
  'pl',
  'uk',
  'tr',
  'ja',
  'ko',
  'zh-hans',
  'zh-hant',
  'th'
] as const

export type WarframeLanguageId = (typeof APP_LANGUAGE_IDS)[number]

export interface WarframeLanguageMeta {
  readonly id: WarframeLanguageId
  readonly shortCode: string
  readonly nativeLabel: string
  readonly wfmHeader: string
  readonly wfstatCode: string
  readonly intlLocale: string
}

export const WARFRAME_LANGUAGES: readonly WarframeLanguageMeta[] = [
  { id: 'fr', shortCode: 'FR', nativeLabel: 'Français', wfmHeader: 'fr', wfstatCode: 'fr', intlLocale: 'fr-FR' },
  { id: 'en', shortCode: 'EN', nativeLabel: 'English', wfmHeader: 'en', wfstatCode: 'en', intlLocale: 'en-US' },
  { id: 'de', shortCode: 'DE', nativeLabel: 'Deutsch', wfmHeader: 'de', wfstatCode: 'de', intlLocale: 'de-DE' },
  { id: 'es', shortCode: 'ES', nativeLabel: 'Español', wfmHeader: 'es', wfstatCode: 'es', intlLocale: 'es-ES' },
  { id: 'it', shortCode: 'IT', nativeLabel: 'Italiano', wfmHeader: 'en', wfstatCode: 'it', intlLocale: 'it-IT' },
  { id: 'pt', shortCode: 'PT', nativeLabel: 'Português', wfmHeader: 'pt', wfstatCode: 'pt', intlLocale: 'pt-BR' },
  { id: 'ru', shortCode: 'RU', nativeLabel: 'Русский', wfmHeader: 'ru', wfstatCode: 'ru', intlLocale: 'ru-RU' },
  { id: 'pl', shortCode: 'PL', nativeLabel: 'Polski', wfmHeader: 'pl', wfstatCode: 'pl', intlLocale: 'pl-PL' },
  { id: 'uk', shortCode: 'UK', nativeLabel: 'Українська', wfmHeader: 'uk', wfstatCode: 'uk', intlLocale: 'uk-UA' },
  { id: 'tr', shortCode: 'TR', nativeLabel: 'Türkçe', wfmHeader: 'en', wfstatCode: 'tr', intlLocale: 'tr-TR' },
  { id: 'ja', shortCode: 'JA', nativeLabel: '日本語', wfmHeader: 'en', wfstatCode: 'ja', intlLocale: 'ja-JP' },
  { id: 'ko', shortCode: 'KO', nativeLabel: '한국어', wfmHeader: 'ko', wfstatCode: 'ko', intlLocale: 'ko-KR' },
  { id: 'zh-hans', shortCode: 'ZH', nativeLabel: '简体中文', wfmHeader: 'zh-hans', wfstatCode: 'zh', intlLocale: 'zh-CN' },
  { id: 'zh-hant', shortCode: 'TC', nativeLabel: '繁體中文', wfmHeader: 'zh-hant', wfstatCode: 'tc', intlLocale: 'zh-TW' },
  { id: 'th', shortCode: 'TH', nativeLabel: 'ไทย', wfmHeader: 'en', wfstatCode: 'th', intlLocale: 'th-TH' }
] as const

const LANGUAGE_BY_ID = new Map<WarframeLanguageId, WarframeLanguageMeta>(
  WARFRAME_LANGUAGES.map((item) => [item.id, item])
)

export const RECOMMENDED_WHISPER_LANGUAGE: WarframeLanguageId = 'en'

/**
 * `/w` whisper languages ordered with `en` (Recommended for universal WFM trading) first.
 */
export const WHISPER_LANGUAGES: readonly WarframeLanguageMeta[] = [
  ...WARFRAME_LANGUAGES.filter((l) => l.id === RECOMMENDED_WHISPER_LANGUAGE),
  ...WARFRAME_LANGUAGES.filter((l) => l.id !== RECOMMENDED_WHISPER_LANGUAGE)
]

const RECOMMENDED_LABELS: Record<WarframeLanguageId, string> = {
  fr: 'Recommandé',
  en: 'Recommended',
  de: 'Empfohlen',
  es: 'Recomendado',
  it: 'Consigliato',
  pt: 'Recomendado',
  ru: 'Рекомендуется',
  pl: 'Zalecane',
  uk: 'Рекомендовано',
  tr: 'Önerilen',
  ja: '推奨',
  ko: '권장',
  'zh-hans': '推荐',
  'zh-hant': '推薦',
  th: 'แนะนำ'
}

export function getRecommendedLabel(lang: WarframeLanguageId): string {
  return RECOMMENDED_LABELS[lang]
}

export function getLanguageMeta(lang: WarframeLanguageId): WarframeLanguageMeta {
  return LANGUAGE_BY_ID.get(lang) ?? WARFRAME_LANGUAGES[0]!
}

/**
 * Picks the localized Warframe Market string (`localized` populated with active WFM language)
 * or falls back cleanly to canonical English (`english`).
 */
export function pickMarketText(
  lang: WarframeLanguageId,
  localized: string | undefined | null,
  english: string | undefined | null
): string {
  const en = english ?? ''
  const loc = localized ?? ''
  if (lang === 'en') {
    return en || loc
  }
  return loc || en
}

/**
 * Picks the secondary subtitle for a Market item (English subtitle when viewing in another language).
 */
export function pickMarketAltText(
  lang: WarframeLanguageId,
  localized: string | undefined | null,
  english: string | undefined | null
): string {
  const en = english ?? ''
  const loc = localized ?? ''
  return lang === 'en' ? loc : en
}

export interface WhisperMessageInput {
  ingameName: string
  itemNameEn: string
  itemNameFr: string
  platinum: number
  rank?: number
  quantity?: number
  customCommandEn?: string
  customCommandFr?: string
}

export function formatWhisperMessage(
  draft: WhisperMessageInput,
  lang: WarframeLanguageId
): string {
  if (lang === 'fr' && draft.customCommandFr) return draft.customCommandFr
  if (draft.customCommandEn && lang !== 'fr') return draft.customCommandEn

  const itemName = lang === 'en' ? draft.itemNameEn : draft.itemNameFr || draft.itemNameEn
  const r = draft.rank
  const p = draft.platinum
  const u = draft.ingameName

  switch (lang) {
    case 'fr':
      return `/w ${u} Bonjour ! Je voudrais acheter : "${itemName}"${r !== undefined ? ` (rang ${r})` : ''} pour ${p} platinum. (warframe.market)`
    case 'de':
      return `/w ${u} Hallo! Ich möchte kaufen: "${itemName}"${r !== undefined ? ` (Rang ${r})` : ''} für ${p} Platin. (warframe.market)`
    case 'es':
      return `/w ${u} ¡Hola! Quiero comprar: "${itemName}"${r !== undefined ? ` (rango ${r})` : ''} por ${p} platino. (warframe.market)`
    case 'it':
      return `/w ${u} Ciao! Vorrei comprare: "${draft.itemNameEn}"${r !== undefined ? ` (grado ${r})` : ''} per ${p} platino. (warframe.market)`
    case 'pt':
      return `/w ${u} Olá! Eu quero comprar: "${itemName}"${r !== undefined ? ` (nível ${r})` : ''} por ${p} platinas. (warframe.market)`
    case 'ru':
      return `/w ${u} Привет! Хочу купить: "${itemName}"${r !== undefined ? ` (ранг ${r})` : ''} за ${p} платины. (warframe.market)`
    case 'pl':
      return `/w ${u} Cześć! Chcę kupić: "${itemName}"${r !== undefined ? ` (ranga ${r})` : ''} za ${p} platyny. (warframe.market)`
    case 'uk':
      return `/w ${u} Привіт! Хочу купити: "${itemName}"${r !== undefined ? ` (ранг ${r})` : ''} за ${p} платини. (warframe.market)`
    case 'tr':
      return `/w ${u} Merhaba! Satın almak istiyorum: "${draft.itemNameEn}"${r !== undefined ? ` (seviye ${r})` : ''} ${p} platin karşılığında. (warframe.market)`
    case 'ja':
      return `/w ${u} こんにちは！「${draft.itemNameEn}」${r !== undefined ? ` (ランク ${r})` : ''} を ${p} プラチナで購入したいです。(warframe.market)`
    case 'ko':
      return `/w ${u} 안녕하세요! "${itemName}"${r !== undefined ? ` (랭크 ${r})` : ''} 아이템을 ${p} 플래티넘에 구매하고 싶습니다. (warframe.market)`
    case 'zh-hans':
      return `/w ${u} 你好！我想购买：“${itemName}”${r !== undefined ? ` (等级 ${r})` : ''}，价格 ${p} 白金。(warframe.market)`
    case 'zh-hant':
      return `/w ${u} 你好！我想購買：「${itemName}」${r !== undefined ? ` (等級 ${r})` : ''}，價格 ${p} 白金。(warframe.market)`
    case 'th':
      return `/w ${u} สวัสดี! ฉันต้องการซื้อ: "${draft.itemNameEn}"${r !== undefined ? ` (ระดับ ${r})` : ''} ในราคา ${p} แพลทินัม (warframe.market)`
    case 'en':
    default:
      return `/w ${u} Hi! I want to buy: "${draft.itemNameEn}"${r !== undefined ? ` (rank ${r})` : ''} for ${p} platinum. (warframe.market)`
  }
}
