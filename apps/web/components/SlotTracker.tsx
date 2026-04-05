"use client";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  slots: Record<string, unknown>;
}

const LABELS: Record<string, string> = {
  budget_hkd: "Budget",
  occasion: "Occasion",
  wine_type: "Type",
  region: "Region",
  food_pairing: "Food",
};

export default function SlotTracker({ slots }: Props) {
  const filled = Object.entries(slots).filter(([, v]) => v != null);
  if (filled.length === 0) return null;

  return (
    <div className="px-4 py-2 border-t border-border/50">
      <p className="text-xs text-muted-foreground mb-2 font-medium">Your preferences</p>
      <div className="flex flex-wrap gap-1.5">
        <AnimatePresence>
          {filled.map(([key, value]) => (
            <motion.span
              key={key}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2 }}
              className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1 font-medium"
            >
              {LABELS[key] ?? key}: {String(value)}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
