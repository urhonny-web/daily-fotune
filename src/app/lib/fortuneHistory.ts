export type FortuneRecord = {
  drawnAt: number;
  message: string;
  item: string;
  color: string;
  number: number;
};

const STORAGE_KEY = "fortune-history";

let cache: FortuneRecord[] | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): FortuneRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FortuneRecord[]) : [];
  } catch {
    return [];
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function getHistorySnapshot(): FortuneRecord[] {
  if (cache === null) {
    cache = readFromStorage();
  }
  return cache;
}

const EMPTY_HISTORY: FortuneRecord[] = [];

export function getServerHistorySnapshot(): FortuneRecord[] {
  return EMPTY_HISTORY;
}

export function subscribeHistory(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function recordFortune(fortune: {
  message: string;
  item: string;
  color: string;
  number: number;
}): FortuneRecord {
  const record: FortuneRecord = { drawnAt: Date.now(), ...fortune };
  cache = [record, ...readFromStorage()];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  notify();
  return record;
}
