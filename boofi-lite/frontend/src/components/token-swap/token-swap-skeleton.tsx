import React from 'react';

export default function TokenSwapSkeleton() {
  return (
    <div className="bg-background p-6 rounded-lg border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark animate-pulse">
      <div className="space-y-4">
        {/* Sell section */}
        <div className="mb-4 p-4 bg-background border-2 border-mainAccent rounded-md">
          <div className="flex justify-between items-center mb-2">
            <div className="h-4 w-12 bg-gray-300 rounded"></div>
            <div className="h-6 w-24 bg-gray-300 rounded"></div>
          </div>
          <div className="h-8 w-full bg-gray-300 rounded"></div>
        </div>

        {/* Swap toggle button */}
        <div className="flex justify-center">
          <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
        </div>

        {/* Buy section */}
        <div className="mb-4 p-4 bg-background border-2 border-mainAccent rounded-md">
          <div className="flex justify-between items-center mb-2">
            <div className="h-4 w-12 bg-gray-300 rounded"></div>
            <div className="h-6 w-24 bg-gray-300 rounded"></div>
          </div>
          <div className="h-8 w-full bg-gray-300 rounded"></div>
        </div>

        {/* Swap button */}
        <div className="h-12 w-full bg-gray-300 rounded"></div>

        {/* Swap message */}
        <div className="h-4 w-3/4 bg-gray-300 rounded mx-auto"></div>
      </div>
    </div>
  );
}