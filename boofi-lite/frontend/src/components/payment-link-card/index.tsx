"use client";

import ClaimForm from "@/components/forms/claim-form";
import LinkForm from "@/components/forms/link-form";
import { Button } from "@/components/ui/button";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsTriggerAlt,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import CardSkeleton from "@/components/ui/card-skeleton";

function PaymentLinkContent() {
  const [activeButton, setActiveButton] = useState("send");
  const [claimId, setClaimId] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const linkParam = searchParams.get("link");
    if (linkParam) {
      setActiveButton("receive");
      setClaimId(linkParam);
    }
  }, [searchParams]);

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
  };

  return (
    <>
      <Tabs
        defaultValue="send"
        className="flex w-full flex-col mb-2 gap-2  uppercase"
      >
        <TabsList className="gap-2">
          <TabsTriggerAlt value="send">
            <Button size="sm" variant="paez">
              Send
            </Button>
          </TabsTriggerAlt>
          <TabsTriggerAlt value="receive">
            <Button size="sm" variant="paez">
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
    </>
  );
}

export default function PaymentLink() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <PaymentLinkContent />
    </Suspense>
  );
}
