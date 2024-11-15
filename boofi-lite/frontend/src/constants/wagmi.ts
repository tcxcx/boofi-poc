import {
  mainnet,
  sepolia,
  avalancheFuji,
  baseSepolia,
  optimismSepolia,
} from "viem/chains";
import { useMemo } from "react";
import { http, useConnectorClient, Config, createConfig } from "wagmi";
import { providers } from "ethers";
import type { Account, Chain, Client, Transport } from "viem";

export const config = createConfig({
  chains: [mainnet, sepolia, avalancheFuji, baseSepolia, optimismSepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [avalancheFuji.id]: http(),
    [baseSepolia.id]: http(),
    [optimismSepolia.id]: http(),
  },
});


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
