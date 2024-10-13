import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";
import {
  useBlockExplorerLink,
  HashType,
} from "@/hooks/use-block-explorer-link";
import { Chain } from "viem/chains";

interface TransactionToastProps {
  transactionHash: string;
  chain: Chain;
}

export const TransactionToast: React.FC<TransactionToastProps> = ({
  transactionHash,
  chain,
}) => {
  const { toast } = useToast();
  const explorerLink = useBlockExplorerLink(
    chain,
    transactionHash,
    HashType.Transaction
  );

  React.useEffect(() => {
    if (!transactionHash) return;

    toast({
      title: "Transaction Sent",
      description: `Transaction hash: ${transactionHash}`,
      action: (
        <ToastAction
          altText="View Transaction"
          onClick={() => window.open(explorerLink, "_blank")}
        >
          <span>See on Blockscout</span>
          <ArrowUpOnSquareIcon className="h-5 w-5" />
        </ToastAction>
      ),
    });
  }, [transactionHash, explorerLink, toast]);

  return null;
};
