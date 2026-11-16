import type { AppLanguage } from '@shared/schemas/settings.schema'

export interface FontAndSupportStrings {
  readonly fontTitle: string
  readonly fontSubtitle: string
  readonly fontResetAuto: string
  readonly fontCatAll: string
  readonly fontCatSans: string
  readonly fontCatScifi: string
  readonly fontCatMedieval: string
  readonly fontCatMonoFun: string
  readonly fontPreviewTitle: string
  readonly supportBtnLabel: string
  readonly supportModalTitle: string
  readonly supportModalSubtitle: string
  readonly supportCatBug: string
  readonly supportCatFeature: string
  readonly supportCatHelp: string
  readonly supportSubjectLabel: string
  readonly supportSubjectPlaceholder: string
  readonly supportContactLabel: string
  readonly supportContactPlaceholder: string
  readonly supportMessageLabel: string
  readonly supportBugPlaceholder: string
  readonly supportFeaturePlaceholder: string
  readonly supportHelpPlaceholder: string
  readonly supportDiagLabel: string
  readonly supportSendBtn: string
  readonly supportSendingBtn: string
  readonly supportSuccessTitle: string
  readonly supportCooldownHint: string
  readonly supportFallbackHint: string
  readonly supportCopyOpenDiscordBtn: string
  readonly supportCopiedToast: string
}

const FR: FontAndSupportStrings = {
  fontTitle: 'Police d’écriture de l’interface',
  fontSubtitle:
    'Choisis parmi les 12 polices hors-ligne (Sans-Serif, Sci-Fi, Médiéval, Monospace & Fun). Les prix Platinum restent toujours alignés.',
  fontResetAuto: '↺ Auto',
  fontCatAll: 'Toutes (12)',
  fontCatSans: 'Sans-Serif',
  fontCatScifi: 'Sci-Fi & Gaming',
  fontCatMedieval: 'Médiéval & Serif',
  fontCatMonoFun: 'Mono & Fun',
  fontPreviewTitle: 'Aperçu en direct de la police active',
  supportBtnLabel: 'Support / Bug',
  supportModalTitle: 'Support & Signalement de Bug (Discord)',
  supportModalSubtitle:
    'Ton message est envoyé directement sur le serveur Discord officiel TennoFrame (aucun compte requis).',
  supportCatBug: 'Signaler un bug',
  supportCatFeature: 'Suggestion',
  supportCatHelp: 'Question / Aide',
  supportSubjectLabel: 'Sujet court (5 à 90 car.)',
  supportSubjectPlaceholder: 'Ex : Problème d’affichage sur une relique Axi...',
  supportContactLabel: 'Ton Discord ou Pseudo Warframe (optionnel)',
  supportContactPlaceholder: '@pseudo ou PseudoIG (pour te répondre)',
  supportMessageLabel: 'Description détaillée (15 à 1 500 car.)',
  supportBugPlaceholder:
    'Décris ce qu’il s’est passé et comment reproduire le bug (1. Ouvrir... 2. Cliquer sur...).',
  supportFeaturePlaceholder:
    'Décris ton idée d’amélioration et comment elle t’aiderait en jeu ou pour le trading !',
  supportHelpPlaceholder: 'Pose ta question sur l’utilisation de TennoFrame...',
  supportDiagLabel: 'Joindre le diagnostic technique anonyme (version, langue, style — 0 donnée privée)',
  supportSendBtn: 'Envoyer sur Discord',
  supportSendingBtn: 'Transmission sécurisée…',
  supportSuccessTitle: 'Message transmis à l’équipe sur Discord !',
  supportCooldownHint: 'Anti-spam actif — prochain envoi possible dans',
  supportFallbackHint:
    'Relais direct indisponible ou non configuré — ton texte est conservé ! Tu peux le copier en 1 clic et le coller sur Discord :',
  supportCopyOpenDiscordBtn: 'Copier mon rapport & ouvrir Discord',
  supportCopiedToast: 'Rapport copié dans le presse-papiers !'
}

