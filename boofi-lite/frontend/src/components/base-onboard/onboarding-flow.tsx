'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useOnboardingStore } from '@/store/onboard';
import StepItem from './step-item';
import { BlackCreateWalletButton } from './black-create-wallet-button';
import { useAccount } from 'wagmi';
import { Identity, Avatar, Name, Badge, Address } from '@coinbase/onchainkit/identity';
import { useConditionalName } from '@/hooks/use-conditional-name';
import { base } from 'viem/chains';
import { useRouter } from 'next/navigation';

export default function OnboardingFlow() {
  const { step, walletConnected, setStep, setWalletConnected, setWalletAddress } = useOnboardingStore();
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [baseName, setBaseName] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const router = useRouter();

  // Custom hook to fetch the base name for the connected wallet
  const { data: name, isLoading: nameIsLoading, error: nameError } = useConditionalName(
    { address },
    { cacheTime: 50 * 60 * 1000 }
  );

  // Handle wallet connection
  useEffect(() => {
    if (isConnected && address && address.startsWith('0x')) {
      setWalletConnected(true);
      setWalletAddress(address);
      setStep(2); // Move to the next step
    }
  }, [isConnected, address, setWalletConnected, setWalletAddress, setStep]);

  // Handle basename fetching and redirection
  useEffect(() => {
    if (!nameIsLoading && name && name !== '0x0000000000000000000000000000000000000000') {
      setBaseName(name);
      setStep(3); // Move to the verification step
    } else if (!nameIsLoading && !name && address && address.startsWith('0x')) {
      setError('No basename detected. Please configure your base name.');
      // Redirect to Base Name setup
      window.open('https://www.base.org/names', '_blank');
    }

    if (nameError) {
      setError('Failed to fetch base name. Please try again.');
    }
  }, [name, nameIsLoading, nameError, address, setStep]);

  // Refresh or listen to changes to detect when a base name is set
  useEffect(() => {
    const interval = setInterval(() => {
      // Re-fetch the base name every 10 seconds to check for updates
      if (!nameIsLoading && !name && address && address.startsWith('0x')) {
        window.location.reload(); // Or use a more refined refresh mechanism
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [name, nameIsLoading, address]);

  // Mark onboarding as complete when base name is set
  useEffect(() => {
    if (walletConnected && baseName) {
      setIsComplete(true);
    }
  }, [walletConnected, baseName]);

  // Reset onboarding flow
  const resetOnboarding = useCallback(() => {
    setStep(1);
    setWalletConnected(false);
    setWalletAddress('');
    setBaseName(null);
    setIsComplete(false);
    setError(null);
  }, [setStep, setWalletConnected, setWalletAddress]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Welcome Onboard
        </h1>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="relative">
          <div className="absolute left-8 top-0 h-full w-0.5 bg-gradient-to-b from-blue-500 to-purple-600 opacity-20" aria-hidden="true"></div>

          <div className="relative z-10 space-y-12">
            <StepItem
              step={1}
              title="Connect Your Wallet"
              isCompleted={walletConnected}
              isActive={step === 1}
            >
              <BlackCreateWalletButton />
            </StepItem>

            <StepItem
              step={2}
              title="Verify Your Identity"
              isCompleted={!!baseName}
              isActive={step === 2}
            >
              {walletConnected && address && (
                <Identity
                  address={address as `0x${string}`}
                  chain={base}
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
              )}
              {nameIsLoading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-400">Verifying On-chain Identity...</span>
                </div>
              )}
              {!nameIsLoading && !name && address && address.startsWith('0x') && (
                <div className="text-center p-4 bg-yellow-800 bg-opacity-20 rounded-lg">
                  <p className="text-yellow-400">
                    No base name detected. Please configure your base name.
                  </p>
                </div>
              )}
            </StepItem>
          </div>
        </div>

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mt-12"
          >
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
              All Set!
            </h2>
            <Button 
              onClick={() => router.push('/dashboard')} // Or your desired dashboard path
              className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <ArrowRight className="mr-2 h-4 w-4" /> Go To Dashboard
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
