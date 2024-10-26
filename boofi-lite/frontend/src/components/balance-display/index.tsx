
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/utils/formatCurrency';
import { BalanceDisplayProps } from '@/lib/types';


export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ balance, isLoading, symbol }) => {
  return (
    <span className="text-sm text-gray-500 mt-2 block justify-start text-left">
      BALANCE:
      {isLoading ? (
        <Skeleton className="inline-block ml-2 h-4 w-16" />
      ) : (
        `${formatCurrency(Number(balance))} ${symbol}`
      )}
    </span>
  );
};
