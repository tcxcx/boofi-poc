import { HubAbi } from "@/utils/abis";
import { SpokeAbi } from "@/utils/abis";

export const currencyAddresses: {
  [chainId: string]: {
    USDC: {
      address: string;
      hubContract: string;
      hubABI: any;
      spokeContract: string;
      spokeABI: any;
    };
  };
} = {
  'base-sepolia': {
    USDC: {
      address: '0x036cbd53842c5426634e7929541ec2318f3dcf7e',
      hubContract: '0xHubContractAddressOnBaseSepolia',
      hubABI: HubAbi,
      spokeContract: '0xSpokeContractAddressOnBaseSepolia',
      spokeABI: SpokeAbi,
    },
  },
  'avax-fuji': {
    USDC: {
      address: '0xAnotherUSDCAddressOnAvaxFuji',
      hubContract: '0xHubContractAddressOnAvaxFuji',
      hubABI: HubAbi,
      spokeContract: '0xSpokeContractAddressOnAvaxFuji',
      spokeABI: SpokeAbi,
    },
  },
  // Add more chains as needed
};
