"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import SparklesText from "@/components/magicui/sparkles-text";
import { Separator } from "@radix-ui/react-select";
import LayoutAuthCardAiAssistant from "./layout-auth-card";
import { SkeletonGradient } from "@/components/ui/skeleton-gradient";
import {BooFiConsole } from "@/components/blockchain-assistant/boofi-ghost-card/console";

const BooFiAiAssistant: React.FC = () => {

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
        <BooFiConsole/>
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

};

export default BooFiAiAssistant;
