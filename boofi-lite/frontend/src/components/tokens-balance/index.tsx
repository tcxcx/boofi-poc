import React from 'react';
import { Button } from "@/components/ui/button";
import { useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { toast } from "../ui/use-toast";
import type { Token } from "@/lib/types";

interface TokenBalanceDisplayProps {
    address?: `0x${string}`;
    token: Token;
    chainId: number;
    onMaxClick: (balance: number) => void;
}

export const TokenBalanceDisplay: React.FC<TokenBalanceDisplayProps> = ({
    address,
    token,
    chainId,
    onMaxClick,
}) => {
    const { data: balance, isLoading } = useBalance({
        address,
        token: token.address as `0x${string}`,
        chainId,
    });

    const handleMaxClick = () => {
        if (!balance || balance.value === 0n) {
            toast({
                title: "No balance",
                description: "You have no balance for this token",
            });
            return;
        }

        const formattedBalance = Number(formatUnits(balance.value, balance.decimals));
        onMaxClick(formattedBalance);
    };

    return (
        <div className="mx-auto mt-2 block text-xs w-full items-center justify-between">
            {isLoading ? (
                <p className="text-xs">Loading balance...</p>
            ) : (
                <>
                    <Button variant="link" className="text-xs" onClick={handleMaxClick}>
                        Available balance (Max):
                    </Button>
                    <Button variant="link" className="text-xs" onClick={handleMaxClick}>
                        {balance ? Number(formatUnits(balance.value, balance.decimals)).toFixed(3) : '0.000'} {token.symbol}
                    </Button>
                </>
            )}
        </div>
    );
};