"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import SparklesText from "@/components/magicui/sparkles-text";
import { BgDotFaded } from '@/components/ui/bg-dot';
import { Separator } from "@radix-ui/react-select";
const BooFiAiAssistant: React.FC = () => {
  const MotionLink = motion(Link);

  const handleLogin = () => {
    // Implement login functionality for BooFi premium here
    console.log("Logging in to BooFi premium...");
  };

  return (
    <div className="bg-gradient-to-b from-pink-100 via-purple-100 to-indigo-100 dark:from-pink-900 dark:via-purple-900 dark:to-indigo-900 rounded-lg p-4 shadow-lg max-w-xs mx-auto group">
      <div className="flex flex-col items-center text-center">
   
        <div className="flex justify-center group">
          <MotionLink
            href="/"
            whileHover={{ scale: 1.15, rotate: 4 }}
            whileTap={{ scale: 1.05, rotate: 2 }}
          >
            <div className="flex items-center">
              <SparklesText>
                <Image
                  src="/images/ai-boofi.png"
                  alt="AI Assistant"
                  width={100}
                  height={100}
                />
              </SparklesText>{" "}
              <span className="absolute mt-28 sm:mt-20 z-100 opacity-0 group-hover:opacity-100 group-hover:-rotate-12  transition-all duration-300">
                <span className="inline-block font-clash bg-gradient-to-r text-3xl from-indigo-300 via-purple-400 to-cyan-300 bg-clip-text text-transparent my-4 pt-2">
                  Assistant
                </span>{" "}
              </span>
            </div>
          </MotionLink>
        </div>
        <Separator className="h-6 mb-2" />
        <p className="text-gray-600 dark:text-gray-300 text-xs font-nupower mb-4">
          Unlock AI-driven financial insights with BooFi premium. Get personalized advice and strategies.
        </p>
  
      </div>
    </div>
  );
};

export default BooFiAiAssistant;