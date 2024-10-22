import { hubAbi } from '@/lib/abi/Hub';
import { spokeAbi } from '@/lib/abi/Spoke';

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
  { id: 'base-sepolia', name: 'Base Sepolia', chainId: 84532, isHub: true }, // Hub
  { id: 'avax-fuji', name: 'Avalanche Fuji', chainId: 43113, isHub: false }, // Spoke
];

/**
 * @constant {ContractConfig[]} contracts
 * 
 * An array of contract configurations for the Hub and Spokes across different chains.
 */
export const contracts: ContractConfig[] = [
  {
    address: '0x1e3f1f1cA8C62aABCB3B78D87223E988Dfa3780E', // Hub Address on Base Sepolia
    abi: hubAbi,
    functionName: 'userActions', // Function to handle user actions like deposit, borrow, etc.
    args: [], // Dynamic arguments to be set based on user interactions
    chainId: 84532, // Base Sepolia (Decimal: 84532)
  },
  
  // Spoke Contract on Avalanche Fuji Testnet
  {
    address: '0x84eee5Ac39Bd10E3bD2324940206628E5174AC17', // Spoke_AvaxFuji Address
    abi: spokeAbi,
    functionName: 'userActions',
    args: [],
    chainId: 43113,
  },
];

/**
 * @constant {Object} contractsByChain
 * 
 * A mapping from chain ID to an array of contracts deployed on that chain.
 */
export const contractsByChain: { [chainId: string]: ContractConfig[] } = contracts.reduce((acc, contract) => {
  const { chainId } = contract;
  if (!acc[chainId]) {
    acc[chainId] = [];
  }
  acc[chainId].push(contract);
  return acc;
}, {} as { [chainId: string]: ContractConfig[] });
