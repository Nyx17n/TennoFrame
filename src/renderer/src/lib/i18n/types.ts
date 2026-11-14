export interface UiMessages {
  readonly shell: {
    readonly hub: string
    readonly newTab: string
    readonly omniboxHint: string
    readonly back: string
    readonly forward: string
    readonly reload: string
    readonly pinOverlay: string
    readonly compactMode: string
    readonly settings: string
    readonly zoomLabel: string
    readonly installedShort: string
    readonly onlineShort: string
    readonly communityTitle: string
    readonly refresh: string
    readonly retry: string
    readonly installedUsers: string
    readonly activeBase: string
    readonly onlineLabel: string
    readonly joinDiscord: string
    readonly offlineCache: string
    readonly patchNotes: string
  }
  readonly bookmarks: {
    readonly market: string
    readonly favorites: string
    readonly cart: string
    readonly recent: string
    readonly codex: string
    readonly ducats: string
    readonly rivens: string
    readonly wfmAccount: string
    readonly history: string
  }
  readonly market: {
    readonly settingsTitle: string
    readonly settingsDesc: string
    readonly platformLabel: string
    readonly crossplayLabel: string
    readonly defaultSellerFilter: string
    readonly sellerIngame: string
    readonly sellerOnline: string
    readonly sellerAll: string
    readonly appLanguageLabel: string
    readonly whisperLanguageLabel: string
    readonly whisperPreviewLabel: string
    readonly whisperCopiedBadge: string
    readonly whisperReadyBadge: string
    readonly copyButton: string
    readonly noResults: string
  }
  readonly settingsModal: {
    readonly title: string
    readonly desc: string
    readonly appearance: string
    readonly audio: string
    readonly window: string
    readonly market: string
    readonly extensions: string
    readonly system: string
  }
  readonly hub: {
    readonly planets: string
    readonly fissures: string
    readonly invasions: string
    readonly duviri: string
    readonly baro: string
    readonly news: string
    readonly activeBadge: string
    readonly unavailableTitle: string
  }
  readonly codex: {
    readonly resources: string
    readonly warframes: string
    readonly weapons: string
    readonly mods: string
    readonly relics: string
    readonly mobs: string
    readonly vendors: string
    readonly helminth: string
    readonly englishFallbackBadge: string
  }
}
