"use client";

import { FormEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";
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
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureAuthInitialized();
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (auth.loading) {
    return <div className="h-8" />;
  }

  if (auth.user) {
    return (
      <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
        <span className="max-w-[10rem] truncate sm:max-w-none">{auth.user.email}</span>
        <button
          onClick={() => signOut()}
          className="rounded-full border border-[var(--gold-soft)] px-3 py-1 font-medium text-[var(--gold)] transition-colors hover:bg-white/5"
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
        } else {
          setOpen(false);
        }
      } else {
        const { error: signInError } = await signInWithEmail(email, password);
        if (signInError) {
          setError(signInError.message);
        } else {
          setOpen(false);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-[var(--gold-soft)] px-4 py-1.5 text-xs font-medium text-[var(--gold)] transition-colors hover:bg-white/5"
      >
        로그인
      </button>

      {open && (
        <div className="card-shell absolute right-0 z-20 mt-2 w-72 bg-[#160f2b] p-4">
          <div className="mb-3 flex gap-4 text-xs font-medium">
            <button
              onClick={() => {
                setMode("signIn");
                setError(null);
                setMessage(null);
              }}
              className={
                mode === "signIn" ? "gold-text underline underline-offset-4" : "text-[var(--muted)]"
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
                mode === "signUp" ? "gold-text underline underline-offset-4" : "text-[var(--muted)]"
              }
            >
              회원가입
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="email"
              required
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--gold-soft)] focus:outline-none"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--gold-soft)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-1 rounded-lg bg-gradient-to-r from-[#e8c874] to-[#c9932f] px-4 py-2 text-sm font-semibold text-[#1c1236] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {mode === "signIn" ? "로그인" : "회원가입"}
            </button>
          </form>
          {message && <p className="mt-2 text-xs text-emerald-400">{message}</p>}
          {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
