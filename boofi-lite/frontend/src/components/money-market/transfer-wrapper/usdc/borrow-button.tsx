'use client';

import TransferWrapper from '@/components/money-market/transfer-wrapper/index';
import { TransactionError } from '@coinbase/onchainkit/transaction';

interface TransferBorrowWrapperProps {
    amount: string;
    onSuccess: (txHash: string) => void;
    onError: (error: TransactionError) => void;
}

const TransferBorrowWrapper: React.FC<TransferBorrowWrapperProps> = ({
    amount,
    onSuccess,
    onError,
}) => {
    return (
        <TransferWrapper
            amount={amount}
            onSuccess={onSuccess}
            onError={onError}
            functionName="withdrawCollateral"
            buttonText="Withdraw USDC"
        />
    );
};

export default TransferBorrowWrapper;
