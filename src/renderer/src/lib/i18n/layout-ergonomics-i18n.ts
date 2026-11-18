import type { AppLanguage } from '@shared/schemas/settings.schema'

export interface LayoutErgonomicsStrings {
  readonly sectionTitle: string
  readonly sectionSubtitle: string
  readonly tabsPositionLabel: string
  readonly tabsPosTopTitle: string
  readonly tabsPosTopDesc: string
  readonly tabsPosSideTitle: string
  readonly tabsPosSideDesc: string
  readonly cornerRadiusLabel: string
  readonly cornerAuto: string
  readonly cornerSharp: string
  readonly cornerSubtle: string
  readonly cornerRounded: string
  readonly cornerPill: string
  readonly densityLabel: string
  readonly densityCompactTitle: string
  readonly densityCompactDesc: string
  readonly densityComfortTitle: string
  readonly densityComfortDesc: string
  readonly densitySpaciousTitle: string
  readonly densitySpaciousDesc: string
  readonly newTabTargetLabel: string
  readonly targetSpeedDial: string
  readonly targetSpeedDialDesc: string
  readonly targetMarket: string
  readonly targetHub: string
  readonly targetCodex: string
  readonly targetWfmAccount: string
  readonly sidebarPinnedTitle: string
  readonly sidebarOpenTabsTitle: string
  readonly sidebarNewTabBtn: string
  readonly sidebarCollapseBtn: string
  readonly sidebarExpandBtn: string
  readonly sidebarToggleTip: string
  readonly speedDialTitle: string
  readonly speedDialSubtitle: string
  readonly speedDialSearchPlaceholder: string
  readonly speedDialQuickAccess: string
  readonly speedDialCyclesTitle: string
  readonly speedDialCyclesOffline: string
  readonly speedDialFavoritesTitle: string
  readonly speedDialFavoritesEmpty: string
  readonly speedDialExploreMarketBtn: string
  readonly speedDialRecentTitle: string
  readonly speedDialRecentEmpty: string
  readonly tileMarketDesc: string
  readonly tileHubDesc: string
  readonly tileCodexDesc: string
  readonly tileAccountDesc: string
  readonly tileCartDesc: string
  readonly tileDucatsDesc: string
  readonly tileRivensDesc: string
}

const FR: LayoutErgonomicsStrings = {
  sectionTitle: 'Disposition, Densité & Nouvel Onglet',
  sectionSubtitle:
    'Personnalise la position de la barre d’onglets, la forme des coins, la densité d’affichage et la page d’ouverture des nouveaux onglets.',
  tabsPositionLabel: 'Position des onglets',
  tabsPosTopTitle: 'Haut Classique',
  tabsPosTopDesc: 'Barre horizontale traditionnelle en haut de la fenêtre',
  tabsPosSideTitle: 'Barre Latérale Gauche (Arc / Zen)',
  tabsPosSideDesc: 'Colonne verticale rétractable idéale pour garder 10+ onglets lisibles',
  cornerRadiusLabel: 'Forme des coins (--radius)',
  cornerAuto: 'Auto (Style)',
  cornerSharp: 'Angulaire (0 px)',
  cornerSubtle: 'Subtil (4 px)',
  cornerRounded: 'Standard (8 px)',
  cornerPill: 'Doux / Pilule (14 px)',
  densityLabel: 'Densité de l’interface',
  densityCompactTitle: 'Compacte',
  densityCompactDesc: 'Lignes et barres resserrées (+25 % d’annonces visibles)',
  densityComfortTitle: 'Confortable',
  densityComfortDesc: 'Équilibre visuel standard recommandé',
  densitySpaciousTitle: 'Aérée',
  densitySpaciousDesc: 'Marges et respirations élargies (écrans QHD / 4K)',
  newTabTargetLabel: 'Ouverture d’un Nouvel Onglet (+ & Ctrl+T)',
  targetSpeedDial: 'Speed Dial (Tableau de Bord)',
  targetSpeedDialDesc: 'Recherche centrale, raccourcis, cycles du monde & favoris',
  targetMarket: 'Accueil Marché',
  targetHub: 'Hub Temps Réel',
  targetCodex: 'Codex & Helminth',
  targetWfmAccount: 'Mon Profil WFM',
  sidebarPinnedTitle: 'Épinglés',
  sidebarOpenTabsTitle: 'Onglets ouverts',
  sidebarNewTabBtn: 'Nouvel onglet',
  sidebarCollapseBtn: 'Replier le volet',
  sidebarExpandBtn: 'Déplier le volet',
  sidebarToggleTip: 'Afficher / Replier la barre latérale d’onglets',
  speedDialTitle: 'Tableau de Bord TennoFrame',
  speedDialSubtitle: 'Accès instantané au Marché, au Codex hors-ligne et aux cycles Warframe',
  speedDialSearchPlaceholder:
    'Rechercher un item Warframe Market, une fiche Codex ou taper une adresse wf://…',
  speedDialQuickAccess: 'Accès Rapide',
  speedDialCyclesTitle: 'Cycles du Monde en Direct',
  speedDialCyclesOffline: 'Cycles momentanément hors-ligne',
  speedDialFavoritesTitle: 'Mes Favoris Marché',
  speedDialFavoritesEmpty:
    'Aucun favori enregistré — clique sur ★ sur n’importe quel item du Marché pour l’épingler ici.',
  speedDialExploreMarketBtn: 'Explorer le Catalogue',
  speedDialRecentTitle: 'Consultés Récemment',
  speedDialRecentEmpty: 'Tes prochaines fiches Marché et Codex consultées apparaîtront ici.',
  tileMarketDesc: 'Ordres en direct, statistiques & comparateur Set vs Pièces',
  tileHubDesc: 'Cycles, Fissures, Archonte, Baro & Cadeaux 1999',
  tileCodexDesc: '3 810 fiches FR/EN, Mobs, Marchands & Helminth',
  tileAccountDesc: 'Mes ventes, achats & mise en vente rapide',
  tileCartDesc: 'Panier multi-achats & regroupement par vendeur',
  tileDucatsDesc: 'Meilleurs ratios Ducats / Platinum pour Baro Ki’Teer',
  tileRivensDesc: 'Contrats Mods Riven & alertes Price Sniper'
}

