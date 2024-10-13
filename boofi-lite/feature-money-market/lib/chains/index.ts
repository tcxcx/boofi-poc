import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Chain } from "viem/chains";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BLOCKSCOUT_EXPLORERS: Record<number, string> = {
  1: "https://eth.blockscout.com",
  10: "https://optimism.blockscout.com",
  420: "https://optimism-sepolia.blockscout.com",
  42220: "https://celo.blockscout.com",
  44787: "https://alfajores.blockscout.com",
  8453: "https://base.blockscout.com",
  84532: "https://base-sepolia.blockscout.com",
  34443: "https://mode.blockscout.com",
  919: "https://mode-testnet.blockscout.com",
  11155111: "https://sepolia.blockscout.com",
};

export function getBlockExplorerUrl(chain: Chain): string {
  return (
    BLOCKSCOUT_EXPLORERS[chain.id] || chain.blockExplorers?.default.url || ""
  );
}

export function getBlockExplorerUrlByChainId(chainId: number): string {
  return BLOCKSCOUT_EXPLORERS[chainId] || "";
}
