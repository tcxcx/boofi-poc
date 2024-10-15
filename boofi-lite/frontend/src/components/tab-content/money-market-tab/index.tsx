
"use client";

import { Button } from "@/components/ui/button";
import { useState, Suspense } from "react";
import {
  Tabs,
  TabsContent,
  TabsTriggerAlt,
  TabsList,
} from "@/components/ui/tabs";
import CardSkeleton from "@/components/ui/card-skeleton";
import React from "react";
import BorrowForm from "@/components/money-market/borrow-form";
import LendForm from "@/components/money-market/lend-form";

function MoneyMarketCard() {
  const [activeButton, setActiveButton] = useState("borrow");

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
  };

  return (
    <>
      <Tabs
        defaultValue="borrow"
        className="flex w-full flex-col mb-2 gap-2  uppercase"
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
        </TabsList>
        <TabsContent value="borrow" className="flex-col">
          <BorrowForm />
        </TabsContent>
        <TabsContent value="lend" className="flex-col flex-1">
          <LendForm />
        </TabsContent>
      </Tabs>
    </>
  );
}

export default function MoneyMarketTabContent() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <MoneyMarketCard />
    </Suspense>
  );
}
