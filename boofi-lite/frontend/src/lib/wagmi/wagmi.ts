'use client';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { useMemo } from 'react';
import { http, createConfig } from 'wagmi';
import {
  baseSepolia,
  avalancheFuji
} from "wagmi/chains";
import { NEXT_PUBLIC_WC_PROJECT_ID } from './config';

export function useWagmiConfig() {
  const projectId = NEXT_PUBLIC_WC_PROJECT_ID ?? '';
  if (!projectId) {
    const providerErrMessage =
      'To connect to all Wallets you need to provide a NEXT_PUBLIC_WC_PROJECT_ID env variable';
    throw new Error(providerErrMessage);
  }

  return useMemo(() => {
    const connectors = connectorsForWallets(
      [
        {
          groupName: 'Recommended Wallet',
          wallets: [coinbaseWallet],
        },
        {
          groupName: 'Other Wallets',
          wallets: [rainbowWallet, metaMaskWallet],
        },
      ],
      {
        appName: 'BooFi',
        projectId,
      },
    );

    const wagmiConfig = createConfig({
      chains: [
        baseSepolia,
        avalancheFuji
      ],
      multiInjectedProviderDiscovery: false,
      connectors,
      ssr: true,
      transports: {
        [avalancheFuji.id]: http(),
        [baseSepolia.id]: http(),
      },
    });
    return wagmiConfig;
  }, [projectId]);
}

declare module "wagmi" {
  interface Register {
    config: any;
  }
}