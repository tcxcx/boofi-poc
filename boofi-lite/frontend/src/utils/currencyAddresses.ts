import { CurrencyInfo } from "@/lib/types";
import HubAbi from "@/lib/abi/Hub.json";
import SpokeAbi from "@/lib/abi/Spoke.json";

export const currencyAddresses: { [chainId: number]: { [tokenSymbol: string]: CurrencyInfo } } = {
  84532: {
    // Avalanche Fuji  (Hub)
    USDC: {
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      hubContract: "0x283801Dc7D4624ef155a99B0CA93f3dB58818c90",
      hubABI: HubAbi as any,
    },
  },
  43113: {
    // Base Fuji (Spoke)
    USDC: {
      address: "0x5425890298aed601595a70ab815c96711a31bc65",
      spokeContract: "0xA8f6Db88D79bcA5F1990C93b6a6eA5866722d198", 
      spokeABI: SpokeAbi as any,
    },
  },
};
