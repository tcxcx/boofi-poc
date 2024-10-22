'use client';

import TransferWrapper from '@/components/money-market/transfer-wrapper/index';
import { TransactionError } from '@coinbase/onchainkit/transaction';

interface TransferDepositWrapperProps {
    amount: string;
    costForReturnDelivery: string;
    onSuccess: (txHash: string) => void;
    onError: (error: TransactionError) => void;
}

const TransferLoanWrapper: React.FC<TransferDepositWrapperProps> = ({
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
            functionName="depositCollateral"
            buttonText="Deposit USDC"
            argsExtra={[costForReturnDelivery]}
        />
    );
};

export default TransferLoanWrapper;