const EN: FontAndSupportStrings = {
  fontTitle: 'Interface Font Family',
  fontSubtitle:
    'Choose from 12 built-in offline fonts (Sans-Serif, Sci-Fi, Medieval, Monospace & Casual). Platinum prices always stay aligned.',
  fontResetAuto: '↺ Auto',
  fontCatAll: 'All (12)',
  fontCatSans: 'Sans-Serif',
  fontCatScifi: 'Sci-Fi & Gaming',
  fontCatMedieval: 'Medieval & Serif',
  fontCatMonoFun: 'Mono & Casual',
  fontPreviewTitle: 'Live Font Preview',
  supportBtnLabel: 'Support / Bug',
  supportModalTitle: 'In-App Support & Bug Report (Discord)',
  supportModalSubtitle:
    'Your message is delivered straight to the official TennoFrame Discord server (no account required).',
  supportCatBug: 'Bug Report',
  supportCatFeature: 'Suggestion',
  supportCatHelp: 'Question / Help',
  supportSubjectLabel: 'Short Subject (5–90 chars)',
  supportSubjectPlaceholder: 'e.g. Missing price badge on Axi relics...',
  supportContactLabel: 'Your Discord or Warframe IGN (optional)',
  supportContactPlaceholder: '@handle or InGameName (so we can reply)',
  supportMessageLabel: 'Detailed Message (15–1,500 chars)',
  supportBugPlaceholder:
    'Describe what happened and the steps to reproduce it (1. Open... 2. Click...).',
  supportFeaturePlaceholder:
    'Describe your feature idea and how it would help your Warframe trading or farming!',
  supportHelpPlaceholder: 'Ask your question about TennoFrame...',
  supportDiagLabel: 'Attach anonymous technical info (app version, language, style — zero private data)',
  supportSendBtn: 'Send to Discord',
  supportSendingBtn: 'Sending securely…',
  supportSuccessTitle: 'Ticket delivered to the TennoFrame Discord!',
  supportCooldownHint: 'Anti-spam cooldown — next ticket available in',
  supportFallbackHint:
    'Direct relay unavailable — your message is safely kept! Copy your formatted report in 1 click and paste it on Discord:',
  supportCopyOpenDiscordBtn: 'Copy Report & Open Discord',
  supportCopiedToast: 'Formatted report copied to clipboard!'
}

const OVERRIDES: Partial<Record<AppLanguage, Partial<FontAndSupportStrings>>> = {
  de: { fontTitle: 'Schriftart der Oberfläche', supportBtnLabel: 'Support / Bug', supportSendBtn: 'An Discord senden' },
  es: { fontTitle: 'Fuente de la interfaz', supportBtnLabel: 'Soporte / Bug', supportSendBtn: 'Enviar a Discord' },
  it: { fontTitle: 'Carattere dell’interfaccia', supportBtnLabel: 'Supporto / Bug', supportSendBtn: 'Invia su Discord' },
  pt: { fontTitle: 'Fonte da interface', supportBtnLabel: 'Suporte / Bug', supportSendBtn: 'Enviar para o Discord' },
  ru: { fontTitle: 'Шрифт интерфейса', supportBtnLabel: 'Поддержка', supportSendBtn: 'Отправить в Discord' },
  pl: { fontTitle: 'Czcionka interfejsu', supportBtnLabel: 'Wsparcie / Błąd', supportSendBtn: 'Wyślij na Discord' },
  uk: { fontTitle: 'Шрифт інтерфейсу', supportBtnLabel: 'Підтримка', supportSendBtn: 'Надіслати в Discord' },
  tr: { fontTitle: 'Arayüz Yazı Tipi', supportBtnLabel: 'Destek / Hata', supportSendBtn: 'Discord’a Gönder' },
  ja: { fontTitle: 'インターフェースのフォント', supportBtnLabel: 'サポート / バグ', supportSendBtn: 'Discordに送信' },
  ko: { fontTitle: '인터페이스 글꼴', supportBtnLabel: '지원 / 버그 제보', supportSendBtn: 'Discord로 보내기' },
  'zh-hans': { fontTitle: '界面字体', supportBtnLabel: '支持 / 反馈', supportSendBtn: '发送到 Discord' },
  'zh-hant': { fontTitle: '介面字體', supportBtnLabel: '支援 / 回報', supportSendBtn: '傳送到 Discord' },
  th: { fontTitle: 'แบบอักษรอินเทอร์เฟซ', supportBtnLabel: 'ช่วยเหลือ / แจ้งบั๊ก', supportSendBtn: 'ส่งไปยัง Discord' }
}

export function getFontAndSupportStrings(lang: AppLanguage): FontAndSupportStrings {
  if (lang === 'fr') return FR
  if (lang === 'en') return EN
  return { ...EN, ...(OVERRIDES[lang] ?? {}) }
}
