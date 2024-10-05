'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@midday/ui/button"
import { ArrowRight } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboard'
import StepItem from './step-item'
import ConnectWallet from './connect-wallet'
import BaseName from './base-name'

export default function OnboardingFlow() {
  const { step, walletConnected, baseName, setStep, setWalletConnected, setWalletAddress, setBaseName } = useOnboardingStore()
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (walletConnected && baseName) {
      setIsComplete(true)
    }
  }, [walletConnected, baseName])

  const resetOnboarding = useCallback(() => {
    setStep(1)
    setWalletConnected(false)
    setWalletAddress('')
    setBaseName('')
    setIsComplete(false)
    setError(null)
  }, [setStep, setWalletConnected, setWalletAddress, setBaseName])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Welcome Onboard</h1>
        
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
              <ConnectWallet />
            </StepItem>

            <StepItem
              step={2}
              title="Set Your Base Name"
              isCompleted={!!baseName}
              isActive={step === 2}
            >
              <BaseName />
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
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">All Set!</h2>
            <Button 
              onClick={resetOnboarding}
              className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <ArrowRight className="mr-2 h-4 w-4" /> Go To Dashboard
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}