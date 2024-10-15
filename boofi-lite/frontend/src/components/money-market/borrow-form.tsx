"use client";

import React, { useState } from "react";
import { useAccount, useChainId, useBalance } from "wagmi";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { currencyAddresses } from "@/utils/currencyAddresses";
import { TransactionWrapper } from "@/components/onchain-kit/TransactionWrapper";
import { formatCurrency } from "@/utils/formatCurrency";
import { Coins } from "lucide-react";
import { CurrencyInfo } from "@/lib/types";

export default function BorrowForm() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address, chainId });
  const { toast } = useToast();

  const [borrowAmount, setBorrowAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("USDC");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const availableTokens = currencyAddresses[chainId] || {};

  const handleBorrow = () => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid borrow amount.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
  };

  const handleTransactionSuccess = (hash: string) => {
    setTransactionHash(hash);
    setIsSubmitting(false);
    toast({
      title: "Borrow Successful",
      description: `You have borrowed ${borrowAmount} ${selectedToken}.`,
    });
  };

  const handleTransactionError = (error: any) => {
    setIsSubmitting(false);
    toast({
      title: "Borrow Failed",
      description: error.message || "An error occurred during borrowing.",
      variant: "destructive",
    });
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex items-center mb-4">
        <Coins className="w-8 h-8 text-indigo-500" />
        <h2 className="ml-2 text-2xl font-semibold text-gray-700">Borrow Funds</h2>
      </div>

      <div className="mb-4">
        <label className="block text-gray-600 mb-2">Select Token</label>
        <select
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-300"
        >
          {Object.keys(availableTokens).map((token) => (
            <option key={token} value={token}>
              {token}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-600 mb-2">Amount to Borrow</label>
        <div className="flex items-center">
          <input
            type="number"
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border rounded-l-md focus:outline-none focus:ring focus:border-indigo-300"
          />
          <span className="px-3 py-2 border-t border-b border-r rounded-r-md bg-gray-100 text-gray-700">
            {selectedToken}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-600">
          Available Balance: {balance ? formatCurrency(Number(balance.formatted)) : "0"} {selectedToken}
        </p>
      </div>

      <Button
        variant={"brutalism"}
        onClick={handleBorrow}
        disabled={isSubmitting}
        className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-200"
      >
        {isSubmitting ? "Processing..." : "Borrow"}
      </Button>

      {transactionHash && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md">
          Transaction Successful!{" "}
          <a
            href={`https://etherscan.io/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View on Etherscan
          </a>
        </div>
      )}

      {/* Integrate TransactionWrapper */}
      {isSubmitting && address && (
        <TransactionWrapper
        contractAddress={
          (availableTokens[selectedToken] as CurrencyInfo).borrowContract as `0x${string}`
        }
        abi={
          (availableTokens[selectedToken] as CurrencyInfo).borrowABI
        }
         functionName="borrow" // Adjust based on your contract
          args={[parseFloat(borrowAmount)]}
          chainId={chainId}
          onSuccess={handleTransactionSuccess}
          onError={handleTransactionError}
        />
      )}
    </div>
  );
}
