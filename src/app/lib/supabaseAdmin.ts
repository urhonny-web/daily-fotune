import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

type FortuneHistoryRow = {
  id: string;
  visitor_id: string;
  user_id: string | null;
  drawn_at: string;
  message: string;
  item: string;
  color: string;
  number: number;
};

type Database = {
  public: {
    Tables: {
      fortune_history: {
        Row: FortuneHistoryRow;
        Insert: Omit<FortuneHistoryRow, "id" | "drawn_at" | "user_id"> &
          Partial<Pick<FortuneHistoryRow, "id" | "drawn_at" | "user_id">>;
        Update: Partial<FortuneHistoryRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

let client: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) {
      throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY is not configured");
    }
    client = createClient<Database>(url, key, {
      auth: { persistSession: false },
    });
  }
  return client;
}

export async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}
