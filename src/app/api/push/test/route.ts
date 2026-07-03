import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { configureWebPush, webpush } from "@/lib/webpush";
import { getTodayString } from "@/lib/timetable";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    configureWebPush();
  } catch {
    return NextResponse.json(
      { error: "VAPID keys not configured" },
      { status: 500 }
    );
  }

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", user.id);

  if (!subs?.length) {
    return NextResponse.json(
      { message: "No subscription found. Enable notifications first." },
      { status: 400 }
    );
  }

  const today = getTodayString();
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id")
    .eq("user_id", user.id);

  const subjectIds = (subjects ?? []).map((s) => s.id);
  let pending: string[] = [];

  if (subjectIds.length > 0) {
    const { data: topics } = await supabase
      .from("topics")
      .select("title, is_done")
      .in("subject_id", subjectIds)
      .eq("assigned_date", today);

    pending = (topics ?? []).filter((t) => !t.is_done).map((t) => t.title);
  }

  const payload = JSON.stringify({
    title:
      pending.length === 0
        ? "🎉 All done for today!"
        : "Daily Study Reminder",
    body:
      pending.length === 0
        ? "You completed all topics today. Great work!"
        : `You have ${pending.length} topic(s) left: ${pending.slice(0, 5).join(", ")}${pending.length > 5 ? "…" : ""}`,
    url: "/",
  });

  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        payload
      );
      sent++;
    } catch {
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("id", sub.id);
    }
  }

  return NextResponse.json({
    message: sent > 0 ? "Test notification sent!" : "Failed to send",
  });
}
