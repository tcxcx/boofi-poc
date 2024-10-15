"use client";

import React, { useState } from "react";
import { useAccount, useChainId, useBalance } from "wagmi";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { currencyAddresses } from "@/utils/currencyAddresses";
import { TransactionWrapper } from "@/components/onchain-kit/TransactionWrapper";
import { HandCoins } from "lucide-react"; // Ensure you have this icon
import { formatCurrency } from "@/utils/formatCurrency";
import { CurrencyInfo } from "@/lib/types";

export default function LendForm() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address, chainId });
  const { toast } = useToast();

  const [lendAmount, setLendAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("USDC");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const availableTokens = currencyAddresses[chainId] || {};

  const handleLend = () => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (!lendAmount || parseFloat(lendAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid lend amount.",
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
      title: "Lend Successful",
      description: `You have lent ${lendAmount} ${selectedToken}.`,
    });
  };

  const handleTransactionError = (error: any) => {
    setIsSubmitting(false);
    toast({
      title: "Lend Failed",
      description: error.message || "An error occurred during lending.",
      variant: "destructive",
    });
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex items-center mb-4">
        <HandCoins className="w-8 h-8 text-indigo-400" />
        <h2 className="ml-2 text-2xl font-semibold text-gray-700">Lend Funds</h2>
      </div>

      <div className="mb-4">
        <label className="block text-gray-600 mb-2">Select Token</label>
        <select
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-green-300"
        >
          {Object.keys(availableTokens).map((token) => (
            <option key={token} value={token}>
              {token}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-600 mb-2">Amount to Lend</label>
        <div className="flex items-center">
          <input
            type="number"
            value={lendAmount}
            onChange={(e) => setLendAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border rounded-l-md focus:outline-none focus:ring focus:border-green-300"
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
        onClick={handleLend}
        disabled={isSubmitting}
        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200"
      >
        {isSubmitting ? "Processing..." : "Lend"}
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
            (availableTokens[selectedToken] as CurrencyInfo).lendContract as `0x${string}`
          } // Ensure this exists
          abi={
            (availableTokens[selectedToken] as CurrencyInfo).lendABI
          } // Ensure this exists
          functionName="lend" // Adjust based on your contract
          args={[parseFloat(lendAmount)]}
          chainId={chainId}
          onSuccess={handleTransactionSuccess}
          onError={handleTransactionError}
        />
      )}
    </div>
  );
}
