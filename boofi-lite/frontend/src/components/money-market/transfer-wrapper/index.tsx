'use client';

import {
    Transaction,
    TransactionButton,
    TransactionStatus,
    TransactionStatusAction,
    TransactionStatusLabel,
} from '@coinbase/onchainkit/transaction';
import type {
    TransactionError,
    TransactionResponse,
} from '@coinbase/onchainkit/transaction';
import type { Address, ContractFunctionParameters } from 'viem';
import { parseUnits } from 'viem';
import { HubAbi } from '@/utils/abis';
import type { Abi } from 'viem';
import { chains } from '@/utils/contracts';
import { currencyAddresses } from '@/utils/currencyAddresses';

interface TransferWrapperProps {
    amount: string;
    onSuccess: (txHash: string) => void;
    onError: (error: TransactionError) => void;
    functionName: string; // e.g., 'depositCollateral', 'withdrawCollateral', 'borrow', 'repay'
    buttonText: string;   // e.g., 'Lend USDC', 'Withdraw USDC', etc.
    argsExtra?: any[];    // Additional arguments if required by the function
}

const TransferWrapper: React.FC<TransferWrapperProps> = ({
    amount,
    onSuccess,
    onError,
    functionName,
    buttonText,
    argsExtra = [],
}) => {
    // Find the chain object for 'Base Sepolia'
    const chain = chains.find(c => c.name === 'Base Sepolia');
    const chainId = chain?.id || 'base-sepolia';

    // Retrieve spoke contract address
    const hubContract = currencyAddresses[chainId].USDC.hubContract;

    // Define the asset address and amount
    const assetAddress = currencyAddresses[chainId].USDC.address as Address;
    const assetAmount = parseUnits(amount || '0', 6);

    // Define the arguments based on the function
    let args: any[] = [assetAddress, assetAmount];
    if (argsExtra.length > 0) {
        args = [...args, ...argsExtra];
    }

    // Define the contract call parameters
    const call: ContractFunctionParameters = {
        address: hubContract as Address,
        abi: HubAbi,
        functionName: functionName,
        args: args,
    };

    return (
        <div className="flex w-full">
            <Transaction
                contracts={[call]}
                className="w-full"
                chainId={parseInt(chainId, 10)} // Ensure chainId is a number
                onError={onError}
                onSuccess={(response: TransactionResponse) => {
                    // Extract the first transaction receipt and its hash
                    const transactionHash = response?.transactionReceipts?.[0]?.transactionHash;

                    // Ensure that transactionHash is defined and pass it to onSuccess
                    if (transactionHash) {
                        onSuccess(transactionHash);
                    }
                }}
            >
                <TransactionButton text={buttonText} className='bg-clr-blue text-black dark:text-black hover:bg-blue-600/80 border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none' />
                <TransactionStatus>
                    <TransactionStatusLabel />
                    <TransactionStatusAction />
                </TransactionStatus>
            </Transaction>
        </div>
    );
};

export default TransferWrapper;
