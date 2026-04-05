"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { WineIcon } from "lucide-react";
import { WineCard as WineCardType } from "@/lib/api";
import WineCard from "./WineCard";
import WineDetailModal from "./WineDetailModal";

interface Props {
  role: "user" | "assistant";
  content: string;
  recommendations?: WineCardType[];
}

export default function MessageBubble({ role, content, recommendations }: Props) {
  const isUser = role === "user";
  const [selectedWine, setSelectedWine] = useState<WineCardType | null>(null);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`flex gap-3 mb-6 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Avatar */}
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <WineIcon className="w-4 h-4 text-primary" />
          </div>
        )}

        {/* Content */}
        <div className={`flex flex-col gap-3 ${recommendations && recommendations.length > 0 ? "w-full" : "max-w-[80%]"} ${isUser ? "items-end" : "items-start"}`}>
          {/* Role label */}
          <span className="text-xs font-medium text-muted-foreground px-1">
            {isUser ? "You" : "VinoBuzz"}
          </span>

          {/* Message bubble */}
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-muted text-foreground rounded-tl-sm"
            }`}
          >
            {content}
          </div>

          {/* Wine recommendations */}
          {recommendations && recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="w-full"
            >
              <p className="text-xs font-medium text-muted-foreground px-1 mb-2">
                {recommendations.length} recommendation{recommendations.length > 1 ? "s" : ""} · tap to explore
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendations.map((wine, i) => (
                  <motion.div
                    key={wine.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.2 + i * 0.08 }}
                  >
                    <WineCard wine={wine} onClick={setSelectedWine} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <WineDetailModal wine={selectedWine} onClose={() => setSelectedWine(null)} />
    </>
  );
}
