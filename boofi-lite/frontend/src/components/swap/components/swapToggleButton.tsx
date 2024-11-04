"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toggleSvg } from "../internal/svg/toggleSvg"
import { border, cn, pressable } from "../styles/theme"

interface SwapToggleButtonProps {
  className?: string;
  handleToggle: () => void;
}

export function SwapToggleButton({ className, handleToggle }: SwapToggleButtonProps) {
  const [isToggled, setIsToggled] = useState(false)

  const handleClick = () => {
    setIsToggled(!isToggled)
    handleToggle()
  }

  const getChainName = (chainId: string | null) => {
    // This is a placeholder. You should replace it with actual chain name mapping.
    return chainId ? `Chain ${chainId}` : 'Select Chain';
  };

  return (
    <div className="relative">
      <motion.button
        type="button"
        className={cn(
          pressable.alternate,
          border.default,
          "flex h-12 w-12 items-center justify-center",
          "rounded-lg border-4 border-solid",
          className
        )}
        data-testid="SwapTokensButton"
        onClick={handleClick}
        whileTap={{ scale: 1.15 }}
      >
        <motion.div
          animate={{
            rotate: isToggled ? 180 : 0,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
        >
          {toggleSvg}
        </motion.div>
      </motion.button>
    </div>
  )
}