import type { AppLanguage } from '@shared/schemas/settings.schema'

export interface ProToolsStrings {
  readonly navBuilds: string
  readonly navProfitScanner: string
  readonly navLedger: string
  readonly navFoundry: string
  readonly scannerTitle: string
  readonly scannerSubtitle: string
  readonly tabArcanes: string
  readonly tabEndoMods: string
  readonly tabPrimeSets: string
  readonly scanRefreshBtn: string
  readonly customSlugPlaceholder: string
  readonly customAddBtn: string
  readonly ledgerTitle: string
  readonly ledgerSubtitle: string
  readonly ledgerSales: string
  readonly ledgerPurchases: string
  readonly ledgerNetProfit: string
  readonly ledgerDailyTrades: string
  readonly ledgerExportCsv: string
  readonly rivenTabAuctions: string
  readonly rivenTabGrader: string
  readonly rivenEvaluateBtn: string
  readonly buildsTitle: string
  readonly buildsSubtitle: string
  readonly buildsNewBtn: string
  readonly buildsImportCodeBtn: string
  readonly buildsCopyCodeBtn: string
  readonly buildsPriceCheckBtn: string
  readonly foundryTitle: string
  readonly foundrySubtitle: string
  readonly foundryPinOverlayBtn: string
  readonly foundryAddCodexBtn: string
  readonly foundryAddedBadge: string
}

const EN_PRO_TOOLS: ProToolsStrings = {
  navBuilds: 'Builds',
  navProfitScanner: 'Profit Scanner',
  navLedger: 'Ledger',
  navFoundry: 'Foundry',
  scannerTitle: 'Platinum Profit & Arbitrage Scanner',
  scannerSubtitle: 'Real-time Rank 0 → Max fusion margins, Endo-to-Platinum ratios & Set flips.',
  tabArcanes: 'Arcane Fusion (21× R0 → R5)',
  tabEndoMods: 'Endo Valuation (R0 → R10)',
  tabPrimeSets: 'Prime Sets Arbitrage',
  scanRefreshBtn: 'Refresh Scan',
  customSlugPlaceholder: 'Add WFM slug (e.g. arcane_energize)…',
  customAddBtn: 'Analyze',
  ledgerTitle: 'Platinum Ledger & Trade Tracker',
  ledgerSubtitle: 'Automatic WFM sales log, net profit chart, daily MR trades & credit tax.',
  ledgerSales: 'Total Sales',
  ledgerPurchases: 'Purchases',
  ledgerNetProfit: 'Net Profit',
  ledgerDailyTrades: 'Daily Trades Remaining',
  ledgerExportCsv: 'Export CSV',
  rivenTabAuctions: 'Live Auctions',
  rivenTabGrader: 'Riven Grader & Simulator',
  rivenEvaluateBtn: 'Evaluate Riven & Estimate Price',
  buildsTitle: 'Build Studio & Live Cost Calculator',
  buildsSubtitle: 'Plan Warframe & Weapon loadouts, Forma drain, Helminth, Shards & missing Platinum cost.',
  buildsNewBtn: 'New Build',
  buildsImportCodeBtn: 'Import Share Code',
  buildsCopyCodeBtn: 'Copy Share Code',
  buildsPriceCheckBtn: 'Calculate Live Platinum Cost',
  foundryTitle: 'Foundry Multi-Craft Planner',
  foundrySubtitle: 'Aggregate crafting materials across multiple Warframes & Weapons into one shopping list.',
  foundryPinOverlayBtn: 'Pin Missing to Alt+O Overlay',
  foundryAddCodexBtn: '+ Foundry Planner',
  foundryAddedBadge: 'In Foundry'
}

