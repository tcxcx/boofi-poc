import { ChainConfig } from './contracts';

/**
 * Determines the available "From" chains based on the selected action.
 * @param action - The selected action ("lend", "borrow", "withdraw", "repay").
 * @param chains - The array of all chain configurations.
 * @returns An array of ChainConfig objects that can be used as "From" options.
 */
export const getFromChains = (
  action: 'lend' | 'borrow' | 'withdraw' | 'repay',
  chains: ChainConfig[]
): ChainConfig[] => {
  switch (action) {
    case 'lend':
      // Supply from spokes only (isHub: false)
      return chains.filter((chain) => !chain.isHub);
    case 'borrow':
      // Borrow from hub only (isHub: true)
      return chains.filter((chain) => chain.isHub);
    case 'withdraw':
      // Withdraw from hub only (isHub: true)
      return chains.filter((chain) => chain.isHub);
    case 'repay':
      // Repay from any chain (hub or spokes)
      return chains;
    default:
      return chains;
  }
};

/**
 * Determines the available "To" chains based on the selected action.
 * @param action - The selected action ("lend", "borrow", "withdraw", "repay").
 * @param chains - The array of all chain configurations.
 * @returns An array of ChainConfig objects that can be used as "To" options.
 */
export const getToChains = (
  action: 'lend' | 'borrow' | 'withdraw' | 'repay',
  chains: ChainConfig[]
): ChainConfig[] => {
  switch (action) {
    case 'lend':
      // Supply to hub only (isHub: true)
      return chains.filter((chain) => chain.isHub);
    case 'borrow':
      // Borrow to hub or spokes (no filtering needed)
      return chains;
    case 'withdraw':
      // Withdraw to spokes only (isHub: false)
      return chains.filter((chain) => !chain.isHub);
    case 'repay':
      // Repay to hub only (isHub: true)
      return chains.filter((chain) => chain.isHub);
    default:
      return chains;
  }
};
