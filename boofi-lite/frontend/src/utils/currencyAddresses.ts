// utils/currencyAddresses.ts
import { hubAbi } from "@/utils/abis";
import { spokeAbi } from "@/utils/abis";

export const currencyAddresses: {
  [chainId: number]: {
    USDC: {
      address: string;
      hubContract: string;
      hubABI: any;
      spokeContract: string;
      spokeABI: any;
    };
  };
} = {
  84532: { // Base Sepolia chainId as number
    USDC: {
      address: '0x036cbd53842c5426634e7929541ec2318f3dcf7e',
      hubContract: '',
      hubABI: hubAbi,
      spokeContract: '0xA8f6Db88D79bcA5F1990C93b6a6eA5866722d198',
      spokeABI: spokeAbi,
    },
  },
  43113: { // Avalanche Fuji chainId as number
    USDC: {
      address: '0x5425890298aed601595a70ab815c96711a31bc65',
      hubContract: '0x283801Dc7D4624ef155a99B0CA93f3dB58818c90',
      hubABI: hubAbi,
      spokeContract: '',
      spokeABI: spokeAbi,
    },
  },
  // Add more chains as needed
};