const EN: LayoutErgonomicsStrings = {
  sectionTitle: 'Layout, Density & New Tab',
  sectionSubtitle:
    'Customize tab bar placement, corner geometry, interface density, and the default page opened by new tabs.',
  tabsPositionLabel: 'Tab Bar Position',
  tabsPosTopTitle: 'Classic Top Bar',
  tabsPosTopDesc: 'Traditional horizontal tab strip across the top bar',
  tabsPosSideTitle: 'Left Vertical Sidebar (Arc / Zen)',
  tabsPosSideDesc: 'Collapsible vertical sidebar ideal for keeping 10+ item tabs readable',
  cornerRadiusLabel: 'Corner Shape (--radius)',
  cornerAuto: 'Auto (Style)',
  cornerSharp: 'Sharp (0 px)',
  cornerSubtle: 'Subtle (4 px)',
  cornerRounded: 'Standard (8 px)',
  cornerPill: 'Soft / Pill (14 px)',
  densityLabel: 'Interface Density',
  densityCompactTitle: 'Compact',
  densityCompactDesc: 'Tighter bars and rows (+25% more orders visible)',
  densityComfortTitle: 'Comfortable',
  densityComfortDesc: 'Balanced default spacing',
  densitySpaciousTitle: 'Spacious',
  densitySpaciousDesc: 'Wider padding and breathing room for QHD / 4K monitors',
  newTabTargetLabel: 'New Tab Page (+ & Ctrl+T)',
  targetSpeedDial: 'Speed Dial (Dashboard)',
  targetSpeedDialDesc: 'Central search bar, quick tiles, live world cycles & favorites',
  targetMarket: 'Market Home',
  targetHub: 'Live World Hub',
  targetCodex: 'Codex & Helminth',
  targetWfmAccount: 'My WFM Profile',
  sidebarPinnedTitle: 'Pinned',
  sidebarOpenTabsTitle: 'Open Tabs',
  sidebarNewTabBtn: 'New Tab',
  sidebarCollapseBtn: 'Collapse sidebar',
  sidebarExpandBtn: 'Expand sidebar',
  sidebarToggleTip: 'Toggle vertical tabs sidebar',
  speedDialTitle: 'TennoFrame Speed Dial',
  speedDialSubtitle: 'Instant gateway to Warframe Market, offline Codex, and live World Cycles',
  speedDialSearchPlaceholder: 'Search Warframe Market item, Codex entry, or enter a wf:// URI…',
  speedDialQuickAccess: 'Quick Access',
  speedDialCyclesTitle: 'Live World Cycles',
  speedDialCyclesOffline: 'Live cycles temporarily offline',
  speedDialFavoritesTitle: 'Pinned Market Favorites',
  speedDialFavoritesEmpty:
    'No favorite items yet — click ★ on any Market item to pin it right here.',
  speedDialExploreMarketBtn: 'Browse Market Catalog',
  speedDialRecentTitle: 'Recently Visited',
  speedDialRecentEmpty: 'Your recently viewed Market items and Codex pages will appear here.',
  tileMarketDesc: 'Live orders, price history & Set vs Parts analyzer',
  tileHubDesc: 'World cycles, Fissures, Archon, Baro & 1999 Hex Gifts',
  tileCodexDesc: '3,810 offline entries, Enemies, Vendors & Helminth',
  tileAccountDesc: 'Manage listings, status & one-click sold tracking',
  tileCartDesc: 'Multi-item cart & same-seller Trade Bundler',
  tileDucatsDesc: 'Best Ducats-per-Platinum ratios for Baro Ki’Teer',
  tileRivensDesc: 'Riven Mod auctions & live Price Sniper alerts'
}

