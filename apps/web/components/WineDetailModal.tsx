"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XIcon,
  StarIcon,
  MapPinIcon,
  TagIcon,
  WineIcon,
  UtensilsIcon,
  CalendarIcon,
} from "lucide-react";
import { WineCard as WineCardType } from "@/lib/api";

interface Props {
  wine: WineCardType | null;
  onClose: () => void;
}

export default function WineDetailModal({ wine, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    if (!wine) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [wine, onClose]);

  return (
    <AnimatePresence>
      {wine && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Centering container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
          {/* Panel */}
          <motion.div
            key={`detail-${wine.id}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="w-full sm:w-[480px] bg-card border border-border shadow-2xl overflow-hidden flex flex-col rounded-2xl pointer-events-auto"
            style={{ maxHeight: "80vh" }}
          >
            {/* Header image / fallback */}
            <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
              {wine.thumb_url ? (
                <img
                  src={wine.thumb_url}
                  alt={wine.name}
                  className="h-36 object-contain drop-shadow-lg"
                />
              ) : (
                <WineIcon className="w-16 h-16 text-primary/40" />
              )}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Name + price row */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-lg text-foreground leading-tight">
                    {wine.name}
                  </h2>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPinIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {wine.region}, {wine.country}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-xl font-bold text-foreground">
                    HKD {wine.price_hkd.toLocaleString()}
                  </span>
                  {wine.score && (
                    <div className="flex items-center gap-1 bg-primary/10 rounded-full px-3 py-1">
                      <StarIcon className="w-3.5 h-3.5 text-primary fill-primary" />
                      <span className="text-sm font-bold text-primary">{wine.score}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Type badge */}
              <div className="flex items-center gap-2">
                <TagIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{wine.type}</span>
                {(wine as any).variety && (
                  <span className="text-xs bg-muted rounded-full px-2 py-0.5 text-muted-foreground">
                    {(wine as any).variety}
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Tasting notes */}
              {wine.tasting_notes && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Tasting Notes
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{wine.tasting_notes}</p>
                </div>
              )}

              {/* Occasions */}
              {(wine as any).occasions?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Occasions
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(wine as any).occasions.map((o: string) => (
                      <span
                        key={o}
                        className="text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1 font-medium"
                      >
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Food pairings */}
              {(wine as any).food_pairings?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <UtensilsIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Food Pairings
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(wine as any).food_pairings.map((f: string) => (
                      <span
                        key={f}
                        className="text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
