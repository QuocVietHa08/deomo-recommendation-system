"use client";
import { useRef, useEffect, useState } from "react";
import { useChat } from "@/hooks/useChat";
import MessageBubble from "./MessageBubble";
import SlotTracker from "./SlotTracker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ChatWindow() {
  const { messages, slots, loading, send } = useChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    send(text);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl h-[90vh] border rounded-2xl shadow-lg bg-background overflow-hidden">
      <div className="px-4 py-3 border-b font-semibold text-lg">VinoBuzz 🍷</div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            role={msg.role}
            content={msg.content}
            recommendations={msg.recommendations}
          />
        ))}
        {loading && (
          <p className="text-xs text-muted-foreground ml-1 mb-2">
            VinoBuzz is thinking...
          </p>
        )}
        <div ref={bottomRef} />
      </div>
      <SlotTracker slots={slots} />
      <form onSubmit={handleSubmit} className="flex gap-2 px-4 py-3 border-t">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell me about your occasion, budget, preferences..."
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
