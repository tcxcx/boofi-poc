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
// import { fetchAssetData } from "@/hooks/use-fetch-asset-data";
import { fetchAPYData } from "@/hooks/use-fetch-apy-data";
import { Separator } from "@/components/ui/separator";
import { AssetData, APYData } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
// import { fetchAssetData } from "@/hooks/use-fetch-asset-data";

const MarketInfo: React.FC = () => {
  const currentViewTab = useMarketStore((state) => state.currentViewTab);
  const [assetData, setAssetData] = useState<AssetData[]>([]);
  const [apyData, setApyData] = useState<APYData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // const fetchedAssetData = await fetchAssetData(
        //   currentViewTab as "lend" | "withdraw" | "borrow" | "repay"
        // );
        //  const fetchedAPYData = await fetchAPYData();
        //  setAssetData(fetchedAssetData);
        // setApyData(fetchedAPYData as any);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError("Failed to load market information.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getBgColorClass = (tab: string) => {
    switch (tab) {
      case "lend":
        return "bg-blue-50 dark:bg-blue-950";
      case "withdraw":
        return "bg-green-50 dark:bg-green-950";
      case "borrow":
        return "bg-purple-50 dark:bg-purple-950";
      case "repay":
        return "bg-orange-50 dark:bg-orange-950";
      default:
        return "bg-background";
    }
  };

  const renderSkeleton = () => (
    <div
      className={cn(
        "rounded-lg shadow p-2 space-y-2 text-xs",
        getBgColorClass(currentViewTab)
      )}
    >
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
      </div>

      <ScrollArea className="h-24 w-full" style={{ overflowX: "hidden" }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">
                <Skeleton className="h-3 w-12" />
              </TableHead>
              <TableHead className="text-xs">
                <Skeleton className="h-3 w-12" />
              </TableHead>
              <TableHead className="text-xs">
                <Skeleton className="h-3 w-24" />
              </TableHead>
              <TableHead className="text-xs">
                <Skeleton className="h-3 w-24" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-hidden">
            {[1, 2, 3].map((_, index) => (
              <TableRow key={index} className="font-nupower">
                <TableCell className="text-xs">
                  <Skeleton className="h-3 w-16" />
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-1">
                    {[1, 2, 3].map((_, i) => (
                      <Skeleton
                        key={i}
                        className="w-4 h-4 rounded-full border-2 border-background"
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  <Skeleton className="h-3 w-16" />
                </TableCell>
                <TableCell className="text-xs">
                  <Skeleton className="h-3 w-12" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <Separator />

      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-5 w-24 mb-1" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );

  if (loading) {
    return renderSkeleton();
  }

  if (error) {
    return <div className="text-xs text-red-500">{error}</div>;
  }

  return (
    <div
      className={cn(
        "rounded-lg shadow p-4 space-y-4 text-xs",
        getBgColorClass(currentViewTab)
      )}
    >
      <h2 className="text-sm font-medium text-left justify-start">
        Market Info
      </h2>

      <ScrollArea className="h-24 w-full" style={{ overflowX: "hidden" }}>
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
            {assetData.map((asset: AssetData) => (
              <TableRow key={asset.assetName} className="font-nupower">
                <TableCell className="text-xs">{asset.assetName}</TableCell>
                <TableCell>
                  <div className="flex -space-x-1">
                    {asset.chains?.map((chain: string, i: number) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full bg-gray-300 border-2 border-background"
                        title={chain}
                      ></div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  ${asset.totalSupplied}K
                </TableCell>
                <TableCell className="text-xs">
                  {asset.totalSupplyAPY}%
                </TableCell>
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
          <p className="text-xs text-muted-foreground">
            w/ <span className="font-clash">BooFi</span> bonus
          </p>
        </div>
        <span className="font-bold bg-gradient-to-r text-4xl lg:text-5xl from-indigo-300 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
          {apyData?.totalAPY || 0}
          <span className="text-xl font-clash text-muted-foreground">%</span>
        </span>
      </div>
    </div>
  );
};

export default MarketInfo;
