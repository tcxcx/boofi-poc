// frontend/src/components/money-market/MoneyMarketCard.tsx

'use client';

import { useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import TransferWrapper from '@/components/money-market/transfer-wrapper';
import { TransactionHistoryItem } from '@/lib/types';
import { useTokenBalance } from '@/hooks/use-token-balance';
import { useChainSelection } from '@/hooks/use-chain-selection';
import { ChainSelect } from '@/components/chain-select';
import { BalanceDisplay } from '@/components/balance-display';
import { getUSDCAddress } from '@/lib/utils';
import { TransactionError } from '@/lib/types';

export function MoneyMarketCard() {
  const { address } = useAccount();
  const {
    currentViewTab,
    fromChain,
    toChain,
    setFromChain,
    setToChain,
    fromChains,
    toChains,
  } = useChainSelection();

  const { switchChain } = useSwitchChain();
  const [amount, setAmount] = useState('');
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistoryItem[]>([]);

  const chainId = fromChain ? Number(fromChain) : 84532;

  const usdcAddress = getUSDCAddress(chainId!);
  const usdcDecimals = 6; // USDC has 6 decimals

  const { balance: usdcBalance, isLoading: isBalanceLoading } = useTokenBalance({
    tokenAddress: usdcAddress as `0x${string}`,
    chainId: chainId!,
    accountAddress: address as `0x${string}`,
    decimals: usdcDecimals,
  });

  const transferActions = {
    lend: { functionName: 'depositCollateral', buttonText: 'Deposit USDC' },
    withdraw: { functionName: 'withdrawCollateral', buttonText: 'Withdraw USDC' },
    borrow: { functionName: 'borrow', buttonText: 'Borrow USDC' },
    repay: { functionName: 'repay', buttonText: 'Repay USDC' },
  };

  const action = transferActions[currentViewTab as keyof typeof transferActions] || {};
  const { functionName, buttonText } = action;

  const handleTransactionSuccess = (txHash: string) => {
    console.log('Transaction successful:', txHash);
    setTransactionHistory((prev) => [
      ...prev,
      {
        date: new Date().toLocaleString(),
        amount: parseFloat(amount),
        status: 'Success',
      },
    ]);
  };

  const handleTransactionError = (error: TransactionError) => {
    console.error('Transaction failed:', error);
    setTransactionHistory((prev) => [
      ...prev,
      {
        date: new Date().toLocaleString(),
        amount: parseFloat(amount),
        status: 'Failed',
      },
    ]);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col space-y-4 w-full">
        <Separator />
        <div className="flex items-center justify-between">
          <ChainSelect
            value={fromChain}
            onChange={setFromChain}
            chains={fromChains}
            label="From"
          />
          <Separator orientation="vertical" className="h-8 mx-4" />
          <ChainSelect
            value={toChain}
            onChange={setToChain}
            chains={toChains}
            label="To"
          />
        </div>
        <Separator />
        <div className="flex items-start justify-between">
          <div className="w-1/2 pr-2 pt-2">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-4xl font-bold h-16 w-full"
            />
            <BalanceDisplay
              balance={usdcBalance}
              isLoading={isBalanceLoading}
              symbol="USDC"
            />
          </div>
          <div className="w-1/2 pl-2">
            <TransferWrapper
              amount={amount}
              onSuccess={handleTransactionSuccess}
              onError={handleTransactionError}
              functionName={functionName}
              buttonText={buttonText}
            />
          </div>
        </div>
        <Separator />
      </div>
    </div>
  );
}

export default MoneyMarketCard;