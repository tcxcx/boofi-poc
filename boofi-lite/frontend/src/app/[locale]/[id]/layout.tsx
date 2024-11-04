import React from "react";
import { ReactNode } from "react";

export const metadata = {
  title: "Receive a Payment Link to Your ENS Name with BooFiAiAssistant",
  description: "Use BooFiAiAssistant to effortlessly receive payment links tied to your ENS name. Simplify your crypto transactions with ease and security.",
};

interface PayIdLayoutProps {
  children: ReactNode;
}

const PayIdLayout: React.FC<PayIdLayoutProps> = ({ children }) => {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="p-10 overflow-hidden flex flex-col items-center justify-center w-full">
        <div className="relative flex flex-col items-center justify-center w-full">
          <div className="relative max-w-xl z-1 text-center bg-background dark:bg-background rounded-lg shadow-lg px-8 py-4 w-full border-2 border-black dark:border-white transition-all duration-300 ease-in-out">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayIdLayout;
