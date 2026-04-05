"use client";
import { motion } from "framer-motion";
import { StarIcon, MapPinIcon, TagIcon, WineIcon } from "lucide-react";
import { WineCard as WineCardType } from "@/lib/api";

interface Props {
  wine: WineCardType;
  onClick?: (wine: WineCardType) => void;
}

export default function WineCard({ wine, onClick }: Props) {
  return (
    <motion.div
      onClick={() => onClick?.(wine)}
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="w-full rounded-xl border border-border bg-card p-4 cursor-pointer select-none"
    >
      <div className="flex items-start gap-3">
        {/* Bottle image or fallback */}
        {wine.thumb_url ? (
          <img
            src={wine.thumb_url}
            alt={wine.name}
            className="w-10 h-14 object-contain flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-14 flex items-center justify-center bg-muted/40 rounded flex-shrink-0">
            <WineIcon className="w-5 h-7 text-muted-foreground" />
          </div>
        )}
        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm text-card-foreground leading-tight truncate">
              {wine.name}
            </p>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-sm font-bold text-foreground">
                HKD {wine.price_hkd.toLocaleString()}
              </span>
              {wine.score && (
                <div className="flex items-center gap-1 bg-primary/10 rounded-full px-2 py-0.5">
                  <StarIcon className="w-3 h-3 text-primary fill-primary" />
                  <span className="text-xs font-semibold text-primary">{wine.score}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <MapPinIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground truncate">
              {wine.region}, {wine.country}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <TagIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground">{wine.type}</p>
          </div>
          {wine.tasting_notes && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
              {wine.tasting_notes}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
