'use client';

import { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionWrapper } from '@/components/onchain-kit/TransactionWrapper';
import { formatCurrency } from '@/utils/formatCurrency';
import { useMarketStore } from '@/store/marketStore';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Transaction {
  date: string;
  amount: number;
  status: string;
}

const chains = [
  { id: 'arbitrum', name: 'Arbitrum', chainId: 42161 },
  { id: 'optimism', name: 'Optimism', chainId: 10 },
  { id: 'base', name: 'Base', chainId: 8453 },
];

export function MoneyMarketCard() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address, token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' }); // USDC address
  const { currentViewTab } = useMarketStore();

  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState(chains[0].id);
  const [toChain, setToChain] = useState(chains[1].id);

  // Define the correct type for transaction history
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);

  const getChainId = (chainIdStr: string): number => {
    const chain = chains.find((c) => c.id === chainIdStr);
    return chain ? chain.chainId : 1;
  };

  const handleTransactionSuccess = (txHash: string) => {
    console.log('Transaction successful:', txHash);
  };

  const handleTransactionError = (error: any) => {
    console.error('Transaction failed:', error);
  };

  const renderFromToSection = () => {
    const actionLabel = currentViewTab.charAt(0).toUpperCase() + currentViewTab.slice(1);
    let fromLabel, toLabel, fromSelect, toSelect;

    switch (currentViewTab) {
      case 'lend':
        fromLabel = 'Supply from';
        toLabel = 'Supply to';
        fromSelect = true;
        toSelect = false;
        break;
      case 'withdraw':
        fromLabel = 'Withdraw from';
        toLabel = 'Withdraw to';
        fromSelect = false;
        toSelect = true;
        break;
      case 'borrow':
        fromLabel = 'Borrow from';
        toLabel = 'Borrow to';
        fromSelect = false;
        toSelect = true;
        break;
      case 'repay':
        fromLabel = 'Repay from';
        toLabel = 'Repay to';
        fromSelect = true;
        toSelect = false;
        break;
      default:
        fromLabel = `${actionLabel} from`;
        toLabel = `${actionLabel} to`;
        fromSelect = true;
        toSelect = true;
    }

    return (
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center space-x-2">
          <span className="text-sm text-gray-500 uppercase">{fromLabel}</span>
          {fromSelect ? (
            <Select value={fromChain} onValueChange={setFromChain}>
              <SelectTrigger className="w-auto">
                <SelectValue placeholder="From" />
              </SelectTrigger>
              <SelectContent>
                {chains.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id}>
                    {chain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="font-medium">{chains.find((c) => c.id === fromChain)?.name}</span>
          )}
        </div>
        <Separator orientation="vertical" className="h-8 mx-4" />
        <div className="flex-1 flex items-center space-x-2 justify-end">
          <span className="text-sm text-gray-500 uppercase">{toLabel}</span>
          {toSelect ? (
            <Select value={toChain} onValueChange={setToChain}>
              <SelectTrigger className="w-auto">
                <SelectValue placeholder="To" />
              </SelectTrigger>
              <SelectContent>
                {chains.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id}>
                    {chain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="font-medium">{chains.find((c) => c.id === toChain)?.name}</span>
          )}
        </div>
      </div>
    );
  };

  const renderTransactionHistory = () => {
    if (transactionHistory.length === 0) {
      return <div className="text-center text-gray-500 py-4">You have no {currentViewTab} history.</div>;
    }

    return (
      <ScrollArea className="h-40 w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactionHistory.map((tx, index) => (
              <TableRow key={index}>
                <TableCell>{tx.date}</TableCell>
                <TableCell>{tx.amount}</TableCell>
                <TableCell>{tx.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  };

  const renderContent = () => {
    return (
      <div className="flex flex-col space-y-4 w-full">
        {renderFromToSection()}
        <Separator />
        {currentViewTab === 'lend' ? (
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
              <TransactionWrapper
                contractAddress={'0xYourContractAddressHere' as `0x${string}`}
                abi={null}
                functionName={currentViewTab}
                args={[parseFloat(amount)]}
                chainId={getChainId(fromChain)}
                onSuccess={handleTransactionSuccess}
                onError={handleTransactionError}
              >
                <Button
                  variant="brutalism"
                  className="h-16 w-full text-lg bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                >
                  {currentViewTab.charAt(0).toUpperCase() + currentViewTab.slice(1)}
                </Button>
              </TransactionWrapper>
            </div>
          </div>
        ) : (
          renderTransactionHistory()
        )}
      </div>
    );
  };

  return <div className="w-full max-w-3xl mx-auto">{renderContent()}</div>;
}

export default MoneyMarketCard;
