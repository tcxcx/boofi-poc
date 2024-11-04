import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ChainSelectSkeleton = () => {
  return (
    <div className="flex-1 flex items-center space-x-2 m-auto gap-4 justify-around">
      <div className="text-xs text-gray-500 uppercase">{/* Label Placeholder */}</div>
      <div className="min-w-[230px] w-[230px] max-w-[230px] m-auto">
        <Skeleton className="w-full h-10" />
      </div>
    </div>
  );
};

export default ChainSelectSkeleton;
