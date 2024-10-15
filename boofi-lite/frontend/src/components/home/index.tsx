"use client";

import React, { Suspense } from "react";
import { Translations } from "@/lib/types/translations";
import { useAccount } from "wagmi";
import { NotConnectedHome } from "../tab-content/not-connected";
import { PaymentLinkTabContent } from "../tab-content/peanut-tab";
import { Tabs, TabsContent, TabsList, TabsTriggerAlt } from "@/components/ui/tabs";
import { MoneyMarketSkeleton } from "../base-lend-borrow/money-market-skeleton";
import { Button } from "../ui/button";
import MoneyMarketTabContent from "../tab-content/money-market-tab";

interface HomeContentProps {
  translations: Translations["Home"];
}

export const HomeContent: React.FC<HomeContentProps> = ({ translations }) => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return <NotConnectedHome translations={translations} />;
  }

  return (
    <>
      <div className="w-full flex justify-center">
        <Tabs defaultValue="paymentLinks" className="w-full max-w-md">
          {/* Tabs List */}
          <TabsList className="flex justify-between w-full m-4 gap-4">
            <TabsTriggerAlt value="moneyMarket">
              <Button
                size="lg"
                className="flex items-center gap-2 w-full"
                variant="charly"
              >
                <span>Money Markets 🏦</span>
              </Button>
            </TabsTriggerAlt>
            <TabsTriggerAlt value="paymentLinks">
              <Button
                size="lg"
                className="flex items-center gap-2 w-full"
                variant="charly"
              >
                <span>Payment Links 💸</span>
              </Button>
            </TabsTriggerAlt>
          </TabsList>

          {/* Tab Content */}
          <div className="p-4 overflow-hidden flex flex-col items-center justify-center">
            <div className="relative flex flex-col items-center justify-center w-full">
              <div className="relative z-1 text-center bg-background dark:bg-background rounded-lg shadow-lg p-8 max-w-md w-full border-2 border-black dark:border-white">
                {/* Tab Content for Money Markets */}
                <TabsContent value="moneyMarket">
                  <Suspense fallback={<MoneyMarketSkeleton />}>
                    <MoneyMarketTabContent />
                  </Suspense>
                </TabsContent>

                     {/* Tab Content for Payment Links */}
                <TabsContent value="paymentLinks">
                  <Suspense fallback={<MoneyMarketSkeleton />}>
                    <PaymentLinkTabContent translations={translations} />
                  </Suspense>
                </TabsContent>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </>
  );
};
