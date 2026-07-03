import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { splitTopicsAcrossDays, getTodayString } from "@/lib/timetable";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, topics, total_days, daily_time_minutes, priority } = body;

  if (!name || !Array.isArray(topics) || topics.length === 0 || !total_days) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const startDate = getTodayString();

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .insert({
      user_id: user.id,
      name,
      total_days,
      daily_time_minutes: daily_time_minutes ?? 120,
      priority: priority ?? null,
      start_date: startDate,
    })
    .select()
    .single();

  if (subjectError || !subject) {
    return NextResponse.json(
      { error: subjectError?.message ?? "Failed to create subject" },
      { status: 500 }
    );
  }

  const schedule = splitTopicsAcrossDays(topics, total_days, startDate);
  const topicRows = schedule.flatMap((day) =>
    day.topics.map((title, sort_order) => ({
      subject_id: subject.id,
      title,
      assigned_date: day.date,
      sort_order,
    }))
  );

  const { error: topicsError } = await supabase.from("topics").insert(topicRows);

  if (topicsError) {
    await supabase.from("subjects").delete().eq("id", subject.id);
    return NextResponse.json({ error: topicsError.message }, { status: 500 });
  }

  return NextResponse.json({ id: subject.id });
}
