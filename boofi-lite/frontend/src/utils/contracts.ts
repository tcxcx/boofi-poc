import { hubAbi } from "@/lib/abi/Hub";
import { spokeAbi } from "@/lib/abi/Spoke";

/**
 * @interface ChainConfig
 * Defines the structure for each chain configuration.
 */
export interface ChainConfig {
  id: string;
  name: string;
  chainId: number; // Decimal chain ID as string
  isHub: boolean;
}

/**
 * @interface ContractConfig
 * Defines the structure for each contract configuration.
 */
export interface ContractConfig {
  address: string;
  abi: any;
  functionName: string;
  args: any[];
  chainId: number;
}

/**
 * @constant {ChainConfig[]} chains
 *
 * An array of chain configurations indicating whether each chain is a hub or a spoke.
 */
export const chains: ChainConfig[] = [
  { id: "base-sepolia", name: "Base Sepolia", chainId: 84532, isHub: false }, // Hub
  { id: "avax-fuji", name: "Avalanche Fuji", chainId: 43113, isHub: true }, // Spoke
];

/**
 * @constant {ContractConfig[]} contracts
 *
 * An array of contract configurations for the Hub and Spokes across different chains.
 */
export const contracts: ContractConfig[] = [
  {
    address: "0x1e3f1f1cA8C62aABCB3B78D87223E988Dfa3780E", // Hub Address on Base Sepolia
    abi: hubAbi,
    functionName: "userActions", // Function to handle user actions like deposit, borrow, etc.
    args: [], // Dynamic arguments to be set based on user interactions
    chainId: 84532, // Base Sepolia (Decimal: 84532)
  },

  // Spoke Contract on Avalanche Fuji Testnet
  {
    address: "0x84eee5Ac39Bd10E3bD2324940206628E5174AC17", // Spoke_AvaxFuji Address
    abi: spokeAbi,
    functionName: "userActions",
    args: [],
    chainId: 43113,
  },
];

/**
 * @constant {Object} contractsByChain
 *
 * A mapping from chain ID to an array of contracts deployed on that chain.
 */
export const contractsByChain: { [chainId: string]: ContractConfig[] } =
  contracts.reduce((acc, contract) => {
    const { chainId } = contract;
    if (!acc[chainId]) {
      acc[chainId] = [];
    }
    acc[chainId].push(contract);
    return acc;
  }, {} as { [chainId: string]: ContractConfig[] });

export const wormHoleContracts: {
  [chainId: string]: {
    networkName: string;
    CrossChainSender: string;
    wormholeChainId: number;
    CrossChainReceiver: string;
  };
} = {
  "43113": {
    networkName: "Avalanche testnet fuji",
    CrossChainSender: "0x39E052d2e4B0805d56f26292C44eDFA0173C8E4C",
    wormholeChainId: 6,
    CrossChainReceiver: "0x84f597AEcC19925070974c8EeDAa38E535430c5e", ////base receiver
  },
  "14": {
    networkName: "Celo Testnet",
    CrossChainReceiver: "0x7B8447D7B75A9EFA03715B50eB68a92424a9EF71",
    wormholeChainId: 14,
    CrossChainSender: "0xF1c8C021558b93c00e13795E6F23529cD289446C",
  },
  "84532": {
    networkName: "Sepolia - Base",
    CrossChainReceiver: "0x88Ab79411cDc6A17cA1D8233A505FC4d41BC7f80",
    wormholeChainId: 10004,
    CrossChainSender: "0x30F396A426036dA0b2346185d3c1a19D78f86F13", /// avalanche sender
  },
};

export const getWormHoleContractsByNetworkName = ({
  chainId,
}: {
  chainId: string;
}) => {
  return wormHoleContracts[chainId];
};
