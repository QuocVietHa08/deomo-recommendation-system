"use client";
import { motion } from "framer-motion";
import { PlusIcon, MessageSquareIcon, WineIcon, ChevronLeftIcon, ShoppingBagIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatSession } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

interface Props {
  sessions: ChatSession[];
  activeSessionId: string;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

function groupSessions(sessions: ChatSession[]) {
  const groups: Record<string, ChatSession[]> = {};
  for (const s of sessions) {
    const label = formatDate(s.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(s);
  }
  return groups;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  collapsed,
  onToggle,
}: Props) {
  // Only show sessions that have at least one user message
  const savedSessions = sessions.filter((s) =>
    s.messages.some((m) => m.role === "user")
  );
  const groups = groupSessions(savedSessions);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 56 : 260 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen bg-[hsl(var(--sidebar-bg))] border-r border-border overflow-hidden flex-shrink-0"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-4 pb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <WineIcon className="w-4 h-4 text-primary" />
          </div>
          <motion.span
            animate={{ opacity: collapsed ? 0 : 1 }}
            transition={{ duration: 0.15 }}
            className="font-semibold text-sm text-foreground whitespace-nowrap overflow-hidden pointer-events-none"
          >
            VinoBuzz
          </motion.span>
        </div>

        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronLeftIcon className="w-4 h-4" />
          </motion.div>
        </button>
      </div>

      {/* New Chat button */}
      <div className="px-2 pb-1">
        <button
          onClick={onNewChat}
          className={cn(
            "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <PlusIcon className="w-4 h-4 flex-shrink-0" />
          <motion.span
            animate={{ opacity: collapsed ? 0 : 1 }}
            transition={{ duration: 0.15 }}
            className="whitespace-nowrap overflow-hidden pointer-events-none"
          >
            New Chat
          </motion.span>
        </button>
      </div>

      {/* Store link */}
      <div className="px-2 pb-2">
        <Link
          href="/store"
          className={cn(
            "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/store"
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          <ShoppingBagIcon className="w-4 h-4 flex-shrink-0" />
          <motion.span
            animate={{ opacity: collapsed ? 0 : 1 }}
            transition={{ duration: 0.15 }}
            className="whitespace-nowrap overflow-hidden pointer-events-none"
          >
            Wine Store
          </motion.span>
        </Link>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
        {/* Expanded: group labels + titles */}
        <motion.div
          animate={{ opacity: collapsed ? 0 : 1 }}
          transition={{ duration: 0.15 }}
          className={cn("space-y-4", collapsed && "pointer-events-none")}
        >
          {Object.entries(groups).map(([label, group]) => (
            <div key={label}>
              <p className="px-2 mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {label}
              </p>
              <div className="space-y-0.5">
                {group.map((session) => (
                  <motion.button
                    key={session.dbId}
                    onClick={() => onSelectSession(session.dbId)}
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "w-full flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-left transition-colors group",
                      session.dbId === activeSessionId
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <MessageSquareIcon className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                    <span className="truncate flex-1 text-xs">{session.title}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Collapsed: just icons */}
        <motion.div
          animate={{ opacity: collapsed ? 1 : 0 }}
          transition={{ duration: 0.15 }}
          className={cn("space-y-1 absolute inset-x-0 px-2 pt-1", !collapsed && "pointer-events-none")}
          style={{ top: 112 }}
        >
          {savedSessions.map((session) => (
            <button
              key={session.dbId}
              onClick={() => onSelectSession(session.dbId)}
              title={session.title}
              className={cn(
                "w-full flex items-center justify-center py-2 rounded-lg transition-colors",
                session.dbId === activeSessionId
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50"
              )}
            >
              <MessageSquareIcon className="w-3.5 h-3.5" />
            </button>
          ))}
        </motion.div>
      </div>
    </motion.aside>
  );
}
