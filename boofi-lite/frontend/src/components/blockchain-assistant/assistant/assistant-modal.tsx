"use client";

import { useAssistantStore } from "@/store/assistantStore";
import { useHotkeys } from "react-hotkeys-hook";
import { Assistant } from ".";
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ArrowUpRight } from 'lucide-react'

export function AssistantModal() {
  const { isOpen, setOpen } = useAssistantStore();

  useHotkeys("meta+k", () => setOpen(!isOpen), {
    enableOnFormTags: true,
  });

  return (
  <Dialog open={isOpen} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-black" size="xs">
         Chat <ArrowUpRight className="h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="overflow-hidden max-w-full w-full h-full md:max-w-[740px] md:h-[480px] select-text"
      >
      <Assistant />
    </DialogContent>
  </Dialog>
  );
}
