import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { configureWebPush, webpush } from "@/lib/webpush";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    configureWebPush();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "VAPID not configured" },
      { status: 500 }
    );
  }

  const supabase = createAdminClient();

  const { data: settingsList } = await supabase.from("settings").select("*");

  if (!settingsList?.length) {
    return NextResponse.json({ message: "No users configured" });
  }

  let notificationsSent = 0;

  for (const settings of settingsList) {
    const tz = settings.timezone || "Asia/Kolkata";
    const now = new Date();

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
    const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
    const currentTime = `${hour}:${minute}`;

    const reminderTime = (settings.reminder_time as string).slice(0, 5);

    if (currentTime !== reminderTime) continue;

    const todayInTz = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
    }).format(now);

    if (settings.last_reminder_sent_at === todayInTz) continue;

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", settings.user_id);

    if (!subs?.length) continue;

    const { data: subjects } = await supabase
      .from("subjects")
      .select("id")
      .eq("user_id", settings.user_id);

    const subjectIds = (subjects ?? []).map((s) => s.id);
    let pending: string[] = [];

    if (subjectIds.length > 0) {
      const { data: topics } = await supabase
        .from("topics")
        .select("title, is_done")
        .in("subject_id", subjectIds)
        .eq("assigned_date", todayInTz);

      pending = (topics ?? []).filter((t) => !t.is_done).map((t) => t.title);
    }

    const payload = JSON.stringify({
      title:
        pending.length === 0
          ? "🎉 All done for today!"
          : "Daily Study Reminder",
      body:
        pending.length === 0
          ? "You completed all topics today. Keep the streak going!"
          : `You have ${pending.length} topic(s) left: ${pending.slice(0, 5).join(", ")}${pending.length > 5 ? "…" : ""}`,
      url: "/",
    });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys as { p256dh: string; auth: string },
          },
          payload
        );
        notificationsSent++;
      } catch {
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }

    await supabase
      .from("settings")
      .update({ last_reminder_sent_at: todayInTz })
      .eq("id", settings.id);
  }

  return NextResponse.json({
    message: `Cron complete. Sent ${notificationsSent} notification(s).`,
  });
}
