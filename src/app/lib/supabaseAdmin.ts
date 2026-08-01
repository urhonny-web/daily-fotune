import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

type FortuneHistoryRow = {
  id: string;
  visitor_id: string;
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
        Insert: Omit<FortuneHistoryRow, "id" | "drawn_at"> &
          Partial<Pick<FortuneHistoryRow, "id" | "drawn_at">>;
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
