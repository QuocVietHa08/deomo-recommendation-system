"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  WineIcon,
  FilterIcon,
  StarIcon,
  MapPinIcon,
  TagIcon,
  CheckIcon,
  XIcon,
  PackageOpenIcon,
  SearchIcon,
  ShoppingBagIcon,
  Loader2Icon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchWines, WineCard, WineFilters } from "@/lib/api";
import { cn } from "@/lib/utils";
import WineDetailModal from "@/components/WineDetailModal";

// ─── Constants ────────────────────────────────────────────────────────────────
const WINE_TYPES = ["Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified"];

const PRICE_PRESETS = [
  { label: "Any", min: undefined, max: undefined },
  { label: "Under 500", min: undefined, max: 500 },
  { label: "500–1,000", min: 500, max: 1000 },
  { label: "1,000–3,000", min: 1000, max: 3000 },
  { label: "3,000+", min: 3000, max: undefined },
];

// ─── Animation variants ───────────────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ─── Store Wine Card ──────────────────────────────────────────────────────────
function StoreWineCard({ wine, index, onClick }: { wine: WineCard; index: number; onClick: () => void }) {
  return (
    <motion.div
      layout
      layoutId={`wine-card-${wine.id}`}
      variants={cardVariants}
      initial="hidden"
      animate="show"
      transition={{ delay: Math.min(index % 12, 8) * 0.05 }}
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
      onClick={onClick}
      className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden cursor-pointer"
    >
      {wine.score && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-primary text-primary-foreground rounded-full px-2.5 py-1 text-xs font-bold shadow-md">
          <StarIcon className="w-3 h-3 fill-current" />
          {wine.score}
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative h-44 bg-gradient-to-b from-muted/60 to-muted/20 flex items-center justify-center overflow-hidden">
        {wine.thumb_url ? (
          <motion.img
            src={wine.thumb_url}
            alt={wine.name}
            className="h-36 object-contain drop-shadow-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          />
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <WineIcon className="w-16 h-16 text-primary/30" />
          </motion.div>
        )}
        <span className="absolute bottom-2 left-3 rounded-full bg-background/90 backdrop-blur-sm border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
          {wine.type}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3 className="font-semibold text-sm text-card-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {wine.name}
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPinIcon className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
            {wine.region}, {wine.country}
          </span>
        </div>
        {wine.tasting_notes && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {wine.tasting_notes}
          </p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-border/50">
          <span className="text-base font-bold text-foreground">
            HKD {wine.price_hkd.toLocaleString()}
          </span>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <TagIcon className="w-3 h-3" />
            Ask AI
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Filter pill ──────────────────────────────────────────────────────────────
function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
      )}
    >
      {active && <CheckIcon className="w-3 h-3" />}
      {children}
    </motion.button>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      <div className="h-44 bg-muted animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
        <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function StorePage() {
  const pathname = usePathname();

  const [wines, setWines] = useState<WineCard[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [priceIndex, setPriceIndex] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [search, setSearch] = useState("");

  const [selectedWine, setSelectedWine] = useState<WineCard | null>(null);

  // Sentinel ref for IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Build filter object from state
  const buildFilters = useCallback((): WineFilters => {
    const preset = PRICE_PRESETS[priceIndex];
    return {
      type: selectedType,
      min_price: preset.min,
      max_price: preset.max,
      in_stock: inStockOnly || undefined,
    };
  }, [selectedType, priceIndex, inStockOnly]);

  // Reset and load page 1 whenever filters change
  useEffect(() => {
    let cancelled = false;
    setInitialLoading(true);
    setError(null);
    setWines([]);
    setPage(1);
    setHasMore(true);

    fetchWines(buildFilters(), 1)
      .then((data) => {
        if (cancelled) return;
        setWines(data.items);
        setTotal(data.total);
        setHasMore(data.has_more);
        setPage(2);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? "Failed to load wines");
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [buildFilters]);

  // Load next page
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchWines(buildFilters(), page);
      setWines((prev) => [...prev, ...data.items]);
      setHasMore(data.has_more);
      setPage((p) => p + 1);
    } catch (e: any) {
      setError(e.message ?? "Failed to load more wines");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, buildFilters]);

  // IntersectionObserver watches the sentinel div at the bottom
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  // Client-side search on already-loaded wines
  const filtered = wines.filter((w) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.region.toLowerCase().includes(q) ||
      w.country.toLowerCase().includes(q) ||
      w.type.toLowerCase().includes(q)
    );
  });

  const hasActiveFilters = selectedType || priceIndex !== 0 || inStockOnly;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* ── Filter sidebar ─────────────────────────────────────────────────── */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-64 flex-shrink-0 h-screen flex flex-col border-r border-border bg-[hsl(var(--sidebar-bg))] overflow-y-auto"
      >
        {/* Brand + nav */}
        <div className="px-4 pt-5 pb-4 border-b border-border/50">
          <Link href="/chat" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <WineIcon className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-sm text-foreground">VinoBuzz</span>
          </Link>
          <nav className="space-y-0.5">
            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              💬 AI Sommelier
            </Link>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs bg-accent text-foreground font-medium">
              <ShoppingBagIcon className="w-3.5 h-3.5" />
              Wine Store
            </div>
          </nav>
        </div>

        {/* Filters */}
        <div className="flex-1 px-4 py-5 space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
            <FilterIcon className="w-3.5 h-3.5" />
            Filters
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Wine Type</p>
            <div className="flex flex-wrap gap-1.5">
              <FilterPill active={!selectedType} onClick={() => setSelectedType(undefined)}>
                All
              </FilterPill>
              {WINE_TYPES.map((t) => (
                <FilterPill
                  key={t}
                  active={selectedType === t}
                  onClick={() => setSelectedType(selectedType === t ? undefined : t)}
                >
                  {t}
                </FilterPill>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Price (HKD)</p>
            <div className="flex flex-col gap-1.5">
              {PRICE_PRESETS.map((p, i) => (
                <FilterPill key={p.label} active={priceIndex === i} onClick={() => setPriceIndex(i)}>
                  {p.label}
                </FilterPill>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Availability</p>
            <FilterPill active={inStockOnly} onClick={() => setInStockOnly((v) => !v)}>
              In Stock Only
            </FilterPill>
          </div>

          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                onClick={() => {
                  setSelectedType(undefined);
                  setPriceIndex(0);
                  setInStockOnly(false);
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <XIcon className="w-3 h-3" /> Reset filters
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center justify-between px-8 py-5 border-b border-border/50 bg-background/80 backdrop-blur-sm flex-shrink-0"
        >
          <div>
            <h1 className="text-xl font-bold text-foreground">Wine Collection</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {initialLoading
                ? "Loading…"
                : `${total} wine${total !== 1 ? "s" : ""} · showing ${filtered.length}`}
            </p>
          </div>

          {/* Search */}
          <div className="relative w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, region…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Grid + infinite scroll */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {initialLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} delay={i * 0.04} />
              ))}
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full gap-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XIcon className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setInitialLoading(true);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Try again
              </button>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full gap-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <PackageOpenIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">No wines match your filters</p>
              <p className="text-sm text-muted-foreground">Try adjusting filters or search terms</p>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((wine, i) => (
                  <StoreWineCard key={wine.id} wine={wine} index={i} onClick={() => setSelectedWine(wine)} />
                ))}
              </div>

              {/* Sentinel — watched by IntersectionObserver */}
              <div ref={sentinelRef} className="h-1" />

              {/* Loading spinner for next page */}
              <AnimatePresence>
                {loadingMore && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center py-8"
                  >
                    <Loader2Icon className="w-6 h-6 text-primary animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* End of list */}
              {!hasMore && wines.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-xs text-muted-foreground py-8"
                >
                  You've seen all {total} wines ·{" "}
                  <Link href="/chat" className="text-primary hover:underline">
                    Ask AI for recommendations
                  </Link>
                </motion.p>
              )}
            </>
          )}
        </div>
      </div>

      <WineDetailModal wine={selectedWine} onClose={() => setSelectedWine(null)} />
    </div>
  );
}
