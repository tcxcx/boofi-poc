// components/money-market/MoneyMarketCard.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import {
  Tabs,
  TabsContent,
  TabsTriggerAlt,
  TabsList,
} from "@/components/ui/tabs";
import CardSkeleton from "@/components/ui/card-skeleton";
import React from "react";
import BorrowForm from "@/components/money-market/bento-1/lend-borrow-actions/borrow-form";
import LendForm from "@/components/money-market/bento-1/lend-borrow-actions/lend-form";
import WithdrawForm from "@/components/money-market/bento-1/lend-borrow-actions/withdraw-form";
import RepayForm from "@/components/money-market/bento-1/lend-borrow-actions/repay-form";
import { useMarketStore } from "@/store/marketStore";

function MoneyMarketCard() {
  const { currentViewTab, setCurrentViewTab } = useMarketStore();

  const handleTabChange = (tab: 'borrow' | 'lend' | 'withdraw' | 'repay') => {
    setCurrentViewTab(tab);
  };

  return (
    <Tabs
      value={currentViewTab}
      onValueChange={(value: string) => handleTabChange(value as 'borrow' | 'lend' | 'withdraw' | 'repay')}
      className="flex w-full flex-col mb-2 gap-2 uppercase"
    >
      <TabsList className="gap-2">
        <TabsTriggerAlt value="borrow">
          <Button size="sm" variant="paez">
            Borrow
          </Button>
        </TabsTriggerAlt>
        <TabsTriggerAlt value="lend">
          <Button size="sm" variant="paez">
            Lend
          </Button>
        </TabsTriggerAlt>
        <TabsTriggerAlt value="withdraw">
          <Button size="sm" variant="paez">
            Withdraw
          </Button>
        </TabsTriggerAlt>
        <TabsTriggerAlt value="repay">
          <Button size="sm" variant="paez">
            Repay
          </Button>
        </TabsTriggerAlt>
      </TabsList>
      <TabsContent value="borrow" className="flex-col">
        <BorrowForm />
      </TabsContent>
      <TabsContent value="lend" className="flex-col flex-1">
        <LendForm />
      </TabsContent>
      <TabsContent value="withdraw" className="flex-col flex-1">
        <WithdrawForm />
      </TabsContent>
      <TabsContent value="repay" className="flex-col flex-1">
        <RepayForm />
      </TabsContent>
    </Tabs>
  );
}

export default function MoneyMarketTabContent() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <MoneyMarketCard />
    </Suspense>
  );
}
