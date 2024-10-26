import { ethers } from 'ethers';
import { MoneyMarketAction } from './action';
import { Address } from 'viem';

/**
 * Generates the arguments array for a given action.
 *
 * @param action - The money market action.
 * @param assetAddress - The address of the asset.
 * @param amount - The amount involved in the action.
 * @param costForReturnDelivery - The cost associated with the action.
 * @returns An array of arguments tailored for the smart contract function.
 */
export function generateArgs(
  action: MoneyMarketAction,
  assetAddress: Address,
  amount: string, // Human-readable amount, e.g., "100.0"
  costForReturnDelivery: bigint
): any[] {
  const assetAmount = ethers.parseUnits(amount || '0', 6); 

  switch (action) {
    case MoneyMarketAction.Lend:
      return [assetAddress, assetAmount, costForReturnDelivery];
    case MoneyMarketAction.Borrow:
      return [assetAddress, assetAmount, costForReturnDelivery];
    case MoneyMarketAction.Repay:
      return [assetAddress, assetAmount, costForReturnDelivery];
    case MoneyMarketAction.Withdraw:
      return [assetAddress, assetAmount, costForReturnDelivery];
    default:
      throw new Error(`Unsupported action: ${action}`);
  }
}
