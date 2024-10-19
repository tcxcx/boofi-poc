"use client";
import React from "react";
import dynamic from "next/dynamic";

const AnimatedBackground = dynamic(
  () => import("@/components/animated-background/index"),
  { ssr: false }
);

const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative justify-center items-center mx-auto w-full lg:max-w-7xl border border-black rounded-lg overflow-hidden">
      <AnimatedBackground className="absolute top-0 left-0 w-full h-full" />
      {children}
    </div>
  );
};

export default Container;
