"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import SparklesText from "./sparkles-text";
import { motion } from "framer-motion";
import ActionBanner from "./action-banner";

const Header: React.FC = () => {
    const MotionLink = motion(Link);
    return (
        <header className="bg-transparent relative pb-6">
            <ActionBanner />
            <div className="absolute mx-auto grid grid-cols-3 items-center">
                <div className="flex justify-center group">
                    <MotionLink
                        href="/"
                        whileHover={{ scale: 1.15, rotate: 4 }}
                        whileTap={{ scale: 1.05, rotate: 2 }}
                    >
                        <div className="flex items-center">
                            <SparklesText>
                                <Image
                                    src="/appicon.png"
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
            </div>
        </header>
    );
};

export default Header;
