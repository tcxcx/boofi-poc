import { create } from "zustand";

interface AuthState {
  userId: string | null;
  userAddress: string | null;
  currentChainId: number | null;
  isDialogOpen: boolean;
  isDialogVisible: boolean;
  isWorldIdVerifying: boolean;
  isPlaidVerifying: boolean;
  isPlaidPortalOpen: boolean;
  isPlaidLoading: boolean;
  isVerified: boolean;
  isMiniPay: boolean;
  setUserId: (userId: string) => void;
  setUserAddress: (userAddress: string) => void;
  setCurrentChainId: (chainId: number) => void;
  setDialogOpen: (isOpen: boolean) => void;
  setDialogVisible: (isVisible: boolean) => void;
  setWorldIdVerifying: (isVerifying: boolean) => void;
  setPlaidVerifying: (isVerifying: boolean) => void;
  setPlaidPortalOpen: (isOpen: boolean) => void;
  setPlaidLoading: (isLoading: boolean) => void;
  setVerified: (isVerified: boolean) => void;
  setMiniPay: (isMiniPay: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  userAddress: null,
  currentChainId: null,
  isDialogOpen: false,
  isDialogVisible: true,
  isWorldIdVerifying: false,
  isPlaidVerifying: false,
  isPlaidPortalOpen: false,
  isPlaidLoading: false,
  isVerified: false,
  isMiniPay: false,
  setUserId: (userId: string) => set({ userId }),
  setUserAddress: (userAddress: string) => set({ userAddress }),
  setCurrentChainId: (chainId: number) => set({ currentChainId: chainId }),
  setDialogOpen: (isOpen: boolean) => set({ isDialogOpen: isOpen }),
  setDialogVisible: (isVisible: boolean) => set({ isDialogVisible: isVisible }),
  setWorldIdVerifying: (isVerifying: boolean) =>
    set({ isWorldIdVerifying: isVerifying }),
  setPlaidVerifying: (isVerifying: boolean) =>
    set({ isPlaidVerifying: isVerifying }),
  setPlaidPortalOpen: (isOpen: boolean) => set({ isPlaidPortalOpen: isOpen }),
  setPlaidLoading: (isLoading: boolean) => set({ isPlaidLoading: isLoading }),
  setVerified: (isVerified: boolean) => set({ isVerified }),
  setMiniPay: (isMiniPay: boolean) => set({ isMiniPay }),
}));
