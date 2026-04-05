export interface WineCard {
  id: string;
  name: string;
  region: string;
  country: string;
  type: string;
  price_hkd: number;
  score?: number;
  tasting_notes?: string;
  thumb_url?: string;
}

export interface ChatResponse {
  reply: string;
  slots: Record<string, unknown>;
  recommendations?: WineCard[];
  done: boolean;
}

export async function sendMessage(
  sessionId: string,
  message: string
): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ── Session persistence ──────────────────────────────────────────────────────

export interface SessionMessage {
  role: string;
  content: string;
  recommendations?: WineCard[];
}

export interface SessionRecord {
  id: string;
  session_id: string;
  title: string;
  created_at: string;
  messages: SessionMessage[];
}

export async function apiCreateSession(title = "New Conversation"): Promise<SessionRecord> {
  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiListSessions(): Promise<SessionRecord[]> {
  const res = await fetch("/api/sessions");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiSaveMessages(
  sessionDbId: string,
  messages: SessionMessage[],
  title?: string
): Promise<void> {
  const res = await fetch(`/api/sessions/${sessionDbId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, title }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

// ── Wine catalog ─────────────────────────────────────────────────────────────

export interface WineFilters {
  type?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
}

export interface WinesPage {
  items: WineCard[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export async function fetchWines(filters: WineFilters = {}, page = 1): Promise<WinesPage> {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.min_price != null) params.set("min_price", String(filters.min_price));
  if (filters.max_price != null) params.set("max_price", String(filters.max_price));
  if (filters.in_stock != null) params.set("in_stock", String(filters.in_stock));
  params.set("page", String(page));
  const res = await fetch(`/api/wines?${params.toString()}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
