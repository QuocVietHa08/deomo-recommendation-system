"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  sendMessage,
  ChatResponse,
  WineCard,
  apiCreateSession,
  apiListSessions,
  apiSaveMessages,
  SessionRecord,
} from "@/lib/api";

export interface Message {
  role: "user" | "assistant";
  content: string;
  recommendations?: WineCard[];
}

export interface ChatSession {
  // DB row id (used for PATCH saves)
  dbId: string;
  // Redis session id (used for /api/chat)
  sessionId: string;
  title: string;
  messages: Message[];
  slots: Record<string, unknown>;
  createdAt: string;
}

const WELCOME: Message = {
  role: "assistant",
  content:
    "Welcome to VinoBuzz! I'm your AI sommelier. Tell me about the occasion, your budget, and any wine preferences.",
};

function recordToSession(r: SessionRecord): ChatSession {
  const messages: Message[] =
    r.messages.length > 0 ? (r.messages as Message[]) : [WELCOME];
  return {
    dbId: r.id,
    sessionId: r.session_id,
    title: r.title,
    messages,
    slots: {},
    createdAt: r.created_at,
  };
}

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // ── Load sessions from Supabase on mount ─────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const records = await apiListSessions();
        if (records.length > 0) {
          const loaded = records.map(recordToSession);
          setSessions(loaded);
          setActiveSessionId(loaded[0].dbId);
        } else {
          const record = await apiCreateSession("New Conversation");
          const session = recordToSession(record);
          setSessions([session]);
          setActiveSessionId(session.dbId);
        }
      } catch (err) {
        console.error("[VinoBuzz] failed to load sessions:", err);
        // Fallback: in-memory session so UI still works offline
        const fallback: ChatSession = {
          dbId: crypto.randomUUID(),
          sessionId: crypto.randomUUID(),
          title: "New Conversation",
          messages: [WELCOME],
          slots: {},
          createdAt: new Date().toISOString(),
        };
        setSessions([fallback]);
        setActiveSessionId(fallback.dbId);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  // ── Debounced persist to Supabase (per-session timer map) ────────────────
  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const persistSession = useCallback((session: ChatSession) => {
    // Only save sessions that have real user messages
    const hasUserMessages = session.messages.some((m) => m.role === "user");
    if (!hasUserMessages) return;

    if (saveTimersRef.current[session.dbId]) {
      clearTimeout(saveTimersRef.current[session.dbId]);
    }
    saveTimersRef.current[session.dbId] = setTimeout(async () => {
      try {
        await apiSaveMessages(session.dbId, session.messages, session.title);
        delete saveTimersRef.current[session.dbId];
      } catch (err) {
        console.error("[VinoBuzz] failed to save messages:", err);
      }
    }, 800);
  }, []);

  const activeSession = sessions.find((s) => s.dbId === activeSessionId) ?? sessions[0];

  // ── New chat ──────────────────────────────────────────────────────────────
  const newChat = useCallback(async () => {
    try {
      const record = await apiCreateSession("New Conversation");
      const session = recordToSession(record);
      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(session.dbId);
    } catch (err) {
      console.error("[VinoBuzz] failed to create session:", err);
    }
  }, []);

  const switchSession = useCallback((dbId: string) => {
    setActiveSessionId(dbId);
  }, []);

  // ── Send message ──────────────────────────────────────────────────────────
  const send = useCallback(
    async (text: string) => {
      if (!activeSession) return;

      const newTitle =
        activeSession.title === "New Conversation"
          ? text.slice(0, 40) + (text.length > 40 ? "…" : "")
          : activeSession.title;

      const withUser: ChatSession = {
        ...activeSession,
        title: newTitle,
        messages: [...activeSession.messages, { role: "user", content: text }],
      };
      setSessions((prev) => prev.map((s) => (s.dbId === withUser.dbId ? withUser : s)));
      setLoading(true);

      try {
        const res: ChatResponse = await sendMessage(activeSession.sessionId, text);
        console.log("[VinoBuzz] chat response:", res);

        const withReply: ChatSession = {
          ...withUser,
          slots: res.slots,
          messages: [
            ...withUser.messages,
            {
              role: "assistant",
              content: res.reply,
              recommendations: res.recommendations,
            },
          ],
        };
        setSessions((prev) => prev.map((s) => (s.dbId === withReply.dbId ? withReply : s)));
        persistSession(withReply);
      } finally {
        setLoading(false);
      }
    },
    [activeSession, persistSession]
  );

  return {
    sessions,
    activeSession,
    loading,
    initializing,
    newChat,
    switchSession,
    send,
  };
}
