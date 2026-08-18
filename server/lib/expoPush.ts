/**
 * Expo Push Notification sender
 *
 * Wraps Expo's push API (https://exp.host/--/api/v2/push/send).
 * Handles chunking, basic error logging, and skips invalid tokens silently.
 */

export interface PushMessage {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  badge?: number;
}

interface ExpoTicket {
  status: "ok" | "error";
  id?:    string;
  message?: string;
  details?: { error?: string };
}

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const CHUNK_SIZE    = 100; // Expo limit per request

/** Split an array into chunks of at most `size`. */
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Send one or more push messages via Expo's push API.
 * Accepts a single message or an array; automatically chunks large batches.
 * Returns the Expo ticket array (useful for receipt checks).
 */
export async function sendExpoPush(
  messages: PushMessage | PushMessage[],
): Promise<ExpoTicket[]> {
  const all = Array.isArray(messages) ? messages : [messages];
  if (all.length === 0) return [];

  const tickets: ExpoTicket[] = [];

  for (const batch of chunk(all, CHUNK_SIZE)) {
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method:  "POST",
        headers: {
          "Accept":       "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batch),
      });

      if (!res.ok) {
        console.error("[ExpoPush] HTTP error:", res.status, await res.text());
        continue;
      }

      const json = await res.json() as { data: ExpoTicket[] };
      tickets.push(...(json.data ?? []));

      // Log any error tickets without throwing
      for (const t of json.data ?? []) {
        if (t.status === "error") {
          console.warn("[ExpoPush] ticket error:", t.message, t.details);
        }
      }
    } catch (e) {
      console.error("[ExpoPush] fetch error:", e);
    }
  }

  return tickets;
}
