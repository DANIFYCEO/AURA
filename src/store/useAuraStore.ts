import { create } from 'zustand';

export interface WatchlistItem {
  symbol: string;
  name: string;
  type: 'EQUITY' | 'CRYPTO' | 'ETF' | 'INDEX';
}

interface AuraState {
  activeTicker: string;
  setActiveTicker: (ticker: string) => void;
  watchlist: WatchlistItem[];
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (symbol: string) => void;
  activeRange: string;
  setActiveRange: (range: string) => void;
  isChartFullscreen: boolean;
  toggleChartFullscreen: () => void;
  userMode: 'beginner' | 'pro';
  toggleUserMode: () => void;
  aiContext: string;
  setAiContext: (ctx: string) => void;
  mobileTab: 'watchlist' | 'chart' | 'ai' | 'radar';
  setMobileTab: (tab: 'watchlist' | 'chart' | 'ai' | 'radar') => void;
}

export const useAuraStore = create<AuraState>((set) => ({
  activeTicker: 'AAPL',
  setActiveTicker: (ticker) => set({ activeTicker: ticker }),
  
  watchlist: [
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'EQUITY' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'EQUITY' },
    { symbol: 'TSLA', name: 'Tesla Inc.', type: 'EQUITY' },
    { symbol: 'MSFT', name: 'Microsoft', type: 'EQUITY' },
    { symbol: 'SPY', name: 'S&P 500 ETF', type: 'ETF' },
    { symbol: 'BTC-USD', name: 'Bitcoin', type: 'CRYPTO' },
    { symbol: 'ETH-USD', name: 'Ethereum', type: 'CRYPTO' },
  ],
  addToWatchlist: (item) => set((state) => {
    if (state.watchlist.find(w => w.symbol === item.symbol)) return state;
    return { watchlist: [item, ...state.watchlist], activeTicker: item.symbol };
  }),
  removeFromWatchlist: (symbol) => set((state) => ({
    watchlist: state.watchlist.filter(w => w.symbol !== symbol)
  })),

  activeRange: '1M',
  setActiveRange: (range) => set({ activeRange: range }),

  isChartFullscreen: false,
  toggleChartFullscreen: () => set((state) => ({ isChartFullscreen: !state.isChartFullscreen })),

  userMode: 'pro',
  toggleUserMode: () => set((state) => ({ userMode: state.userMode === 'pro' ? 'beginner' : 'pro' })),
  
  aiContext: '',
  setAiContext: (ctx) => set({ aiContext: ctx }),

  mobileTab: 'chart',
  setMobileTab: (tab) => set({ mobileTab: tab }),
}));
