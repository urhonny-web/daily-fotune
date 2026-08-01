import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, getSupabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { visitorId } = body ?? {};
  if (typeof visitorId !== "string") {
    return NextResponse.json({ error: "visitorId is required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error, count } = await supabase
    .from("fortune_history")
    .update({ user_id: userId }, { count: "exact" })
    .eq("visitor_id", visitorId)
    .is("user_id", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ claimed: count ?? 0 });
}
