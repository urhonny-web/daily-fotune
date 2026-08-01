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
    <div className="w-full max-w-2xl">
      <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        내 운세 기록
      </h2>
      {sorted.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          아직 뽑은 운세 기록이 없어요.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              <tr>
                <th className="px-4 py-2 font-medium">뽑은 시각</th>
                <th className="px-4 py-2 font-medium">운세</th>
                <th className="px-4 py-2 font-medium">행운의 아이템</th>
                <th className="px-4 py-2 font-medium">행운의 색</th>
                <th className="px-4 py-2 font-medium">행운의 숫자</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((record) => (
                <tr
                  key={record.id}
                  className="border-t border-zinc-200 dark:border-zinc-700"
                >
                  <td className="whitespace-nowrap px-4 py-2 text-zinc-500 dark:text-zinc-400">
                    {new Date(record.drawnAt).toLocaleString("ko-KR", {
                      timeZone: "Asia/Seoul",
                    })}
                  </td>
                  <td className="px-4 py-2">{record.message}</td>
                  <td className="px-4 py-2">{record.item}</td>
                  <td className="px-4 py-2">{record.color}</td>
                  <td className="px-4 py-2">{record.number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