const FR_PRO_TOOLS: ProToolsStrings = {
  navBuilds: 'Builds',
  navProfitScanner: 'Scanner Profits',
  navLedger: 'Comptabilité',
  navFoundry: 'Fonderie',
  scannerTitle: 'Scanner de Profits & Arbitrage Platinum',
  scannerSubtitle: 'Marges temps réel Fusion d’Arcanes (21× R0 → R5), rentabilité Endo & Sets Prime.',
  tabArcanes: 'Fusion d’Arcanes (21× R0 → R5)',
  tabEndoMods: 'Rentabilité Endo (R0 → R10)',
  tabPrimeSets: 'Arbitrage Sets Prime',
  scanRefreshBtn: 'Actualiser le scan',
  customSlugPlaceholder: 'Ajouter un slug WFM (ex: arcane_energize)…',
  customAddBtn: 'Analyser',
  ledgerTitle: 'Livre de Comptes Platinum & Quotas d’Échanges',
  ledgerSubtitle: 'Journal auto WFM, courbe de bénéfice net, échanges restants par Palier & taxe Crédits.',
  ledgerSales: 'Ventes Totales',
  ledgerPurchases: 'Achats',
  ledgerNetProfit: 'Bénéfice Net',
  ledgerDailyTrades: 'Échanges du Jour Restants',
  ledgerExportCsv: 'Exporter CSV',
  rivenTabAuctions: 'Enchères en Direct',
  rivenTabGrader: 'Évaluateur & Simulateur Riven',
  rivenEvaluateBtn: 'Évaluer le Riven & Estimer son Prix',
  buildsTitle: 'Studio de Builds & Coût Platinum Temps Réel',
  buildsSubtitle: 'Planifiez vos Warframes & Armes, Formas, Helminth, Fragments d’Archonte et coût restant.',
  buildsNewBtn: 'Nouveau Build',
  buildsImportCodeBtn: 'Importer un Code',
  buildsCopyCodeBtn: 'Copier Code Partage',
  buildsPriceCheckBtn: 'Calculer le Coût Platinum Live',
  foundryTitle: 'Planificateur Fonderie Multi-Crafts',
  foundrySubtitle: 'Consolidez tous les matériaux de vos Warframes & Armes à crafter en une liste unique.',
  foundryPinOverlayBtn: 'Épingler les manquants à l’Overlay Alt+O',
  foundryAddCodexBtn: '+ Fonderie',
  foundryAddedBadge: 'Dans la Fonderie'
}

const OVERRIDES: Partial<Record<AppLanguage, Partial<ProToolsStrings>>> = {
  de: { navBuilds: 'Builds', navProfitScanner: 'Profit-Scanner', navLedger: 'Bilanz', navFoundry: 'Schmiede' },
  es: { navBuilds: 'Builds', navProfitScanner: 'Escáner Profit', navLedger: 'Contabilidad', navFoundry: 'Fundición' },
  it: { navBuilds: 'Build', navProfitScanner: 'Scanner Profitti', navLedger: 'Contabilità', navFoundry: 'Fucina' },
  pt: { navBuilds: 'Builds', navProfitScanner: 'Scanner Lucro', navLedger: 'Contabilidade', navFoundry: 'Forja' },
  ru: { navBuilds: 'Билды', navProfitScanner: 'Сканер платины', navLedger: 'Учёт', navFoundry: 'Кузница' },
  pl: { navBuilds: 'Buildy', navProfitScanner: 'Skaner Zysku', navLedger: 'Księgowość', navFoundry: 'Warsztat' },
  uk: { navBuilds: 'Білди', navProfitScanner: 'Сканер прибутку', navLedger: 'Облік', navFoundry: 'Кузня' },
  tr: { navBuilds: 'Dizilimler', navProfitScanner: 'Kâr Tarayıcı', navLedger: 'Muhasebe', navFoundry: 'Atölye' },
  ja: { navBuilds: 'ビルド', navProfitScanner: '利益スキャナー', navLedger: '収支帳', navFoundry: 'ファウンドリ' },
  ko: { navBuilds: '빌드', navProfitScanner: '수익 스캐너', navLedger: '플래티넘 장부', navFoundry: '주조소' },
  'zh-hans': { navBuilds: '配卡工坊', navProfitScanner: '套利扫描', navLedger: '白金账本', navFoundry: '铸造厂规划' },
  'zh-hant': { navBuilds: '配卡工坊', navProfitScanner: '套利掃描', navLedger: '白金帳本', navFoundry: '鑄造廠規劃' },
  th: { navBuilds: 'จัดบิลด์', navProfitScanner: 'สแกนกำไร', navLedger: 'บัญชีแพลทินัม', navFoundry: 'เตาหลอม' }
}

export function getProToolsStrings(lang: AppLanguage): ProToolsStrings {
  if (lang === 'fr') return FR_PRO_TOOLS
  if (lang === 'en') return EN_PRO_TOOLS
  return { ...EN_PRO_TOOLS, ...(OVERRIDES[lang] ?? {}) }
}
