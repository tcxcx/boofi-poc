import { Token } from "@/lib/types";
import { SwapError } from "@coinbase/onchainkit/swap";
import { Address } from "viem";
import { UseBalanceReturnType, UseReadContractReturnType } from "wagmi";
import { create } from "zustand";
export type SwapUnit = {
  amount: string;
  amountUSD: string;
  balance?: string;
  balanceResponse?: UseBalanceReturnType | UseReadContractReturnType;
  error?: SwapError;
  loading: boolean;
  setAmount: (amount: string) => void;
  setAmountUSD: (amountUSD: string) => void;
  setLoading: (loading: boolean) => void;
  setToken: (token: Token) => void;
  token: Token | undefined;
};

export type SwapContextType = {
  address?: Address; // Used to check if user is connected in SwapButton
  from: SwapUnit;
  handleAmountChange: (
    t: "from" | "to",
    amount: string,
    st?: Token,
    dt?: Token
  ) => void;
  handleSubmit: () => void;
  handleToggle: () => void;
  to: SwapUnit;
  isToastVisible?: boolean;
  setIsToastVisible?: (visible: boolean) => void;
  transactionHash?: string;
  setTransactionHash?: (hash: string) => void;
};

export const useSwap = create<SwapContextType>((set) => ({
  address: undefined,
  from: {
    amount: "",
    amountUSD: "",
    balance: "",
    balanceResponse: undefined,
    error: undefined,
    loading: false,
    setAmount: (amount: string) =>
      set((state) => ({ from: { ...state.from, amount } })),
    setAmountUSD: (amountUSD: string) =>
      set((state) => ({ from: { ...state.from, amountUSD } })),
    setLoading: (loading: boolean) =>
      set((state) => ({ from: { ...state.from, loading } })),
    setToken: (token: Token) =>
      set((state) => ({ from: { ...state.from, token } })),
    token: undefined,
  },
  to: {
    amount: "",
    amountUSD: "",
    loading: false,
    setAmount: (amount: string) =>
      set((state) => ({ to: { ...state.to, amount } })),
    setAmountUSD: (amountUSD: string) =>
      set((state) => ({ to: { ...state.to, amountUSD } })),
    setLoading: (loading: boolean) =>
      set((state) => ({ to: { ...state.to, loading } })),
    setToken: (token: Token) =>
      set((state) => ({ to: { ...state.to, token } })),
    token: undefined,
  },
  handleAmountChange: () => {},
  handleSubmit: () => {},
  handleToggle: () => {},
}));
