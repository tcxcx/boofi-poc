"use client";

import React, { useEffect, useState } from "react";
import { useMarketStore } from "@/store/marketStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Position {
  asset: string;
  amount: number;
  value: number;
  apy: number;
}

const UserPositions: React.FC = () => {
  const currentViewTab = useMarketStore((state) => state.currentViewTab);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPositions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Mock data - replace with actual API call
        const mockPositions: Position[] = currentViewTab === 'lend' || currentViewTab === 'withdraw'
          ? [
              { asset: "USDC", amount: 1000, value: 1000, apy: 5.2 },
              { asset: "ETH", amount: 0.5, value: 1250, apy: 3.8 },
            ]
          : [];
        setPositions(mockPositions);
      } catch (error) {
        console.error("Error fetching positions:", error);
        setError("Failed to load positions.");
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [currentViewTab]);

  const getBgColorClass = (tab: string) => {
    switch (tab) {
      case 'lend':
        return 'bg-blue-50 dark:bg-blue-950';
      case 'withdraw':
        return 'bg-green-50 dark:bg-green-950';
      case 'borrow':
        return 'bg-purple-50 dark:bg-purple-950';
      case 'repay':
        return 'bg-orange-50 dark:bg-orange-950';
      default:
        return 'bg-background';
    }
  };

  const renderSkeleton = () => (
    <div className={cn("rounded-lg shadow p-2 space-y-2 text-xs", getBgColorClass(currentViewTab))}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
      </div>
      <ScrollArea className="h-24 w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs"><Skeleton className="h-3 w-12" /></TableHead>
              <TableHead className="text-xs"><Skeleton className="h-3 w-12" /></TableHead>
              <TableHead className="text-xs"><Skeleton className="h-3 w-12" /></TableHead>
              <TableHead className="text-xs"><Skeleton className="h-3 w-12" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2].map((_, index) => (
              <TableRow key={index}>
                <TableCell className="text-xs"><Skeleton className="h-3 w-16" /></TableCell>
                <TableCell className="text-xs"><Skeleton className="h-3 w-16" /></TableCell>
                <TableCell className="text-xs"><Skeleton className="h-3 w-16" /></TableCell>
                <TableCell className="text-xs"><Skeleton className="h-3 w-16" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );

  if (loading) {
    return renderSkeleton();
  }

  if (error) {
    return <div className="text-xs text-red-500">{error}</div>;
  }

  return (
    <div className={cn("rounded-lg shadow p-4 space-y-4 text-xs", getBgColorClass(currentViewTab))}>
      <h2 className="text-sm font-medium text-left justify-start">Your Positions</h2>

      {positions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">You don't have any open positions.</p>
          <p className="text-gray-500">Start {currentViewTab}ing to see your positions here!</p>
        </div>
      ) : (
        <ScrollArea className="h-32 w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Asset</TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="text-xs">Value</TableHead>
                <TableHead className="text-xs">APY</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <TableRow key={position.asset}>
                  <TableCell className="text-xs">{position.asset}</TableCell>
                  <TableCell className="text-xs">{position.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-xs">${position.value.toFixed(2)}</TableCell>
                  <TableCell className="text-xs">{position.apy.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}

      <Separator />

      <div className="flex justify-between items-start">
        <div className="justify-start text-left">
          <h3 className="text-sm font-medium">Total Value</h3>
          <p className="text-xs text-muted-foreground">Across all positions</p>
        </div>
        <span className="font-bold text-2xl">
          ${positions.reduce((sum, pos) => sum + pos.value, 0).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default UserPositions;