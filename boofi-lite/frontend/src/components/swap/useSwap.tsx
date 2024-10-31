import { Token } from "@/lib/types";
import { Address } from "viem";
import { create } from "zustand";

interface SwapUnit {
  amount: string;
  amountUSD: string;
  balance?: string;
  loading: boolean;
  token: Token | undefined;
  setAmount: (amount: string) => void;
  setAmountUSD: (amountUSD: string) => void;
  setLoading: (loading: boolean) => void;
  setToken: (token: Token) => void;
}

interface SwapContextType {
  address?: Address;
  from: SwapUnit;
  to: SwapUnit;
  handleAmountChange: (
    t: "from" | "to",
    amount: string,
    st?: Token,
    dt?: Token
  ) => void;
  isToastVisible?: boolean;
  setIsToastVisible?: (visible: boolean) => void;
  transactionHash?: string;
  setTransactionHash?: (hash: string) => void;
}

export const useSwap = create<SwapContextType>((set) => ({
  from: {
    amount: "",
    amountUSD: "",
    loading: false,
    token: undefined,
    balance: undefined,
    setAmount: (amount: string) =>
      set((state) => ({ from: { ...state.from, amount } })),
    setAmountUSD: (amountUSD: string) =>
      set((state) => ({ from: { ...state.from, amountUSD } })),
    setLoading: (loading: boolean) =>
      set((state) => ({ from: { ...state.from, loading } })),
    setToken: (token: Token) =>
      set((state) => {
        if (state.from.token === token) {
          return state; // Evitamos la actualización si el token no ha cambiado
        }
        return {
          from: { ...state.from, token },
        };
      }),
  },
  to: {
    amount: "",
    amountUSD: "",
    loading: false,
    token: undefined,
    balance: undefined,
    setAmount: (amount: string) =>
      set((state) => ({ to: { ...state.to, amount } })),
    setAmountUSD: (amountUSD: string) =>
      set((state) => ({ to: { ...state.to, amountUSD } })),
    setLoading: (loading: boolean) =>
      set((state) => ({ to: { ...state.to, loading } })),
    setToken: (token: Token) =>
      set((state) => {
        if (state.to.token === token) {
          return state;
        }
        return {
          to: { ...state.to, token },
        };
      }),
  },
  address: undefined,
  handleAmountChange: (t, amount, st, dt) => {},
  isToastVisible: false,
  setIsToastVisible: (visible) => set({ isToastVisible: visible }),
  transactionHash: undefined,
  setTransactionHash: (hash: string) => set({ transactionHash: hash }),
}));
