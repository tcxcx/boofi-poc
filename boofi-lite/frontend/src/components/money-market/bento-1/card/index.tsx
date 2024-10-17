'use client';

import { useState, useEffect } from 'react';
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
import { getFromChains, getToChains } from '@/utils/chainMarket';
import { chains } from '@/utils/contracts';
import { ETHToken, USDCToken, AvaxToken, BaseSepoliaToken } from '@/utils/tokens'; // Updated token list

interface Transaction {
  date: string;
  amount: number;
  status: string;
}

export function MoneyMarketCard() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address, token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' });
  const { currentViewTab } = useMarketStore();

  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState(chains[0].id);
  const [toChain, setToChain] = useState(chains[1].id);

  // Define the correct type for transaction history
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);

  useEffect(() => {
    // Set default options for selects when the component renders
    const defaultFromChain = getFromChains(currentViewTab, chains)[0]?.id || chains[0].id;
    const defaultToChain = getToChains(currentViewTab, chains)[0]?.id || chains[0].id;

    setFromChain(defaultFromChain);
    setToChain(defaultToChain);
  }, [currentViewTab]);

  const getChainId = (chainIdStr: string): number => {
    const chain = chains.find((c) => c.id === chainIdStr);
    return chain ? parseInt(chain.chainId, 84532) : 1;
  };

  const getTokenByChain = (chainId: string) => {
    switch (chainId) {
      case 'base-sepolia':
        return BaseSepoliaToken;
      case 'avax-fuji':
        return AvaxToken;
      // Add more cases as per your chains
      default:
        return ETHToken; // Fallback token
    }
  };

  const handleTransactionSuccess = (txHash: string) => {
    console.log('Transaction successful:', txHash);
  };

  const handleTransactionError = (error: any) => {
    console.error('Transaction failed:', error);
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

  const renderFromToSection = () => {
    const fromChains = getFromChains(currentViewTab, chains);
    const toChains = getToChains(currentViewTab, chains);

    let fromLabel, toLabel;
    let fromSelect = true;
    let toSelect = true;

    switch (currentViewTab) {
      case 'lend':
        fromLabel = 'from';
        toLabel = 'to';
        toSelect = false; // "Supply To" should always be fixed to the hub (Base Sepolia)
        break;
      case 'withdraw':
        fromLabel = 'from';
        toLabel = 'to';
        fromSelect = false; // "Withdraw From" should always be fixed to the hub (Base Sepolia)
        break;
      case 'borrow':
        fromLabel = 'from';
        toLabel = 'to';
        fromSelect = false; // "Borrow From" should always be fixed to the hub (Base Sepolia)
        break;
      case 'repay':
        fromLabel = 'from';
        toLabel = 'to';
        toSelect = false; // "Repay To" should always be fixed to the hub (Base Sepolia)
        break;
      default:
        fromLabel = 'From';
        toLabel = 'To';
    }

    return (
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center space-x-2">
          <span className="text-xs text-gray-500 uppercase">{fromLabel}</span>
          {fromSelect ? (
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
          ) : (
            <div className="flex items-center space-x-2">
              {renderChainOption(fromChain)}
            </div>
          )}
        </div>
        <Separator orientation="vertical" className="h-8 mx-4" />
        <div className="flex-1 flex items-center space-x-2 justify-end">
          <span className="text-xs text-gray-500 uppercase">{toLabel}</span>
          {toSelect ? (
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
          ) : (
            <div className="flex items-center space-x-2">
              {renderChainOption(toChain)}
            </div>
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
              {/* <TransactionWrapper
                contractAddress={'0xYourContractAddressHere' as `0x${string}`}
                abi={null}
                functionName={currentViewTab}
                args={[parseFloat(amount)]}
                chainId={getChainId(fromChain)}
                onSuccess={handleTransactionSuccess}
                onError={handleTransactionError}
              > */}
                <Button
                  variant="brutalism"
                  className="h-16 w-full text-lg bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                >
                  {currentViewTab.charAt(0).toUpperCase() + currentViewTab.slice(1)}
                </Button>
              {/* </TransactionWrapper> */}
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