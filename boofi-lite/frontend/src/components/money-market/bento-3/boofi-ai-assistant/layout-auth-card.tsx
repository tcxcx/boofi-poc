"use client";

import React from "react";

export default function LayoutAuthCardAiAssistant({ children }: { children: React.ReactNode }) {

  return (
    <div className="bg-gradient-to-b from-pink-100 via-purple-100 to-indigo-100 dark:from-gray-800 dark:via-indigo-900 dark:to-indigo-600 rounded-lg p-4 shadow-lg max-w-xl mx-auto group">
      <div className="flex flex-col items-center text-center">
          {children}
      </div>
    </div>
  );
};