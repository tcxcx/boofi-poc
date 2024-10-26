'use client';

import React from 'react';
import { Transaction, TransactionStatus, TransactionStatusLabel, TransactionStatusAction } from '@coinbase/onchainkit/transaction';
import type { TransactionError, TransactionResponse } from '@coinbase/onchainkit/transaction';
import type { ContractFunctionParameters, Address, Hex } from 'viem';
import { TransactionWrapperProps } from '@/lib/types';

type Call = {
  to: Address;
  data?: Hex;
  value?: bigint;
};

export const TransactionWrapper: React.FC<TransactionWrapperProps> = ({ chainId, onSuccess, onError, children, ...props }) => {
  const handleSuccess = (response: TransactionResponse) => {
    if (response.transactionReceipts && response.transactionReceipts.length > 0) {
      const txHash = response.transactionReceipts[0]?.transactionHash;
      if (txHash) {
        onSuccess(txHash);
      } else {
        onError({
          code: 'NO_HASH',
          error: 'Transaction hash not found.',
          message: 'Unable to retrieve transaction hash.',
        });
      }
    } else {
      onError({
        code: 'NO_RECEIPT',
        error: 'No transaction receipts.',
        message: 'Unable to retrieve transaction receipts.',
      });
    }
  };

  const handleError = (error: TransactionError) => {
    onError(error);
  };

  if ('call' in props && props.call) {
    return (
      <Transaction
        calls={[props.call]}
        chainId={chainId}
        onSuccess={handleSuccess}
        onError={handleError}
      >
        <TransactionStatus>
          <TransactionStatusLabel />
          <TransactionStatusAction />
        </TransactionStatus>
        {children}
      </Transaction>
    );
  } else if ('contractAddress' in props && props.contractAddress && props.abi && props.functionName) {
    const contracts: ContractFunctionParameters[] = [
      {
        address: props.contractAddress,
        abi: props.abi,
        functionName: props.functionName,
        args: props.args,
      },
    ];
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
        {children}
      </Transaction>
    );
  }

  return null;
};
