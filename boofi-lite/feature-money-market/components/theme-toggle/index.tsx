"use client";
import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      onClick={toggleTheme}
      className="flex items-center justify-center rounded-full p-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
