"use client";

import { FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import {
  ensureAuthInitialized,
  getAuthSnapshot,
  getServerAuthSnapshot,
  signInWithEmail,
  signOut,
  signUpWithEmail,
  subscribeAuth,
} from "../lib/authStore";

type Mode = "signIn" | "signUp";

export default function AuthPanel() {
  const auth = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    ensureAuthInitialized();
  }, []);

  if (auth.loading) {
    return null;
  }

  if (auth.user) {
    return (
      <div className="flex w-full max-w-2xl items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-700">
        <span className="text-zinc-600 dark:text-zinc-300">
          {auth.user.email} 님으로 로그인됨
        </span>
        <button
          onClick={() => signOut()}
          className="rounded-full border border-zinc-300 px-4 py-1.5 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          로그아웃
        </button>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      if (mode === "signUp") {
        const { data, error: signUpError } = await signUpWithEmail(email, password);
        if (signUpError) {
          setError(signUpError.message);
        } else if (!data.session) {
          setMessage("가입 확인 이메일을 보냈어요. 메일함을 확인해주세요.");
        }
      } else {
        const { error: signInError } = await signInWithEmail(email, password);
        if (signInError) {
          setError(signInError.message);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
      <div className="mb-3 flex gap-4 text-sm font-medium">
        <button
          onClick={() => {
            setMode("signIn");
            setError(null);
            setMessage(null);
          }}
          className={
            mode === "signIn"
              ? "text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
              : "text-zinc-400"
          }
        >
          로그인
        </button>
        <button
          onClick={() => {
            setMode("signUp");
            setError(null);
            setMessage(null);
          }}
          className={
            mode === "signUp"
              ? "text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
              : "text-zinc-400"
          }
        >
          회원가입
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {mode === "signIn" ? "로그인" : "회원가입"}
        </button>
      </form>
      {message && <p className="mt-2 text-sm text-emerald-600">{message}</p>}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
