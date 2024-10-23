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
import { parseUnits, encodeFunctionData } from 'viem';
import { spokeAbi } from '@/utils/abis';
import type { Abi, Address, Hex } from 'viem';
import { chains } from '@/utils/contracts';
import { currencyAddresses } from '@/utils/currencyAddresses';
import type { TransferWrapperProps, ValidFunctionNames } from '@/lib/types';

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
    if (!chain) {
        console.error("Chain 'Base Sepolia' not found in chains configuration.");
        return null;
    }

    const chainId = chain.chainId;

    // Retrieve spoke contract address
    const spokeContract = currencyAddresses[chainId]?.USDC?.spokeContract;
    if (!spokeContract) {
        console.error(`Spoke contract address for chain ID ${chainId} not found.`);
        return null;
    }

    const assetAddress = currencyAddresses[chainId].USDC.address as Address;
    const assetAmount = parseUnits(amount || '0', 6);

    // Ensure that the costForReturnDelivery is calculated properly
    let costForReturnDelivery: bigint | undefined;
    if (argsExtra.length > 0 && argsExtra[0]) {
        costForReturnDelivery = BigInt(parseUnits(argsExtra[0].toString(), 18).toString());
    }

    // Encode function data for the contract call
    const encodedData = encodeFunctionData({
        abi: spokeAbi,
        functionName: functionName,
        args: [assetAddress, assetAmount, costForReturnDelivery || 0n],
    });

    const calls = [{
        to: spokeContract as Hex,
        data: encodedData,
        value: costForReturnDelivery || 0n,
    }];

    return (
        <div className="flex w-full">
            <Transaction
                chainId={chainId}
                calls={calls}
                onError={onError}
                onSuccess={(response: TransactionResponse) => {
                    const transactionHash = response?.transactionReceipts?.[0]?.transactionHash;
                    if (transactionHash) {
                        onSuccess(transactionHash);
                    }
                }}
            >
                <TransactionButton
                    text={buttonText}
                    className='bg-clr-blue text-black dark:text-black hover:bg-blue-600/80 border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none'
                />
                <TransactionStatus>
                    <TransactionStatusLabel />
                    <TransactionStatusAction />
                </TransactionStatus>
            </Transaction>
        </div>
    );
};

export default TransferWrapper;
