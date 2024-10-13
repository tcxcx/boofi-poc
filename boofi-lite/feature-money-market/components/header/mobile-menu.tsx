"use client";

import { clsx } from "clsx";
import React, { useState } from "react";
import { usePreventScroll } from "@/hooks/use-prevent-scroll";
import { Portal } from "@/components/portal";
import s from "./header.module.scss";
import { BlackCreateWalletButton } from "../base-onboard/black-create-wallet-button";

const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  usePreventScroll(isOpen);

  return (
    <>
      <button
        className={clsx(s.icon, s.burger, { [s.open as any]: isOpen })}
        onClick={toggleMenu}
        aria-pressed={isOpen}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          className="text-black dark:text-white"
        >
          <rect width="18" height="1.5" ry="0.75" x="3" y="6.25" />
          <rect width="18" height="1.5" ry="0.75" x="3" y="11.25" />
          <rect width="18" height="1.5" ry="0.75" x="3" y="16.25" />
        </svg>
      </button>
      {isOpen && (
        <Portal id="menu-modal">
          <div className={clsx(s.menuContainer, "bg-black text-white")}>
            <header className={s.header}>
              <button className={s.icon} onClick={toggleMenu}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 28 28"
                  fill="currentColor"
                  className="text-black dark:text-white"
                >
                  <path
                    d="M1 8h24v2H1z"
                    transform="matrix(0.70711,0.70711,-0.70711,0.70711,10.17156,-0.55642)"
                  ></path>
                  <line
                    x1="1"
                    y1="15"
                    x2="25"
                    y2="15"
                    strokeWidth="2"
                    transform="matrix(0.1,0,0,0.1,11.7,13.5)"
                  ></line>
                  <path
                    d="M1 20h24v2H1z"
                    transform="matrix(0.70711,-0.70711,0.70711,0.70711,-11.04174,9.34312)"
                  ></path>
                </svg>
              </button>
            </header>

            <nav className={s.menuLinksContainer}>
              <div className="flex items-center justify-center w-full space-x-2">
                <BlackCreateWalletButton />
              </div>
            </nav>
          </div>
        </Portal>
      )}
    </>
  );
};

export default MobileMenu;
