// frontend/src/components/onchain-kit/TransactionWrapper.tsx

"use client";

import React from "react";
import {
  Transaction,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from "@coinbase/onchainkit/transaction";
import type {
  TransactionError,
  TransactionResponse,
} from "@coinbase/onchainkit/transaction";
import type { Address, ContractFunctionParameters } from "viem";
import { TransactionWrapperProps } from "@/lib/types";

export const TransactionWrapper: React.FC<TransactionWrapperProps> = ({
  contractAddress,
  abi,
  functionName,
  args,
  chainId,
  onSuccess,
  onError,
}) => {
  const contracts: ContractFunctionParameters[] = [
    {
      address: contractAddress,
      abi: abi,
      functionName: functionName,
      args: args,
    },
  ];

  const handleSuccess = (response: TransactionResponse) => {
    console.log("Transaction successful:", response);
    if (
      response.transactionReceipts &&
      response.transactionReceipts.length > 0
    ) {
      const firstReceipt = response.transactionReceipts[0];
      const txHash = firstReceipt.transactionHash;
      if (txHash) {
        onSuccess(txHash);
      } else {
        console.warn("Transaction hash not found in receipt.");
        onError({
          code: "NO_HASH",
          error: "Transaction hash not found.",
          message: "Unable to retrieve transaction hash.",
        });
      }
    } else {
      console.warn("No transaction receipts found.");
      onError({
        code: "NO_RECEIPT",
        error: "No transaction receipts.",
        message: "Unable to retrieve transaction receipts.",
      });
    }
  };

  const handleError = (error: TransactionError) => {
    console.error("Transaction error:", error);
    onError(error);
  };

  return (
    <Transaction
      contracts={contracts}
      chainId={chainId}
      onSuccess={handleSuccess}
      onError={handleError}
    >
      <TransactionStatus>
        <TransactionStatusLabel />
        <TransactionStatusAction />
      </TransactionStatus>
    </Transaction>
  );
};
