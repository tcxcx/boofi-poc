import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface OnboardingState {
  step: number
  walletConnected: boolean
  walletAddress: string
  baseName: string
  isLoading: boolean
}

interface OnboardingActions {
  setStep: (step: number) => void
  setWalletConnected: (connected: boolean) => void
  setWalletAddress: (address: string) => void
  setBaseName: (name: string) => void
  setIsLoading: (loading: boolean) => void
}

type OnboardingStore = OnboardingState & OnboardingActions

// Store
export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      step: 1,
      walletConnected: false,
      walletAddress: '',
      baseName: '',
      isLoading: false,
      setStep: (step) => set({ step }),
      setWalletConnected: (connected) => set({ walletConnected: connected }),
      setWalletAddress: (address) => set({ walletAddress: address }),
      setBaseName: (name) => set({ baseName: name }),
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
)

// Simulation functions, delete once integrated with real wallet connection
export const simulateWalletConnection = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      if (success) {
        resolve('0x' + Math.random().toString(16).substr(2, 40));
      } else {
        reject(new Error('Failed to connect wallet'));
      }
    }, 2000);
  });
}

export const simulateBaseNameSetup = (name: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      if (success) {
        resolve();
      } else {
        reject(new Error('Failed to set up Base name'));
      }
    }, 2000);
  });
}