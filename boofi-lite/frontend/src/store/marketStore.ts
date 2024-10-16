import { create } from "zustand";
import { MarketStore } from "@/lib/types";

type ViewTab = 'lend' | 'withdraw' | 'borrow' | 'repay';

export const useMarketStore = create<MarketStore>((set) => ({
  currentViewTab: 'lend',
  setCurrentViewTab: (tab: ViewTab) => set({ currentViewTab: tab }),
}));
