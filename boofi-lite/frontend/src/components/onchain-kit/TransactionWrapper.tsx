'use client';

import React from 'react';
import {
  Transaction,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from '@coinbase/onchainkit/transaction';
import type {
  TransactionError,
  TransactionResponse,
} from '@coinbase/onchainkit/transaction';
import type { ContractFunctionParameters, Abi, Address, Hex } from 'viem';
import { TransactionWrapperProps } from '@/lib/types';

type Call = {
  to: Address;
  data?: Hex;
  value?: bigint;
};

export const TransactionWrapper: React.FC<TransactionWrapperProps> = (props) => {
  const { chainId, onSuccess, onError, children } = props;

  const handleSuccess = (response: TransactionResponse) => {
    console.log('Transaction successful:', response);
    if (
      response.transactionReceipts &&
      response.transactionReceipts.length > 0
    ) {
      const firstReceipt = response.transactionReceipts[0];
      const txHash = firstReceipt.transactionHash;
      if (txHash) {
        onSuccess(txHash);
      } else {
        console.warn('Transaction hash not found in receipt.');
        onError({
          code: 'NO_HASH',
          error: 'Transaction hash not found.',
          message: 'Unable to retrieve transaction hash.',
        });
      }
    } else {
      console.warn('No transaction receipts found.');
      onError({
        code: 'NO_RECEIPT',
        error: 'No transaction receipts.',
        message: 'Unable to retrieve transaction receipts.',
      });
    }
  };

  const handleError = (error: TransactionError) => {
    console.error('Transaction error:', error);
    onError(error);
  };

  if ('call' in props && props.call) {
    // Use 'calls' prop
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
  } else if (
    'contractAddress' in props &&
    props.contractAddress &&
    props.abi &&
    props.functionName
  ) {
    // Use 'contracts' prop
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
  } else {
    console.error(
      "Either 'call' or 'contractAddress', 'abi', 'functionName' must be provided to TransactionWrapper."
    );
    return null;
  }
};
