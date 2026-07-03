import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { reminder_time, daily_study_minutes, timezone } = body;

  const updates: Record<string, unknown> = {};
  if (reminder_time !== undefined) updates.reminder_time = reminder_time;
  if (daily_study_minutes !== undefined)
    updates.daily_study_minutes = daily_study_minutes;
  if (timezone !== undefined) updates.timezone = timezone;

  const { error } = await supabase.from("settings").upsert(
    {
      user_id: user.id,
      ...updates,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
