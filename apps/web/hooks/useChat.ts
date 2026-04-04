"use client";
import { useState, useCallback } from "react";
import { sendMessage, ChatResponse, WineCard } from "@/lib/api";

export interface Message {
  role: "user" | "assistant";
  content: string;
  recommendations?: WineCard[];
}

export function useChat() {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to VinoBuzz! I'm your AI sommelier. Tell me about the occasion, your budget, and any wine preferences.",
    },
  ]);
  const [slots, setSlots] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);

  const send = useCallback(
    async (text: string) => {
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      setLoading(true);
      try {
        const res: ChatResponse = await sendMessage(sessionId, text);
        console.log("[VinoBuzz] chat response:", res);
        setSlots(res.slots);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.reply,
            recommendations: res.recommendations,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [sessionId]
  );

  return { messages, slots, loading, send };
}
