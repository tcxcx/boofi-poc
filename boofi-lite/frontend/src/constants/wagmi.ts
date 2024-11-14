import { createConfig } from "wagmi";
import { http } from "viem";
import {
  mainnet,
  sepolia,
  avalancheFuji,
  baseSepolia,
  optimismSepolia,
} from "viem/chains";

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
