import { create } from "zustand";
import { MarketStore, CurrencyInfo } from "@/lib/types";

type ViewTab = 'lend' | 'withdraw' | 'borrow' | 'repay';

export const useMarketStore = create<MarketStore>((set) => ({
  currentViewTab: 'lend',
  setCurrentViewTab: (tab: ViewTab) => set({ currentViewTab: tab }),

  selectedAsset: null, // Initially no asset is selected
  setSelectedAsset: (asset: CurrencyInfo) => set({ selectedAsset: asset })
}));
