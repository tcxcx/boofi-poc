'use client';

import TransferWrapper from '@/components/money-market/transfer-wrapper/index';
import { TransactionError } from '@coinbase/onchainkit/transaction';

interface TransferWithdrawWrapperProps {
    amount: string;
    costForReturnDelivery: string;
    onSuccess: (txHash: string) => void;
    onError: (error: TransactionError) => void;
    unwrap: boolean;
}

const TransferWithdrawWrapper: React.FC<TransferWithdrawWrapperProps> = ({
    amount,
    costForReturnDelivery,
    onSuccess,
    onError,
    unwrap,
}) => {
    return (
        <TransferWrapper
            amount={amount}
            onSuccess={onSuccess}
            onError={onError}
            functionName="withdrawCollateral"
            buttonText="Withdraw USDC"
            argsExtra={[costForReturnDelivery, unwrap]}
        />
    );
};

export default TransferWithdrawWrapper;
