"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Red wine for a romantic dinner, budget HKD 300",
  "Sparkling wine for a housewarming under HKD 400",
  "Light white wine to pair with seafood",
  "Full-bodied red from France, budget HKD 500",
  "Rosé for a summer BBQ under HKD 250",
  "Gift bottle of premium wine, budget HKD 800",
];

interface Props {
  onSelect: (text: string) => void;
}

export default function WineSuggestions({ onSelect }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Toggle button — matches Perplexity "Show suggestions" */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors select-none"
      >
        <span>Show suggestions</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDownIcon className="w-4 h-4" />
        </motion.span>
      </button>

      {/* Suggestions grid */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden w-full"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: i * 0.04 }}
                  onClick={() => onSelect(s)}
                  className={cn(
                    "text-left px-4 py-2.5 rounded-xl border border-border bg-card",
                    "text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-accent/50",
                    "transition-colors duration-150 leading-snug"
                  )}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
