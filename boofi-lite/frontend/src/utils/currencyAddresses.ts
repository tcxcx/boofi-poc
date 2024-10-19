import { CurrencyInfo } from "@/lib/types";
import HubAbi from "@/lib/abi/Hub.json";
import SpokeAbiAvaxFuji from "@/lib/abi/Spoke.json";

export const currencyAddresses: Record<number, Record<string, string | CurrencyInfo>> = {
  84532: {
    // Base Sepolia (Hub)
    USDC: {
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      hubContract: "0xHubContractAddress", 
      hubABI: HubAbi as any,
    },
  },
  43113: {
    // Avalanche Fuji (Spoke)
    USDC: {
      address: "0xAvalancheFujiUSDCAddress",
      spokeContract: "0xSpokeContractAddress", 
      spokeABI: SpokeAbiAvaxFuji as any,
    },
  },
};
