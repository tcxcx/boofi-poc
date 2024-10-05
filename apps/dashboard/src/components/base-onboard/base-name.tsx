import React, { useCallback, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@midday/ui/button"
import { Input } from "@midday/ui/input"
import { Save } from 'lucide-react'
import { useOnboardingStore, simulateBaseNameSetup } from '@/store/onboard'

const BaseName = () => {
  const { baseName, isLoading, walletConnected, setBaseName, setStep, setIsLoading } = useOnboardingStore()
  const [inputBaseName, setInputBaseName] = useState('')

  const handleBaseNameSetup = useCallback(async () => {
    if (!inputBaseName.trim()) return
    setIsLoading(true)
    try {
      await simulateBaseNameSetup(inputBaseName)
      setBaseName(inputBaseName)
      setStep(3)
    } catch (error) {
      console.error('Failed to set up Base name:', error)
    }
    setIsLoading(false)
  }, [inputBaseName, setIsLoading, setBaseName, setStep])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputBaseName(e.target.value)
  }, [])

  const baseNameInput = useMemo(() => (
    <div className="flex space-x-2">
      <Input
        placeholder="vitalik.eth"
        value={inputBaseName}
        onChange={handleInputChange}
        disabled={isLoading || !walletConnected}
        className="flex-grow bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500"
      />
      <Button
        onClick={handleBaseNameSetup}
        disabled={!inputBaseName.trim() || isLoading || !walletConnected}
        className="px-3 bg-blue-600 hover:bg-blue-700"
      >
        <Save className="h-4 w-4" />
        <span className="sr-only">Save Base Name</span>
      </Button>
    </div>
  ), [inputBaseName, handleInputChange, isLoading, walletConnected, handleBaseNameSetup])

  return (
    <AnimatePresence mode="wait">
      {!baseName ? (
        <motion.div
          key="setName"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 mt-4"
        >
          {baseNameInput}
        </motion.div>
      ) : (
        <motion.div
          key="nameSet"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 p-4 bg-gray-800 rounded-md border border-gray-700 shadow-lg"
        >
          <p className="text-sm text-gray-400 mb-1">Base Name Set</p>
          <p className="font-mono text-purple-400">{baseName}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BaseName