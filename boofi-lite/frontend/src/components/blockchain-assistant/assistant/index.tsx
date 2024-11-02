"use client";

import React, { useState } from "react";
import { Chat } from "@/components/blockchain-assistant/chat";
import { useAssistantStore } from "@/store/assistantStore";
import { nanoid } from "nanoid";
import { useHotkeys } from "react-hotkeys-hook";
import BooFiGhostCard from "@/components/blockchain-assistant/boofi-ghost-card";
import type { ClientMessage } from "@/actions/ai/types";
import { Separator } from "@/components/ui/separator";

export function Assistant() {
  const [isExpanded, setExpanded] = useState(false);
  const [input, setInput] = useState<string>("");

  const { messages, addMessage, clearMessages, isOpen, setOpen } = useAssistantStore();

  const formattedMessages: ClientMessage[] = messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    display: <div>{msg.content}</div>, 
  }));

  const handleSendMessage = (update: (prevMessages: ClientMessage[]) => ClientMessage[]) => {
    const newMessage: ClientMessage = {
      id: nanoid(),
      role: "user",
      display: <div>{input}</div>,
    };
    addMessage(newMessage as any);

    const assistantResponse: ClientMessage = {
      id: nanoid(),
      role: "assistant",
      display: <div>This is a simulated response.</div>,
    };
    addMessage(assistantResponse as any);
  };

  const toggleOpen = () => setExpanded((prev) => !prev);

  const onNewChat = () => {
    clearMessages();
    setInput("");
    setExpanded(false);
  };

  useHotkeys("meta+j", () => onNewChat(), {
    enableOnFormTags: true,
  });

  useHotkeys("meta+k", () => setOpen(true), {
    enableOnFormTags: true,
  });


  return (
    <div className="flex h-screen overflow-hidden justify-center items-center bg-background">
      {/* Left panel with BooFiGhostCard */}
      <div className="w-1/4 p-4 flex items-center justify-center">
        <BooFiGhostCard />
      </div>
      <Separator orientation="vertical" className="justify-center justify-self-center items-center m-4"/>
      
      {/* Right panel with chat */}
      <div className="flex-1 w-full h-full px-10 dark:bg-background bg-background overflow-auto">
        <div className="overflow-hidden p-0 h-full w-full md:max-w-5xl md:h-3xl">
          <Chat
            messages={formattedMessages}
            submitMessage={handleSendMessage}
            onNewChat={onNewChat}
            input={input}
            setInput={setInput}
          />
        </div>
      </div>
    </div>
  );
}
