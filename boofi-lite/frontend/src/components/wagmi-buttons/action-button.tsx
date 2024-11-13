import { FC } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  BaseError,
} from 'wagmi';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { getBlockExplorerUrlByChainId } from '@/utils/blockscout-explorers';
import { WagmiActionButtonProps } from '@/lib/types';

export const WagmiActionButton: FC<WagmiActionButtonProps> = ({
  abi,
  address,
  functionName,
  args = [],
  buttonText = 'In progress...',
  loadingText = 'Loading...',
  successText = 'Success!',
  variant = 'fito',
  size = 'default',
  className,
  chainId,
  onSuccess,
  onError,
}) => {
  const {
    data: hash,
    error: writeError,
    isPending,
    writeContract
  } = useWriteContract();

  const handleTransactionSuccess = () => {
    const explorerUrl = getBlockExplorerUrlByChainId(chainId);
    toast({
      title: "Transaction Successful",
      description: (
        <div className="flex flex-col gap-2">
          <p>Your transaction has been confirmed!</p>
          {explorerUrl && hash && (
            <a
              href={`${explorerUrl}/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
            >
              View on Blockscout
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
      ),
    });
    onSuccess?.();
  };

  const handleTransactionError = (error: Error) => {
    toast({
      title: "Transaction Failed",
      description: (error as BaseError).shortMessage || error.message,
      variant: "destructive",
    });
    onError?.(error);
  };

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError
  } = useWaitForTransactionReceipt({
    hash,
    onReplaced: ({ reason, transaction, replacedTransaction }) => {
      const explorerUrl = getBlockExplorerUrlByChainId(chainId);
      const description = reason === 'cancelled'
        ? 'Transaction was cancelled.'
        : reason === 'repriced'
          ? 'Transaction gas price was adjusted.'
          : 'Transaction was replaced with a new one.';

      toast({
        title: "Transaction Updated",
        description: (
          <div className="flex flex-col gap-2">
            <p>{description}</p>
            {explorerUrl && transaction.hash && (
              <a
                href={`${explorerUrl}/tx/${transaction.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
              >
                View New Transaction
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        ),
      });
    }
  });

  // Handle successful receipt
  if (isConfirmed && hash && !receiptError) {
    handleTransactionSuccess();
  }

  // Handle receipt error
  if (receiptError) {
    handleTransactionError(receiptError);
  }

  const handleClick = async () => {
    try {
      toast({
        title: "Confirming Transaction",
        description: "Please confirm the transaction in your wallet",
      });

      await writeContract({
        address,
        abi,
        functionName,
        args,
      });
    } catch (err: unknown) {
      const error = err as BaseError;
      handleTransactionError(error);
    }
  };

  const getButtonText = () => {
    if (isPending || isConfirming) return loadingText;
    if (isConfirmed) return successText;
    return buttonText;
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={isPending || isConfirming}
        onClick={handleClick}
      >
        {getButtonText()}
      </Button>

      {(writeError || receiptError) && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {((writeError || receiptError) as BaseError).shortMessage || (writeError || receiptError)?.message}
        </p>
      )}
    </div>
  );
};