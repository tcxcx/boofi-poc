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

const PositionSummary: React.FC = () => {
  const currentViewTab = useMarketStore((state) => state.currentViewTab);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);

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
        setEnsName("user.eth"); // Mock ENS name - replace with actual ENS resolution
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
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-20 w-full" />
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
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-medium">Your Positions</h2>
        {ensName && <span className="text-xs text-muted-foreground">{ensName}</span>}
      </div>

      {positions.length === 0 ? (
        <div className="text-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500">No positions</p>
        </div>
      ) : (
        <ScrollArea className="h-24s w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Asset</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
                <TableHead className="text-xs text-right">Value</TableHead>
                <TableHead className="text-xs text-right">APY</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <TableRow key={position.asset}>
                  <TableCell className="text-xs font-medium">{position.asset}</TableCell>
                  <TableCell className="text-xs text-right">{position.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-right">${position.value.toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-right">{position.apy.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}

      {positions.length > 0 && (
        <>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Value</span>
            <span className="text-sm font-bold">
              ${positions.reduce((sum, pos) => sum + pos.value, 0).toFixed(2)}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default PositionSummary;