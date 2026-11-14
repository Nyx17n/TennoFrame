import { create } from 'zustand'
import type { CommunityStatsSnapshot } from '@shared/schemas/system.schema'
import { ipcClient } from '@/services/ipc-client'

const AUTO_REFRESH_INTERVAL_MS = 15 * 60_000

let pollingTimerId: number | null = null

interface CommunityStatsStoreState {
  stats: CommunityStatsSnapshot | null
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  initialized: boolean
  fetchStats: (forceRefresh?: boolean) => Promise<void>
  ensurePolling: () => void
}

export const useCommunityStatsStore = create<CommunityStatsStoreState>((set, get) => ({
  stats: null,
  isLoading: true,
  isRefreshing: false,
  error: null,
  initialized: false,

  fetchStats: async (forceRefresh = false) => {
    const current = get().stats
    set({
      isLoading: !current,
      isRefreshing: Boolean(current) && forceRefresh,
      error: null
    })
    try {
      const snapshot = await ipcClient.system.getCommunityStats(forceRefresh)
      set({
        stats: snapshot,
        isLoading: false,
        isRefreshing: false,
        error: null
      })
    } catch (err) {
      set({
        isLoading: false,
        isRefreshing: false,
        error: err instanceof Error ? err.message : 'Impossible de charger le compteur communautaire.'
      })
    }
  },

  ensurePolling: () => {
    if (!get().initialized) {
      set({ initialized: true })
      void get().fetchStats(false)
    }
    if (pollingTimerId === null && typeof window !== 'undefined') {
      pollingTimerId = window.setInterval(() => {
        void get().fetchStats(false)
      }, AUTO_REFRESH_INTERVAL_MS)
    }
  }
}))
