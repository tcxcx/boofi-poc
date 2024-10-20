
'use client';

import TransferWrapper from '@/components/money-market/transfer-wrapper/index';
import { TransactionError } from '@coinbase/onchainkit/transaction';

interface TransferRepayWrapperProps {
  amount: string;
  onSuccess: (txHash: string) => void;
  onError: (error: TransactionError) => void;
}

const TransferRepayWrapper: React.FC<TransferRepayWrapperProps> = ({
  amount,
  onSuccess,
  onError,
}) => {
  return (
    <TransferWrapper
      amount={amount}
      onSuccess={onSuccess}
      onError={onError}
      functionName="repay"
      buttonText="Repay Loan"
    />
  );
};

export default TransferRepayWrapper;
