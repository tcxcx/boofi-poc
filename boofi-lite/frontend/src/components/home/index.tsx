"use client"

import React, { Suspense, useState, useEffect } from "react"
import { Translations } from "@/lib/types/translations"
import { useAccount } from "wagmi"
import { NotConnectedHome } from "../tab-content/not-connected"
import { PaymentLinkTabContent } from "../tab-content/payments-tab"
import { Tabs, TabsContent, TabsList, TabsTriggerAlt } from "@/components/ui/tabs"
import { Button } from "../ui/button"
import MoneyMarketBentoGrid from "../money-market"
import { useTabStore } from "@/store/tabStore"
import { PaymentLinkSkeleton } from "@/components/tab-content/money-market/payment-skeleton"
import { MoneyMarketBentoSkeleton } from "@/components/tab-content/money-market/money-market-skeleton"
import { GridSmall } from "../ui/bg-dot"
import TokenSwap from "@/components/token-swap"
import TokenSwapSkeleton from "@/components/token-swap/token-swap-skeleton"
import { LottieWrapper } from "@/components/lottie-wrapper"

interface HomeContentProps {
  translations: Translations["Home"]
}

export const HomeContent: React.FC<HomeContentProps> = ({ translations }) => {
  const { isConnected } = useAccount()
  const { activeTab, setActiveTab } = useTabStore()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const address = useAccount();


  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isTransitioning])

  if (!isConnected) {
    return <NotConnectedHome translations={translations} />
  }

  const handleTabChange = (value: string) => {
    setIsTransitioning(true)
    setActiveTab(value as "paymentLink" | "moneyMarket" | "tokenSwap")
  }

  return (
    <>
      <Tabs defaultValue="moneyMarket" className="w-full max-w-5xl" onValueChange={handleTabChange}>
        <div className="flex justify-center w-full">
          <TabsList className="flex justify-center gap-4 m-4">
            <TabsTriggerAlt value="moneyMarket">
              <Button
                size="lg"
                className="flex items-center gap-2 w-full"
                variant="charly"
                tabValue="moneyMarket"
                storeType="tab"
              >
                <span>Money Markets 🏦</span>
              </Button>
            </TabsTriggerAlt>
            <TabsTriggerAlt value="paymentLink">
              <Button
                size="lg"
                className="flex items-center gap-2 w-full"
                variant="charly"
                tabValue="paymentLink"
                storeType="tab"
              >
                <span>Payments 💸</span>
              </Button>
            </TabsTriggerAlt>
            <TabsTriggerAlt value="tokenSwap">
              <Button
                size="lg"
                className="flex items-center gap-2 w-full"
                variant="charly"
                tabValue="tokenSwap"
                storeType="tab"
              >
                <span>Token Swap 🔄</span>
              </Button>
            </TabsTriggerAlt>
          </TabsList>
        </div>

        <div className="p-10 overflow-hidden flex flex-col items-center justify-center w-full">
          <div className="relative flex flex-col items-center justify-center w-full">
            <div
              className={`relative z-1 text-center bg-background dark:bg-background rounded-lg shadow-lg px-8 py-4 w-full border-2 border-black dark:border-white transition-all duration-300 ease-in-out ${
                activeTab === 'paymentLink' ? 'max-w-xl' : activeTab === 'tokenSwap' ? 'max-w-xl' : 'max-w-5xl'
              }`}
            >
              <LottieWrapper />
              {isTransitioning ? (
                activeTab === 'paymentLink' || activeTab === 'tokenSwap' ? (
                  activeTab === 'paymentLink' ? <PaymentLinkSkeleton /> : <TokenSwapSkeleton />
                ) : (
                  <MoneyMarketBentoSkeleton />
                )
              ) : (
                <>
                  <TabsContent value="moneyMarket" className="transition-opacity duration-300 ease-in-out">
                    <GridSmall>
                      <Suspense fallback={<MoneyMarketBentoSkeleton />}>
                        <MoneyMarketBentoGrid />
                      </Suspense>
                    </GridSmall>
                  </TabsContent>
                  <TabsContent value="paymentLink" className="transition-opacity duration-300 ease-in-out">
                    <Suspense fallback={<PaymentLinkSkeleton />}>
                      <PaymentLinkTabContent translations={translations} address={address?.address ?? ""} />
                    </Suspense>
                  </TabsContent>
                  <TabsContent value="tokenSwap" className="transition-opacity duration-300 ease-in-out">
                    <Suspense fallback={<TokenSwapSkeleton />}>
                      <TokenSwap/>
                    </Suspense>
                  </TabsContent>
                </>
              )}
            </div>
          </div>
        </div>
      </Tabs>
    </>
  )
}