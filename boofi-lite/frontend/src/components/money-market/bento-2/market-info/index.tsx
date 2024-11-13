'use client';

import React from "react";
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
import { cn } from "@/lib/utils";

const mockAssetData = [
  {
    assetName: "ETH",
    chains: ["Ethereum", "Arbitrum", "Optimism"],
    totalSupplied: "245",
    totalSupplyAPY: "4.2"
  },
  {
    assetName: "USDC",
    chains: ["Ethereum", "Polygon"],
    totalSupplied: "180",
    totalSupplyAPY: "3.8"
  },
  {
    assetName: "BTC",
    chains: ["Ethereum", "Arbitrum"],
    totalSupplied: "320",
    totalSupplyAPY: "3.5"
  }
];

const mockAPYData = {
  totalAPY: "12.5"
};

const MarketInfo: React.FC = () => {
  const currentViewTab = useMarketStore((state) => state.currentViewTab);

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

  return (
    <div className={cn("rounded-lg shadow p-4 space-y-4 text-xs", getBgColorClass(currentViewTab))}>
      <h2 className="text-sm font-medium text-left justify-start">Market Info</h2>

      <ScrollArea className="h-24 w-full" style={{ overflowX: 'hidden' }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Asset</TableHead>
              <TableHead className="text-xs">Chains</TableHead>
              <TableHead className="text-xs">Value</TableHead>
              <TableHead className="text-xs">APY</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAssetData.map((asset) => (
              <TableRow key={asset.assetName} className="font-nupower">
                <TableCell className="text-xs">{asset.assetName}</TableCell>
                <TableCell>
                  <div className="flex -space-x-1">
                    {asset.chains?.map((chain, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full bg-gray-300 border-2 border-background"
                        title={chain}
                      ></div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-xs">${asset.totalSupplied}K</TableCell>
                <TableCell className="text-xs">{asset.totalSupplyAPY}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <Separator />

      {/* Total APY Section */}
      <div className="flex justify-between items-start">
        <div className="justify-start text-left">
          <h3 className="text-sm font-medium">Total APY</h3>
          <p className="text-xs text-muted-foreground">w/ <span className="font-clash">BooFi</span> bonus</p>
        </div>
        <span className="font-bold bg-gradient-to-r text-4xl lg:text-5xl from-indigo-300 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
          {mockAPYData.totalAPY}
          <span className="text-xl font-clash text-muted-foreground">%</span>
        </span>
      </div>
    </div>
  );
};

export default MarketInfo;