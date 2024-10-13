// /home/tcxcx/coding_projects/Foresta/foresta-landing/src/components/locale-switcher/index.tsx
"use client";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import React, { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LocaleSwitcher() {
  const router = useRouter();
  const locale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState(locale);

  const handleLocaleChange = (value: string) => {
    setSelectedLocale(value);
    router.replace(`/${value}`);
  };

  return (
    <Select onValueChange={handleLocaleChange} value={selectedLocale}>
      <SelectTrigger className="w-fit bg-white dark:bg-foreground shadow-xl rounded-md text-indigo-600 font-bold dark:text-black">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-foreground shadow-xl rounded-md text-black dark:text-black">
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="es">Español</SelectItem>
        <SelectItem value="pt">Português</SelectItem>
      </SelectContent>
    </Select>
  );
}
