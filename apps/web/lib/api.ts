export interface WineCard {
  id: string;
  name: string;
  region: string;
  country: string;
  type: string;
  price_hkd: number;
  score?: number;
  tasting_notes?: string;
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
