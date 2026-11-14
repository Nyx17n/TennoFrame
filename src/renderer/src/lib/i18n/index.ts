import type { AppLanguage } from '@shared/schemas/settings.schema'
import { useAppStore } from '@/stores/useAppStore'
import { DE_MESSAGES, ES_MESSAGES } from './locales-de-es'
import { EN_MESSAGES, FR_MESSAGES } from './locales-fr-en'
import { IT_MESSAGES, PT_MESSAGES } from './locales-it-pt'
import { JA_MESSAGES, KO_MESSAGES } from './locales-ja-ko'
import { PL_MESSAGES, RU_MESSAGES } from './locales-ru-pl'
import { TR_MESSAGES, UK_MESSAGES } from './locales-uk-tr'
import { TH_MESSAGES, ZH_HANS_MESSAGES, ZH_HANT_MESSAGES } from './locales-zh-th'
import type { UiMessages } from './types'

const DICTIONARIES: Readonly<Record<AppLanguage, UiMessages>> = {
  fr: FR_MESSAGES,
  en: EN_MESSAGES,
  de: DE_MESSAGES,
  es: ES_MESSAGES,
  it: IT_MESSAGES,
  pt: PT_MESSAGES,
  ru: RU_MESSAGES,
  pl: PL_MESSAGES,
  uk: UK_MESSAGES,
  tr: TR_MESSAGES,
  ja: JA_MESSAGES,
  ko: KO_MESSAGES,
  'zh-hans': ZH_HANS_MESSAGES,
  'zh-hant': ZH_HANT_MESSAGES,
  th: TH_MESSAGES
}

export function getUiTranslations(lang: AppLanguage): UiMessages {
  return DICTIONARIES[lang] ?? FR_MESSAGES
}

export function useUiTranslations(): { lang: AppLanguage; t: UiMessages } {
  const lang = useAppStore((s) => s.settings.market.language)
  return { lang, t: DICTIONARIES[lang] ?? FR_MESSAGES }
}

export type { UiMessages }
