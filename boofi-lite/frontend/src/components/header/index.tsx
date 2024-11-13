"use client";

import React, { Suspense, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import LocalSwitcher from "@/components/locale-switcher";
import { ModeToggle } from "@/components/theme-toggle";
import { useWindowSize } from "@/hooks/use-window-size";
import { useAccount } from 'wagmi';
import LoginButton from "@/components/onchain-kit/WalletWrapper";
import SparklesText from "@/components/magicui/sparkles-text";
import { motion } from "framer-motion";
import { Skeleton } from "../ui/skeleton";
import ActionBanner from "./action-banner";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

const song = "/sounds/anime-wow-sound-effect.mp3";

const Header: React.FC = () => {
  const { width } = useWindowSize();
  const MotionLink = motion(Link);
  const { address } = useAccount();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleHoverStart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const handleHoverEnd = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <header className="bg-transparent relative pb-6">
      <ActionBanner/>
      <div className="container mx-auto grid grid-cols-3 items-center">
        <div className="flex items-center space-x-2">
          <Suspense fallback={<Skeleton className="h-4 w-[250px]" />}>
            <ModeToggle />
            <LocalSwitcher />
          </Suspense>
          <span className="h-px flex-1 bg-black"></span>
        </div>
        <div className="flex justify-center group">
          <MotionLink
            href="/"
            whileHover={{ scale: 1.15, rotate: 4 }}
            whileTap={{ scale: 1.05, rotate: 2 }}
            onHoverStart={handleHoverStart}
            onHoverEnd={handleHoverEnd}
          >
            <div className="flex items-center">
              <SparklesText>
                <Image
                  src="/images/BooFi-icon.png"
                  alt="Logo"
                  width={100}
                  height={100}
                />
              </SparklesText>
              <span className="absolute mt-28 sm:mt-20 opacity-0 group-hover:opacity-100 group-hover:-rotate-12 transition-all duration-300">
                <span className="inline-block font-clash bg-gradient-to-r text-3xl from-indigo-300 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
                  BooFi
                </span>
              </span>
            </div>
          </MotionLink>
        </div>
        <div className="flex items-center justify-end">
          <span className="h-px flex-grow bg-black"></span>
          <Suspense fallback={<Skeleton className="h-4 w-[250px]" />}>
            <div className="flex items-center gap-3 z-20">
              <DynamicWidget variant='modal' />
            </div>
          </Suspense>
        </div>
      </div>
      <audio ref={audioRef} src={song} />
    </header>
  );
};

export default Header;
