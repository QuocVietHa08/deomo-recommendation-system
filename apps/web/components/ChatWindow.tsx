"use client";
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WineIcon } from "lucide-react";
import { useChatSessions } from "@/hooks/useChat";
import MessageBubble from "./MessageBubble";
import SlotTracker from "./SlotTracker";
import Sidebar from "./Sidebar";
import ChatInput from "./ChatInput";
import WineSuggestions from "./WineSuggestions";

export default function ChatWindow() {
  const { sessions, activeSession, loading, initializing, newChat, switchSession, send } = useChatSessions();
  const [input, setInput] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const hasMessages = (activeSession?.messages?.length ?? 0) > 1;

  useEffect(() => {
    if (hasMessages) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeSession?.messages, hasMessages]);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    send(text);
  };

  const messages = activeSession?.messages ?? [];
  const slots = activeSession?.slots ?? {};

  if (initializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <WineIcon className="w-4 h-4 animate-pulse text-primary" />
          <span>Loading your conversations…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSession?.dbId ?? ""}
        onNewChat={newChat}
        onSelectSession={switchSession}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      <div className="flex flex-col flex-1 min-w-0 h-screen relative overflow-hidden">

        {/* Top bar — only in conversation mode */}
        <AnimatePresence>
          {hasMessages && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 px-6 py-4 border-b border-border/50 flex-shrink-0"
            >
              <WineIcon className="w-5 h-5 text-primary" />
              <h1 className="font-semibold text-sm text-foreground truncate">
                {activeSession?.title ?? "New Conversation"}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── HERO (empty state) — title + input + suggestions all centered ── */}
        <AnimatePresence>
          {!hasMessages && (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -16, transition: { duration: 0.2 } }}
              className="absolute inset-0 flex flex-col items-center justify-center px-6 z-10"
            >
              <div className="w-full max-w-3xl flex flex-col items-center">
                {/* Title with shimmer animation */}
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                  className="text-4xl font-bold tracking-tight mb-2 animated-title"
                >
                  VinoBuzz
                </motion.h1>

                {/* Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.18 }}
                  className="w-full"
                >
                  <ChatInput
                    value={input}
                    onChange={setInput}
                    onSubmit={handleSubmit}
                    loading={loading}
                    large
                  />
                </motion.div>

                {/* Suggestions */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.24 }}
                  className="mt-4 w-full"
                >
                  <WineSuggestions onSelect={(text) => setInput(text)} />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CONVERSATION ── */}
        <AnimatePresence>
          {hasMessages && (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="flex-1 overflow-y-auto"
            >
              <div className="max-w-3xl mx-auto px-6 py-8">
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <MessageBubble
                      key={i}
                      role={msg.role}
                      content={msg.content}
                      recommendations={msg.recommendations}
                    />
                  ))}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 mb-6"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <WineIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex items-center gap-1 bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={bottomRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CONVERSATION INPUT (bottom, only when chatting) ── */}
        {hasMessages && (
          <>
            <div className="max-w-3xl mx-auto w-full px-6">
              <SlotTracker slots={slots} />
            </div>
            <div className="w-full max-w-3xl mx-auto px-6 pb-5">
              <ChatInput
                value={input}
                onChange={setInput}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
