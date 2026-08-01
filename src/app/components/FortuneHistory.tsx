"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  ensureAuthInitialized,
  getAuthSnapshot,
  getServerAuthSnapshot,
  subscribeAuth,
} from "../lib/authStore";
import {
  getHistorySnapshot,
  getServerHistorySnapshot,
  loadHistory,
  subscribeHistory,
} from "../lib/fortuneHistory";

export default function FortuneHistory() {
  const history = useSyncExternalStore(
    subscribeHistory,
    getHistorySnapshot,
    getServerHistorySnapshot,
  );
  const auth = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);

  useEffect(() => {
    ensureAuthInitialized();
  }, []);

  useEffect(() => {
    if (auth.loading) return;
    loadHistory();
  }, [auth.loading, auth.user?.id]);

  const sorted = [...history].sort(
    (a, b) => new Date(b.drawnAt).getTime() - new Date(a.drawnAt).getTime(),
  );

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-[var(--ink)]">
          내 운세 기록
        </h2>
        <div className="h-px flex-1 bg-[var(--gold-soft)]" />
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">아직 뽑은 운세 기록이 없어요.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((record) => (
            <li key={record.id} className="history-item rounded-xl p-4">
              <p className="text-[11px] tracking-wide text-[var(--muted)]">
                {new Date(record.drawnAt).toLocaleString("ko-KR", {
                  timeZone: "Asia/Seoul",
                })}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink)]">
                {record.message}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="chip gold-text rounded-full px-2.5 py-1 text-[11px]">
                  🍀 {record.item}
                </span>
                <span className="chip gold-text rounded-full px-2.5 py-1 text-[11px]">
                  🎨 {record.color}
                </span>
                <span className="chip gold-text rounded-full px-2.5 py-1 text-[11px]">
                  🔢 {record.number}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
