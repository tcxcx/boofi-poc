"use client";

import React, { useState } from "react";
import { Chat } from "@/components/blockchain-assistant/chat";
import { useAssistantStore } from "@/store/assistantStore";
import { nanoid } from "nanoid";
import { Header } from "./header";
import { useHotkeys } from "react-hotkeys-hook";
import BooFiGhostCard from "@/components/blockchain-assistant/boofi-ghost-card";
import type { ClientMessage } from "@/actions/ai/types";

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
    <div className="flex h-screen overflow-hidden">
      {/* Left panel with BooFiGhostCard */}
      <div className="w-1/4 p-4 bg-gray-100 dark:bg-gray-800">
        <div className="flex flex-col items-center">
          <BooFiGhostCard />
        </div>
      </div>

      {/* Right panel with chat */}
      <div className="flex-1 w-full h-full px-10 dark:bg-background bg-white overflow-auto">
        <div className="overflow-hidden p-0 h-full w-full md:max-w-[760px] md:h-[480px]">
          <Header toggleSidebar={toggleOpen} isExpanded={isExpanded} />

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
