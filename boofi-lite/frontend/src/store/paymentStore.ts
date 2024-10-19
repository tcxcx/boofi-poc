import { create } from "zustand";

type PaymentTab = 'send' | 'receive';

interface PaymentStore {
  currentPaymentTab: PaymentTab;
  setCurrentPaymentTab: (tab: PaymentTab) => void;
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  currentPaymentTab: 'send',
  setCurrentPaymentTab: (tab: PaymentTab) => set({ currentPaymentTab: tab }),
}));