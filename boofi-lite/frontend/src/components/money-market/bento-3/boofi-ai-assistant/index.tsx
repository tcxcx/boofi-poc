"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import SparklesText from "@/components/magicui/sparkles-text";
import { Separator } from "@radix-ui/react-select";
import LayoutAuthCardAiAssistant from "./layout-auth-card";
import { SkeletonGradient } from "@/components/ui/skeleton-gradient";
import BlockchainAssistant from "@/components/blockchain-assistant";
import AuthSubscriptionFailure from "@/components/blockchain-assistant/auth-failure";

const BooFiAiAssistant: React.FC = () => {
  const MotionLink = motion(Link);

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<'success' | 'failure' | null>(null);

  // Mock authentication function (simulate Supabase auth)
  const mockAuthenticate = (): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate a 70% chance of successful authentication
        const isSuccess = Math.random() > 0.3;
        resolve(isSuccess);
      }, 2000); // 2-second delay to simulate network request
    });
  };

  // Handle login click
  const handleLogin = async () => {
    setIsLoading(true);
    setAuthStatus(null);

    try {
      const isSuccess = await mockAuthenticate();
      if (isSuccess) {
        setAuthStatus('success');
      } else {
        setAuthStatus('failure');
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setAuthStatus('failure');
    } finally {
      setIsLoading(false);
    }
  };

  // Render based on authentication status
  if (isLoading) {
    return (
        <SkeletonGradient />
    );
  }

  if (authStatus === 'success') {
    return (
      <LayoutAuthCardAiAssistant>
        <BlockchainAssistant />
      </LayoutAuthCardAiAssistant>
    );
  }

  // if (authStatus === 'failure') {
  //   return (
  //     <LayoutAuthCardAiAssistant>
  //       <AuthSubscriptionFailure />
  //     </LayoutAuthCardAiAssistant>
  //   );
  // }

  // Default render: Login UI
  return (
    <LayoutAuthCardAiAssistant>
      <div className="flex justify-center group">
        <MotionLink
          href="#"
          whileHover={{ scale: 1.15, rotate: 4 }}
          whileTap={{ scale: 1.05, rotate: 2 }}
          onClick={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div className="flex items-center cursor-pointer">
            <SparklesText>
              <Image
                src="/images/ai-boofi.png"
                alt="AI Assistant"
                width={100}
                height={100}
              />
            </SparklesText>
            <span className="absolute mt-28 sm:mt-20 z-100 opacity-0 group-hover:opacity-100 group-hover:-rotate-12 transition-all duration-300">
              <span className="inline-block font-clash bg-gradient-to-r text-3xl from-indigo-300 via-purple-400 to-cyan-300 bg-clip-text text-transparent my-4 pt-2">
                Assistant
              </span>
            </span>
          </div>
        </MotionLink>
      </div>
      <Separator className="h-6 mb-2" />
      <p className="text-gray-600 dark:text-gray-300 text-xs font-nupower mb-4">
        Unlock AI-driven financial insights with BooFi premium. Get personalized advice and strategies.
      </p>
    </LayoutAuthCardAiAssistant>
  );
};

export default BooFiAiAssistant;
