import { create } from 'zustand';
import { TabState } from '@/lib/types';

export const useTabStore = create<TabState>((set) => ({
  activeTab: 'moneyMarket',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
