'use client'

import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ActionBanner() {
    const [isVisible, setIsVisible] = useState(true)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false)
        }, 20000)

        return () => clearTimeout(timer)
    }, [])

    const handleClose = () => {
        setIsVisible(false)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-bl from-pink-300 via-purple-300 to-indigo-400 opacity-50 blur-xl dark:bg-gradient-to-r dark:from-gray-700 dark:via-gray-900 dark:to-black"></div>
                    <div className="relative z-10 px-3 py-2 flex items-center justify-between backdrop-blur-md bg-white/10">
                        <Link
                            href="https://discord.gg/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex-1 flex items-center justify-center gap-2 text-background no-underline transition-all duration-300 rounded-lg py-1 mr-10"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            aria-label="Join our Discord community"
                        >
                            <motion.div
                                animate={{ rotate: isHovered ? 360 : 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 fill-current"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M20.317 4.3698a19.7913 19.7913 0 00-4.8859-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2763-3.68-.2763-5.4868 0-.1636-.3934-.4058-.8742-.6177-1.2495a.077.0770 0 00-.0785-.037 19.7363 19.7363 0 00-4.8859 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5795.0996 18.0578a.0824.0824 0 00.0312.0561c2.0527 1.5027 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.0760 0 00-.0416-.1047c-.6528-.2476-1.2733-.5495-1.8722-.8923a.077.0770 0 01-.0076-.1287c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.0770 0 01-.0066.1287 12.2986 12.2986 0 01-1.8733.8914.0758.0758 0 00-.0407.1057c.3608.698.7723 1.3628 1.225 1.9932a.076.0760 0 00.0842.0286c1.961-.6067 3.9495-1.5268 6.0022-3.0294a.078.0780 0 00.0312-.0561c.5004-5.177-.8382-9.657-3.5485-13.6604a.061.0610 0 00-.0312-.0286zM8.02 15.3312c-1.1837 0-2.1532-1.0857-2.1532-2.419 0-1.3332.9555-2.4189 2.1532-2.4189 1.2108 0 2.1733 1.0974 2.1532 2.419 0 1.3332-.9555 2.4189-2.1532 2.4189zm7.9748 0c-1.1837 0-2.1532-1.0857-2.1532-2.419 0-1.3332.9555-2.4189 2.1532-2.4189 1.2108 0 2.1733 1.0974 2.1532 2.419 0 1.3332-.9424 2.4189-2.1532 2.4189Z"
                                        fill="sky"
                                    />
                                </svg>
                            </motion.div>

                            <p className="font-clash text-xs text-center transition-transform duration-300 ease-in-out group-hover:scale-105">
                                <span className="inline-block font-clash bg-gradient-to-r from-indigo-300 via-purple-400 to-cyan-300 bg-clip-text text-transparent mx-4">
                                    Join our thriving community on Discord. Connect, learn, and grow with us!
                                </span>
                            </p>

                            <motion.div
                                animate={{ x: isHovered ? 5 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <svg viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M10.9497 1.56716L15.7542 6.3806L-3.76766e-07 6.3806L-2.78905e-07 8.6194L15.7542 8.6194L10.9497 13.4328L12.514 15L20 7.5L12.514 4.06671e-07L10.9497 1.56716Z"
                                        fill="cyan"
                                    />
                                </svg>
                            </motion.div>
                        </Link>
                        <button
                            onClick={handleClose}
                            className="ml-2 text-white opacity-75 hover:opacity-100 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                            aria-label="Close banner"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="black">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}