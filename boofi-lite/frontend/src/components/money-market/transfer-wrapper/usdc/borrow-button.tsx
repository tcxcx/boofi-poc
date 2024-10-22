'use client';

import TransferWrapper from '@/components/money-market/transfer-wrapper/index';
import { TransactionError } from '@coinbase/onchainkit/transaction';

interface TransferBorrowWrapperProps {
    amount: string;
    costForReturnDelivery: string; // Ensure this is passed correctly
    onSuccess: (txHash: string) => void;
    onError: (error: TransactionError) => void;
}

const TransferBorrowWrapper: React.FC<TransferBorrowWrapperProps> = ({
    amount,
    costForReturnDelivery,
    onSuccess,
    onError,
}) => {
    return (
        <TransferWrapper
            amount={amount}
            onSuccess={onSuccess}
            onError={onError}
            functionName="borrow"
            buttonText="Borrow USDC"
            argsExtra={[costForReturnDelivery]}
        />
    );
};

export default TransferBorrowWrapper;
