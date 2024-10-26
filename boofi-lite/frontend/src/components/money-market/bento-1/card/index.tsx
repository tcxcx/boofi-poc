'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance, useSwitchChain } from 'wagmi';
import { Address } from 'viem';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/utils/formatCurrency';
import { useMarketStore } from '@/store/marketStore';
import { Separator } from '@/components/ui/separator';
import { currencyAddresses } from '@/utils/currencyAddresses';
import { getFromChains, getToChains } from '@/utils/chainMarket';
import { chains } from '@/utils/contracts';
import TransferWrapper from '@/components/money-market/transfer-wrapper/index';
import { TransactionHistoryItem } from '@/lib/types';

export function MoneyMarketCard() {
  const { address } = useAccount();
  const { currentViewTab } = useMarketStore();
  const { switchChain } = useSwitchChain();
  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState<string>('');
  const [toChain, setToChain] = useState<string>('');
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistoryItem[]>([]);

  useEffect(() => {
    // Set default fromChain and toChain based on current view tab
    const fromChains = getFromChains(currentViewTab, chains);
    const toChains = getToChains(currentViewTab, chains);
    
    // Set the first available chains as defaults if they exist
    setFromChain(fromChains[0]?.id || '');
    setToChain(toChains[0]?.id || '');
  }, [currentViewTab]);

  const usdcAddress = currencyAddresses[Number(fromChain)]?.USDC?.address || '';
  const { data: balance } = useBalance({ address, token: usdcAddress as Address });

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
      { date: new Date().toLocaleString(), amount: parseFloat(amount), status: 'Success' },
    ]);
  };

  const handleTransactionError = (error: Error) => {
    console.error('Transaction failed:', error);
    setTransactionHistory((prev) => [
      ...prev,
      { date: new Date().toLocaleString(), amount: parseFloat(amount), status: 'Failed' },
    ]);
  };

  const handleButtonClick = async () => {
    try {
      await switchChain({ chainId: Number(fromChain) });
    } catch (error) {
      console.error('Failed to switch chain:', error);
    }
  };

  const renderChainOption = (chainId: string) => {
    const token = getTokenByChain(chainId);
    const chain = chains.find((c) => c.id === chainId);
    return (
      <div className="flex items-center space-x-2">
        <img
          src={token.image || ''}
          alt={token.symbol}
          className="h-6 w-6 rounded-full"
        />
        <span className="font-clash text-sm">{chain?.name}</span>
      </div>
    );
  };

  const getTokenByChain = (chainId: string) => {
    switch (chainId) {
      case 'base-sepolia':
        return { symbol: 'BS', image: '' };
      case 'avax-fuji':
        return { symbol: 'AF', image: '' };
      default:
        return { symbol: 'ETH', image: '' };
    }
  };

  const renderFromToSection = () => {
    const fromChains = getFromChains(currentViewTab, chains);
    const toChains = getToChains(currentViewTab, chains);

    return (
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center space-x-2">
          <span className="text-xs text-gray-500 uppercase">From</span>
          <Select value={fromChain} onValueChange={setFromChain}>
            <SelectTrigger className="w-auto flex items-center">
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent>
              {fromChains.map((chain) => (
                <SelectItem key={chain.id} value={chain.id}>
                  {renderChainOption(chain.id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Separator orientation="vertical" className="h-8 mx-4" />
        <div className="flex-1 flex items-center space-x-2 justify-end">
          <span className="text-xs text-gray-500 uppercase">To</span>
          <Select value={toChain} onValueChange={setToChain}>
            <SelectTrigger className="w-auto flex items-center">
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent>
              {toChains.map((chain) => (
                <SelectItem key={chain.id} value={chain.id}>
                  {renderChainOption(chain.id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col space-y-4 w-full">
        <Separator />
        {renderFromToSection()}
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
            <span className="text-sm text-gray-500 mt-2 block justify-start text-left">
              BALANCE: {formatCurrency(Number(balance?.formatted ?? 0))} USDC
            </span>
          </div>
          <div className="w-1/2 pl-2">
            <TransferWrapper
              amount={amount}
              onSuccess={handleTransactionSuccess}
              onError={(error) => handleTransactionError(error as any)}
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
