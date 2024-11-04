import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CurrencyDisplayerSkeleton = () => {
  return (
    <div className="flex flex-col items-center w-full">
      <Skeleton className="w-full h-10 mb-2" />
      <Skeleton className="w-1/2 h-6" />
    </div>
  );
};

export default CurrencyDisplayerSkeleton;
