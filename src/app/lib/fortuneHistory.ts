import { getAccessToken } from "./authStore";

export type FortuneRecord = {
  id: string;
  drawnAt: string;
  message: string;
  item: string;
  color: string;
  number: number;
};

const VISITOR_ID_KEY = "fortune-visitor-id";

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

const EMPTY_HISTORY: FortuneRecord[] = [];
let cache: FortuneRecord[] = EMPTY_HISTORY;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getHistorySnapshot(): FortuneRecord[] {
  return cache;
}

export function getServerHistorySnapshot(): FortuneRecord[] {
  return EMPTY_HISTORY;
}

export function subscribeHistory(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loadHistory(): Promise<void> {
  try {
    const headers = await authHeaders();
    const url = headers.Authorization
      ? "/api/fortune-history"
      : `/api/fortune-history?visitorId=${getVisitorId()}`;
    const res = await fetch(url, { headers });
    if (!res.ok) return;
    cache = (await res.json()) as FortuneRecord[];
    notify();
  } catch (err) {
    console.error("Failed to load fortune history", err);
  }
}

export async function recordFortune(fortune: {
  message: string;
  item: string;
  color: string;
  number: number;
}): Promise<void> {
  try {
    const headers = await authHeaders();
    const res = await fetch("/api/fortune-history", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ visitorId: getVisitorId(), ...fortune }),
    });
    if (!res.ok) return;
    const record = (await res.json()) as FortuneRecord;
    cache = [record, ...cache];
    notify();
  } catch (err) {
    console.error("Failed to record fortune", err);
  }
}

export async function claimGuestHistory(): Promise<void> {
  try {
    const headers = await authHeaders();
    if (!headers.Authorization) return;
    await fetch("/api/fortune-history/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ visitorId: getVisitorId() }),
    });
    await loadHistory();
  } catch (err) {
    console.error("Failed to claim guest fortune history", err);
  }
}
