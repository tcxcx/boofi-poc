'use client';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { useMemo } from 'react';
import {
  base,
  baseSepolia,
  avalancheFuji
} from "wagmi/chains";
import { NEXT_PUBLIC_WC_PROJECT_ID } from './config';
import type { Account, Chain, Client, Transport } from "viem";
import { providers } from "ethers";
import { http, useConnectorClient, Config, createConfig } from "wagmi";


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
        base,
        baseSepolia,
        avalancheFuji
      ],
      multiInjectedProviderDiscovery: false,
      connectors,
      ssr: true,
      transports: {
        [avalancheFuji.id]: http(),
        [baseSepolia.id]: http(),
        [base.id]: http(),
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

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

/** Hook to convert a Viem Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient<Config>({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}