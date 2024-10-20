// src/components/money-market/transfer-wrapper/usdc/withdraw-button.tsx

'use client';

import TransferWrapper from '@/components/money-market/transfer-wrapper/index';
import { TransactionError } from '@coinbase/onchainkit/transaction';

interface TransferWithdrawWrapperProps {
    amount: string;
    onSuccess: (txHash: string) => void;
    onError: (error: TransactionError) => void;
}

const TransferWithdrawWrapper: React.FC<TransferWithdrawWrapperProps> = ({
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

export default TransferWithdrawWrapper;