const OVERRIDES: Partial<Record<AppLanguage, Partial<LayoutErgonomicsStrings>>> = {
  de: {
    sectionTitle: 'Layout, Dichte & Neuer Tab',
    tabsPosTopTitle: 'Klassisch Oben',
    tabsPosSideTitle: 'Vertikale Seitenleiste',
    sidebarNewTabBtn: 'Neuer Tab',
    speedDialTitle: 'TennoFrame Schnellwahl'
  },
  es: {
    sectionTitle: 'Diseño, Densidad y Nueva Pestaña',
    tabsPosTopTitle: 'Barra Superior Clásica',
    tabsPosSideTitle: 'Barra Lateral Vertical',
    sidebarNewTabBtn: 'Nueva pestaña',
    speedDialTitle: 'Panel Rápido TennoFrame'
  },
  it: {
    sectionTitle: 'Layout, Densità e Nuova Scheda',
    tabsPosTopTitle: 'Barra Superiore Classica',
    tabsPosSideTitle: 'Barra Laterale Verticale',
    sidebarNewTabBtn: 'Nuova scheda',
    speedDialTitle: 'Accesso Rapido TennoFrame'
  },
  pt: {
    sectionTitle: 'Layout, Densidade e Novo Separador',
    tabsPosTopTitle: 'Topo Clássico',
    tabsPosSideTitle: 'Barra Lateral Vertical',
    sidebarNewTabBtn: 'Novo separador',
    speedDialTitle: 'Painel Rápido TennoFrame'
  },
  ru: {
    sectionTitle: 'Макет, плотность и новая вкладка',
    tabsPosTopTitle: 'Сверху (классика)',
    tabsPosSideTitle: 'Боковая панель слева',
    sidebarNewTabBtn: 'Новая вкладка',
    speedDialTitle: 'Быстрый доступ TennoFrame'
  },
  pl: {
    sectionTitle: 'Układ, gęstość i nowa karta',
    tabsPosTopTitle: 'Górny pasek klasyczny',
    tabsPosSideTitle: 'Pionowy pasek boczny',
    sidebarNewTabBtn: 'Nowa karta',
    speedDialTitle: 'Szybki dostęp TennoFrame'
  },
  uk: {
    sectionTitle: 'Макет, щільність і нова вкладка',
    tabsPosTopTitle: 'Зверху (класика)',
    tabsPosSideTitle: 'Бічна панель ліворуч',
    sidebarNewTabBtn: 'Нова вкладка',
    speedDialTitle: 'Швидкий доступ TennoFrame'
  },
  tr: {
    sectionTitle: 'Düzen, Yoğunluk ve Yeni Sekme',
    tabsPosTopTitle: 'Klasik Üst Çubuk',
    tabsPosSideTitle: 'Dikey Yan Çubuk',
    sidebarNewTabBtn: 'Yeni Sekme',
    speedDialTitle: 'TennoFrame Hızlı Erişim'
  },
  ja: {
    sectionTitle: 'レイアウト・密度・新しいタブ',
    tabsPosTopTitle: '上部バー（標準）',
    tabsPosSideTitle: '左サイドバー（縦タブ）',
    sidebarNewTabBtn: '新しいタブ',
    speedDialTitle: 'TennoFrame スピードダイヤル'
  },
  ko: {
    sectionTitle: '레이아웃, 밀도 및 새 탭',
    tabsPosTopTitle: '상단 기본 탭 바',
    tabsPosSideTitle: '좌측 세로 사이드바',
    sidebarNewTabBtn: '새 탭',
    speedDialTitle: 'TennoFrame 스피드 다이얼'
  },
  'zh-hans': {
    sectionTitle: '布局、密度与新标签页',
    tabsPosTopTitle: '顶部经典标签栏',
    tabsPosSideTitle: '左侧垂直标签栏',
    sidebarNewTabBtn: '新标签页',
    speedDialTitle: 'TennoFrame 快速拨号面板'
  },
  'zh-hant': {
    sectionTitle: '版面配置、密度與新分頁',
    tabsPosTopTitle: '頂部經典分頁列',
    tabsPosSideTitle: '左側垂直分頁列',
    sidebarNewTabBtn: '新增分頁',
    speedDialTitle: 'TennoFrame 快速撥號面板'
  },
  th: {
    sectionTitle: 'เลย์เอาต์ ความหนาแน่น และแท็บใหม่',
    tabsPosTopTitle: 'แถบด้านบนแบบคลาสสิก',
    tabsPosSideTitle: 'แถบแนวตั้งด้านซ้าย',
    sidebarNewTabBtn: 'แท็บใหม่',
    speedDialTitle: 'แดชบอร์ดด่วน TennoFrame'
  }
}

export function getLayoutErgonomicsStrings(lang: AppLanguage): LayoutErgonomicsStrings {
  if (lang === 'fr') return FR
  if (lang === 'en') return EN
  return { ...EN, ...(OVERRIDES[lang] ?? {}) }
}
