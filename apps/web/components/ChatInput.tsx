"use client";
import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MicIcon, Mic2Icon } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  large?: boolean;
}

export default function ChatInput({ value, onChange, onSubmit, loading, large }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTranscript = useCallback(
    (text: string) => onChange(value ? value + " " + text : text),
    [value, onChange]
  );

  const { voiceState, toggleVoice } = useVoiceInput({ onTranscript: handleTranscript });
  const isListening = voiceState === "listening";
  const voiceSupported = voiceState !== "unsupported";

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && value.trim()) onSubmit();
    }
  };

  const canSend = !loading && value.trim().length > 0;

  return (
    <div
      className={cn(
        "w-full bg-card border border-border/60 rounded-2xl",
        "shadow-sm transition-all duration-200 focus-within:shadow-md focus-within:border-border",
        isListening && "border-primary/40"
      )}
    >
      {/* Top: textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about occasion, budget, wine preferences…"
        disabled={loading}
        rows={2}
        className={cn(
          "w-full resize-none bg-transparent outline-none",
          "text-foreground placeholder:text-muted-foreground/50",
          "leading-relaxed disabled:opacity-50",
          "px-5 pt-4 pb-2",
          large ? "text-base" : "text-sm",
          "min-h-[52px] max-h-[160px]"
        )}
      />

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between px-4 pb-3 pt-1">
        {/* Left: + button */}
       <div /> 

        {/* Right: recording indicator + mic + send */}
        <div className="flex items-center gap-2">
          {isListening && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-primary"
            />
          )}

          {voiceSupported && (
            <motion.button
              type="button"
              onClick={toggleVoice}
              whileTap={{ scale: 0.88 }}
              title={isListening ? "Stop" : "Voice input"}
              className={cn(
                "flex items-center justify-center transition-colors",
                isListening ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isListening ? (
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.7, repeat: Infinity }}>
                  <Mic2Icon className="w-5 h-5" />
                </motion.div>
              ) : (
                <MicIcon className="w-5 h-5" />
              )}
            </motion.button>
          )}

          {/* Send — filled circle, dark */}
          <motion.button
            type="button"
            onClick={onSubmit}
            disabled={!canSend}
            whileTap={{ scale: 0.88 }}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
              canSend
                ? "bg-foreground text-background hover:opacity-75"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
              strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
