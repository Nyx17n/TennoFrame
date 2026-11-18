import type { AppLanguage } from '@shared/schemas/settings.schema'

export interface FactionStylesStrings {
  readonly sectionTitle: string
  readonly sectionDesc: string
  readonly styleOrokin: string
  readonly styleCephalon: string
  readonly stylePom2: string
  readonly palettesTitleOrokin: string
  readonly palettesTitleCephalon: string
  readonly palettesTitlePom2: string
  readonly paletteOrokinLua: string
  readonly paletteOrokinIvory: string
  readonly paletteOrokinVoid: string
  readonly paletteCephalonOrdis: string
  readonly paletteCephalonSimaris: string
  readonly paletteCephalonCy: string
  readonly palettePom2Green: string
  readonly palettePom2Amber: string
  readonly palettePom2Onlyne: string
}

const FR: FactionStylesStrings = {
  sectionTitle: 'Styles Visuels Warframe & Transparence (6 Styles)',
  sectionDesc:
    'Choisissez entre Liquid Glass, Transparence Simple, Style Médiéval, Orokin Impérial, Céphalon HUD ou Terminal POM-2 (1999), en mode opaque ou transparent.',
  styleOrokin: 'Orokin Impérial',
  styleCephalon: 'Céphalon / HUD',
  stylePom2: 'Terminal POM-2 (1999)',
  palettesTitleOrokin: 'Palettes Orokin rapides (1 clic)',
  palettesTitleCephalon: 'Palettes Céphalon rapides (1 clic)',
  palettesTitlePom2: 'Palettes Terminal POM-2 1999 (1 clic)',
  paletteOrokinLua: 'Sanctuaire Lua & Or',
  paletteOrokinIvory: 'Ivoire & Or Prime',
  paletteOrokinVoid: 'Énergie du Néant',
  paletteCephalonOrdis: 'Ordis / Suda Cyan',
  paletteCephalonSimaris: 'Synthèse Simaris',
  paletteCephalonCy: 'Protocole Cy Railjack',
  palettePom2Green: 'Phosphore Vert',
  palettePom2Amber: 'Moniteur Ambre KIM',
  palettePom2Onlyne: 'Néon On-lyne 1999'
}

const EN: FactionStylesStrings = {
  sectionTitle: 'Warframe UI Styles & Transparency (6 Styles)',
  sectionDesc:
    'Choose between Liquid Glass, Simple Transparency, Medieval Grimoire, Orokin Imperial, Cephalon HUD, or POM-2 Terminal (1999), with optional desktop passthrough.',
  styleOrokin: 'Orokin Imperial',
  styleCephalon: 'Cephalon HUD',
  stylePom2: 'POM-2 Terminal (1999)',
  palettesTitleOrokin: 'Quick Orokin palettes (1 click)',
  palettesTitleCephalon: 'Quick Cephalon palettes (1 click)',
  palettesTitlePom2: 'Quick POM-2 1999 palettes (1 click)',
  paletteOrokinLua: 'Lua Sanctuary & Gold',
  paletteOrokinIvory: 'Ivory & Prime Gold',
  paletteOrokinVoid: 'Void Energy',
  paletteCephalonOrdis: 'Ordis / Suda Cyan',
  paletteCephalonSimaris: 'Simaris Synthesis',
  paletteCephalonCy: 'Railjack Cy Protocol',
  palettePom2Green: 'Hollvania Green CRT',
  palettePom2Amber: 'KIM Amber Monitor',
  palettePom2Onlyne: 'On-lyne Neon 1999'
}

const OVERRIDES: Partial<Record<AppLanguage, Partial<FactionStylesStrings>>> = {
  de: { styleOrokin: 'Orokin Imperial', styleCephalon: 'Cephalon-HUD', stylePom2: 'POM-2 Terminal (1999)' },
  es: { styleOrokin: 'Orokin Imperial', styleCephalon: 'HUD Céfalon', stylePom2: 'Terminal POM-2 (1999)' },
  it: { styleOrokin: 'Orokin Imperiale', styleCephalon: 'HUD Cephalon', stylePom2: 'Terminale POM-2 (1999)' },
  pt: { styleOrokin: 'Orokin Imperial', styleCephalon: 'HUD Cephalon', stylePom2: 'Terminal POM-2 (1999)' },
  ru: { styleOrokin: 'Орокин Империал', styleCephalon: 'Цефалон HUD', stylePom2: 'Терминал POM-2 (1999)' },
  pl: { styleOrokin: 'Imperium Orokin', styleCephalon: 'HUD Cefalona', stylePom2: 'Terminal POM-2 (1999)' },
  uk: { styleOrokin: 'Орокін Імперіал', styleCephalon: 'Цефалон HUD', stylePom2: 'Термінал POM-2 (1999)' },
  tr: { styleOrokin: 'Orokin İmparatorluk', styleCephalon: 'Cephalon HUD', stylePom2: 'POM-2 Terminali (1999)' },
  ja: { styleOrokin: 'オロキン・インペリアル', styleCephalon: 'セファロン HUD', stylePom2: 'POM-2 ターミナル (1999)' },
  ko: { styleOrokin: '오로킨 임페리얼', styleCephalon: '세팔론 HUD', stylePom2: 'POM-2 터미널 (1999)' },
  'zh-hans': { styleOrokin: '奥罗金帝国', styleCephalon: '中枢战术 HUD', stylePom2: 'POM-2 终端 (1999)' },
  'zh-hant': { styleOrokin: '奧羅金帝國', styleCephalon: '中樞戰術 HUD', stylePom2: 'POM-2 終端機 (1999)' },
  th: { styleOrokin: 'โอโรคินอิมพีเรียล', styleCephalon: 'เซฟาลอน HUD', stylePom2: 'เทอร์มินัล POM-2 (1999)' }
}

export function getFactionStylesStrings(lang: AppLanguage): FactionStylesStrings {
  if (lang === 'fr') return FR
  if (lang === 'en') return EN
  return { ...EN, ...(OVERRIDES[lang] ?? {}) }
}
