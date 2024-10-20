
'use client';

import TransferWrapper from '@/components/money-market/transfer-wrapper/index';
import { TransactionError } from '@coinbase/onchainkit/transaction';

interface TransferLoanWrapperProps {
    amount: string;
    onSuccess: (txHash: string) => void;
    onError: (error: TransactionError) => void;
}

const TransferLoanWrapper: React.FC<TransferLoanWrapperProps> = ({
    amount,
    onSuccess,
    onError,
}) => {
    return (
        <TransferWrapper
            amount={amount}
            onSuccess={onSuccess}
            onError={onError}
            functionName="depositCollateral"
            buttonText="Repay Loan"
        />
    );
};

export default TransferLoanWrapper;
