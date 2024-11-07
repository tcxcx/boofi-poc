"use client";

import React, { Suspense, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import MobileMenu from "./mobile-menu";
// import LocalSwitcher from "@/components/locale-switcher";
import { ModeToggle } from "@/components/theme-toggle";
import { useWindowSize } from "@/hooks/use-window-size";
import SparklesText from "@/components/magicui/sparkles-text";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount } from "wagmi";
import {
  Identity,
  Avatar,
  Name,
  Badge,
  Address,
} from "@coinbase/onchainkit/identity";
import { BlackCreateWalletButton } from "../base-onboard/black-create-wallet-button";
import { useConditionalName } from "@/hooks/use-conditional-name";
import { baseSepolia } from "viem/chains";

const Header: React.FC = () => {
  const { width } = useWindowSize();
  const MotionLink = motion(Link);

  const { address, isConnected } = useAccount();

  return (
    <header className="bg-transparent relative pb-6">
      <div className="container mx-auto grid grid-cols-3 items-center">
        {/* Left Section */}
        <div className="flex items-center space-x-2">
          <Suspense fallback={<Skeleton className="h-4 w-[250px]" />}>
            <ModeToggle />
            {/* <LocalSwitcher /> */}
          </Suspense>
          <span className="h-px flex-1 bg-black"></span>
        </div>

        {/* Center Logo Section */}
        <div className="flex justify-center group">
          <MotionLink
            href="/"
            whileHover={{ scale: 1.15, rotate: 4 }}
            whileTap={{ scale: 1.05, rotate: 2 }}
          >
            <div className="flex items-center">
              <SparklesText>
                <Image src="/appicon.png" alt="Logo" width={100} height={100} />
              </SparklesText>{" "}
              <span className="absolute mt-28 sm:mt-20 z-100 opacity-0 group-hover:opacity-100 group-hover:-rotate-12  transition-all duration-300">
                <span className="inline-block font-clash bg-gradient-to-r text-3xl from-indigo-300 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
                  BooFi
                </span>{" "}
              </span>
            </div>
          </MotionLink>
        </div>

        {/* Right Section (Wallet Info or Mobile Menu) */}
        <div className="flex items-center justify-end">
          <span className="h-px flex-grow bg-black"></span>

          <Suspense fallback={<Skeleton className="h-4 w-[250px]" />}>
            {width && width >= 1024 ? (
              // Show identity info if wallet is connected
              isConnected && address ? (
                <Identity
                  address={address as `0x${string}`}
                  chain={baseSepolia}
                >
                  <div className="flex items-center space-x-4 bg-gray-800 p-4 rounded-lg">
                    <Avatar />
                    <div>
                      <Name className="text-lg font-semibold">
                        <Badge />
                      </Name>
                      <Address />
                    </div>
                  </div>
                </Identity>
              ) : (
                // If no wallet is connected, show MobileMenu or a connect button
                <BlackCreateWalletButton />
              )
            ) : (
              // Fallback to MobileMenu on smaller screens
              <MobileMenu />
            )}
          </Suspense>
        </div>
      </div>
    </header>
  );
};

export default Header;
