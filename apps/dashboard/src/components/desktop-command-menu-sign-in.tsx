"use client";

import { Button } from "@midday/ui/button";
import { Icons } from "@midday/ui/icons";

export function DesktopCommandMenuSignIn() {
  return (
    <div className="flex h-full flex-col">
      <Icons.Logo className="absolute top-8 left-8" />

      <div className="flex items-center w-full justify-center h-full">
        <a href="boofi://">
          <Button variant="outline">Login to BooFi</Button>
        </a>
      </div>
    </div>
  );
}
