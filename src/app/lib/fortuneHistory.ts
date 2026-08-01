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

export async function loadHistory(): Promise<void> {
  const visitorId = getVisitorId();
  if (!visitorId) return;
  try {
    const res = await fetch(`/api/fortune-history?visitorId=${visitorId}`);
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
  const visitorId = getVisitorId();
  if (!visitorId) return;
  try {
    const res = await fetch("/api/fortune-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, ...fortune }),
    });
    if (!res.ok) return;
    const record = (await res.json()) as FortuneRecord;
    cache = [record, ...cache];
    notify();
  } catch (err) {
    console.error("Failed to record fortune", err);
  }
}
