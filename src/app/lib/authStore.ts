import { getSupabaseBrowserClient } from "./supabaseClient";
import { claimGuestHistory } from "./fortuneHistory";

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthState = {
  user: AuthUser | null;
  loading: boolean;
};

const SERVER_STATE: AuthState = { user: null, loading: true };
let state: AuthState = { user: null, loading: true };
const listeners = new Set<() => void>();
let initialized = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function toAuthUser(user: { id: string; email?: string | null } | null | undefined): AuthUser | null {
  if (!user) return null;
  return { id: user.id, email: user.email ?? "" };
}

export function getAuthSnapshot(): AuthState {
  return state;
}

export function getServerAuthSnapshot(): AuthState {
  return SERVER_STATE;
}

export function subscribeAuth(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function ensureAuthInitialized() {
  if (initialized) return;
  initialized = true;

  const supabase = getSupabaseBrowserClient();

  supabase.auth.getSession().then(({ data }) => {
    const user = toAuthUser(data.session?.user);
    state = { user, loading: false };
    notify();
    if (user) claimGuestHistory();
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    const user = toAuthUser(session?.user);
    state = { user, loading: false };
    notify();
    if (user) claimGuestHistory();
  });
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = getSupabaseBrowserClient();
  return supabase.auth.signUp({ email, password });
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabaseBrowserClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabase = getSupabaseBrowserClient();
  return supabase.auth.signOut();
}

export async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
