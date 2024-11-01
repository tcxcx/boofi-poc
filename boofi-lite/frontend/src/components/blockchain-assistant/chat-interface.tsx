"use client";

import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatInterfaceProps {
  messages: Array<{ role: string, content: string }>;
  onSend: (message: string) => void;
}

export default function ChatInterface({ messages, onSend }: ChatInterfaceProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="font-semibold mb-2 text-black">Chat History</div>
      <ScrollArea className="flex-1 pr-4 mb-4 bg-gray-50 rounded-md">
        <div className="space-y-4 p-2">
          {messages.map((message: { role: string, content: string }, i: number) => (
            <div
              key={i}
              className={`p-3 rounded-lg ${
                message.role === "assistant"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-blue-50 text-blue-800"
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex gap-2">
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          className="flex-1"
        />
        <Button onClick={handleSend} variant="charly" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          Send
        </Button>
      </div>
    </div>
  );
}
