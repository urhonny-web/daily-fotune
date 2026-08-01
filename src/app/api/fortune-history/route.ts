import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, getSupabaseAdmin } from "../../lib/supabaseAdmin";

type FortuneHistoryRow = {
  id: string;
  drawn_at: string;
  message: string;
  item: string;
  color: string;
  number: number;
};

function toRecord(row: FortuneHistoryRow) {
  return {
    id: row.id,
    drawnAt: row.drawn_at,
    message: row.message,
    item: row.item,
    color: row.color,
    number: row.number,
  };
}

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  const visitorId = request.nextUrl.searchParams.get("visitorId");

  if (!userId && !visitorId) {
    return NextResponse.json({ error: "visitorId is required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("fortune_history")
    .select("id, drawn_at, message, item, color, number")
    .order("drawn_at", { ascending: false });

  query = userId
    ? query.eq("user_id", userId)
    : query.eq("visitor_id", visitorId as string).is("user_id", null);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data as FortuneHistoryRow[]).map(toRecord));
}

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  const body = await request.json();
  const { visitorId, message, item, color, number } = body ?? {};

  if (
    typeof visitorId !== "string" ||
    typeof message !== "string" ||
    typeof item !== "string" ||
    typeof color !== "string" ||
    typeof number !== "number"
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("fortune_history")
    .insert({ visitor_id: visitorId, user_id: userId, message, item, color, number })
    .select("id, drawn_at, message, item, color, number")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(toRecord(data as FortuneHistoryRow));
}
