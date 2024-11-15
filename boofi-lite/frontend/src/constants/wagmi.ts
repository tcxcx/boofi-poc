import { createConfig } from "wagmi";
import { http } from "viem";
import { arbitrumSepolia, avalancheFuji, baseSepolia } from "viem/chains";

export const config = createConfig({
  chains: [avalancheFuji, baseSepolia, arbitrumSepolia],
  transports: {
    [avalancheFuji.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});
