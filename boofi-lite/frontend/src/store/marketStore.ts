
import { create } from 'zustand';
import { MarketStore, CurrencyInfo } from '@/lib/types';

type ViewTab = 'lend' | 'withdraw' | 'borrow' | 'repay';

export const useMarketStore = create<MarketStore>((set) => ({
  currentViewTab: 'lend',
  setCurrentViewTab: (tab: ViewTab) => set({ currentViewTab: tab }),

  selectedAsset: null,
  setSelectedAsset: (asset: CurrencyInfo) => set({ selectedAsset: asset }),

  fromChain: '',
  toChain: '',
  setFromChain: (chainId: string) => set({ fromChain: chainId }),
  setToChain: (chainId: string) => set({ toChain: chainId }),
}));
