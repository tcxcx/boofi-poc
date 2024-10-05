import React, { useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@midday/ui/button";
import { Wallet, Loader2 } from 'lucide-react'
import { useOnboardingStore, simulateWalletConnection } from '@/store/onboard'

const ConnectWallet = () => {
  const { walletConnected, walletAddress, isLoading, setWalletConnected, setWalletAddress, setStep, setIsLoading } = useOnboardingStore()

  const handleWalletConnection = useCallback(async () => {
    setIsLoading(true)
    try {
      const address = await simulateWalletConnection()
      setWalletConnected(true)
      setWalletAddress(address)
      setStep(2)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
    setIsLoading(false)
  }, [setIsLoading, setWalletConnected, setWalletAddress, setStep])

  const connectWalletButton = useMemo(() => (
    <Button
      onClick={handleWalletConnection}
      disabled={isLoading}
      className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:scale-105"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wallet className="mr-2 h-4 w-4" />
      )}
      {isLoading ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  ), [handleWalletConnection, isLoading])

  return (
    <AnimatePresence mode="wait">
      {!walletConnected ? (
        <motion.div
          key="connect"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {connectWalletButton}
        </motion.div>
      ) : (
        <motion.div
          key="connected"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 p-4 bg-gray-800 rounded-md border border-gray-700 shadow-lg"
        >
          <p className="text-sm text-gray-400 mb-1">Wallet Connected</p>
          <p className="font-mono text-blue-400">{walletAddress}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ConnectWallet