
import { CurrencyInfo } from "@/lib/types";

export const currencyAddresses: Record<number, Record<string, string | CurrencyInfo>> = {
  84532: {
    // Base Sepolia (Hub)
    USDC: {
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC address on Base Sepolia
      hubContract: "0xHubContractAddress",
      hubABI: [/* Hub ABI */],
    },
  },
  11155420: {
    // Optimism Sepolia (Spoke)
    USDC: {
      address: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
      spokeContract: "0xSpokeContractAddress",
      spokeABI: [/* Spoke ABI */],
    },
  },
  11155111: {
    // Ethereum Sepolia (Spoke)
    USDC: {
      address: "0x45Df5e83B9400421cb3B262b31ee7236b61219D5",
      spokeContract: "0xSpokeContractAddress",
      spokeABI: [/* Spoke ABI */],
    },
  },
  43113: {
    // Avalanche Fuji (Spoke)
    USDC: {
      address: "0xAvalancheFujiUSDCAddress",
      spokeContract: "0xSpokeContractAddress",
      spokeABI: [/* Spoke ABI */],
    },
  },
};
