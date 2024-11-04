import { useCallback, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

type CopiedValue = string | null;

type CopyFn = (text: string) => Promise<boolean>;

export function useCopyToClipboard(): [CopiedValue, CopyFn] {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);
  const { toast } = useToast();

  const copy: CopyFn = useCallback(async (text) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      toast({
        title: "Clipboard Not Supported",
        description: "Your browser does not support clipboard operations.",
        variant: "destructive",
      });
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      toast({
        title: "Copied to Clipboard",
        description: "The text has been successfully copied.",
      });
      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      setCopiedText(null);
      toast({
        title: "Copy Failed",
        description: "Failed to copy the text. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  return [copiedText, copy];
}
