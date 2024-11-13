"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode, useState } from "react";
import { Config, WagmiProvider, State } from "wagmi";
import { useWagmiConfig } from "@/lib/wagmi/wagmi";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { GlobalWalletExtension } from "@dynamic-labs/global-wallet";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";


type Props = { children: ReactNode, initialState?: State };

const queryClient = new QueryClient();


function OnchainProviders({ children, initialState }: Props) {
  const wagmiConfig = useWagmiConfig();

  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID as string,
        walletConnectors: [EthereumWalletConnectors],
        walletConnectorExtensions: [GlobalWalletExtension],
      }}
    >
      <WagmiProvider config={wagmiConfig as Config} initialState={initialState}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            {children}
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}

export default OnchainProviders;
