import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SelectPaymentSkeleton = () => {
  return (
    <div className="flex flex-col items-center w-full p-4 h-screen">
      <div className="flex flex-col w-full max-w-2xl space-y-6">
        <div className="flex w-full h-auto flex-col justify-between rounded-2xl border bg-background p-4">
          {/* Preset Amount Buttons Skeleton */}
          <Skeleton className="w-full h-12 mb-4" />
          
          {/* Chain Selector Skeleton */}
          <Skeleton className="w-full h-10 mb-4" />
          
          {/* Recipient Input Skeleton */}
          <Skeleton className="w-full h-10 mb-4" />
          
          {/* Currency Displayer Skeleton */}
          <Skeleton className="w-full h-10 mb-4" />
          
          {/* Transaction Button Skeleton */}
          <Skeleton className="w-full h-12 mt-4" />
        </div>
      </div>
    </div>
  );
};

export default SelectPaymentSkeleton;
