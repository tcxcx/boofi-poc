"use client";

import { Suspense } from "react";
import {
  Tabs,
  TabsContent,
  TabsTriggerAlt,
  TabsList,
} from "@/components/ui/tabs";
import CardSkeleton from "@/components/ui/card-skeleton";
import { Button } from "@/components/ui/button";
import { useMarketStore } from "@/store/marketStore";
import { MoneyMarketCard } from "@/components/money-market/bento-1/card/index";

function LendBorrowActionCard() {
  const { currentViewTab, setCurrentViewTab } = useMarketStore();

  const handleTabChange = (tab: 'lend' | 'borrow' | 'withdraw' | 'repay') => {
    setCurrentViewTab(tab);
  };

  return (
    <Tabs
      defaultValue="lend"
      value={currentViewTab}
      onValueChange={(value: string) => handleTabChange(value as 'lend' | 'borrow' | 'withdraw' | 'repay')}
      className="flex w-full flex-col mb-2 gap-2 uppercase z-100"
    >
      <TabsList className="gap-2">
        <TabsTriggerAlt value="lend">
          <Button size="sm" variant="paez" tabValue="lend" storeType="market">
            Lend
          </Button>
        </TabsTriggerAlt>
        <TabsTriggerAlt value="borrow">
          <Button size="sm" variant="paez" tabValue="borrow" storeType="market">
            Borrow
          </Button>
        </TabsTriggerAlt>
        <TabsTriggerAlt value="withdraw">
          <Button size="sm" variant="paez" tabValue="withdraw" storeType="market">
            Withdraw
          </Button>
        </TabsTriggerAlt>
        <TabsTriggerAlt value="repay">
          <Button size="sm" variant="paez" tabValue="repay" storeType="market">
            Repay
          </Button>
        </TabsTriggerAlt>
      </TabsList>
      <TabsContent value={currentViewTab} className="flex-col flex-1">
        <MoneyMarketCard />
      </TabsContent>
    </Tabs>
  );
}

export default function MoneyMarketTabContent() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <LendBorrowActionCard />
    </Suspense>
  );
}