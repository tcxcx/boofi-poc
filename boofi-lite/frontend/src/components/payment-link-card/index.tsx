"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsTriggerAlt,
  TabsList,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import CardSkeleton from "@/components/ui/card-skeleton";
import LinkForm from "@/components/forms/link/index";
import ClaimForm from "@/components/forms/claim-form";
import { usePaymentStore } from "@/store/paymentStore";

function PaymentLinkContent() {
  const { currentPaymentTab, setCurrentPaymentTab } = usePaymentStore();
  const [claimId, setClaimId] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const linkParam = searchParams.get("link");
    if (linkParam) {
      setCurrentPaymentTab("receive");
      setClaimId(linkParam);
    }
  }, [searchParams, setCurrentPaymentTab]);

  const handleTabChange = (tab: 'send' | 'receive') => {
    setCurrentPaymentTab(tab);
  };

  return (
    <Tabs
      defaultValue="send"
      value={currentPaymentTab}
      onValueChange={(value: string) => handleTabChange(value as 'send' | 'receive')}
      className="flex w-full flex-col mb-2 gap-2 uppercase"
    >
      <TabsList className="gap-2">
        <TabsTriggerAlt value="send">
          <Button size="sm" variant="paez" tabValue="send" storeType="payment">
            Send
          </Button>
        </TabsTriggerAlt>
        <TabsTriggerAlt value="receive">
          <Button size="sm" variant="paez" tabValue="receive" storeType="payment">
            Receive
          </Button>
        </TabsTriggerAlt>
      </TabsList>
      <TabsContent value="send" className="flex-col">
        <LinkForm />
      </TabsContent>
      <TabsContent value="receive" className="flex-col flex-1">
        <ClaimForm claimId={claimId} />
      </TabsContent>
    </Tabs>
  );
}

export default function PaymentLink() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <PaymentLinkContent />
    </Suspense>
  );
}