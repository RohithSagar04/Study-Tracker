import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: subjectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date, titles } = await request.json();

  if (!date || !Array.isArray(titles)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { data: subject } = await supabase
    .from("subjects")
    .select("id")
    .eq("id", subjectId)
    .eq("user_id", user.id)
    .single();

  if (!subject) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("topics")
    .select("*")
    .eq("subject_id", subjectId)
    .eq("assigned_date", date);

  const doneMap = new Map(
    (existing ?? []).filter((t) => t.is_done).map((t) => [t.title, t])
  );

  await supabase
    .from("topics")
    .delete()
    .eq("subject_id", subjectId)
    .eq("assigned_date", date);

  if (titles.length > 0) {
    const rows = titles.map((title: string, sort_order: number) => {
      const prev = doneMap.get(title);
      return {
        subject_id: subjectId,
        title,
        assigned_date: date,
        sort_order,
        is_done: prev?.is_done ?? false,
        done_at: prev?.done_at ?? null,
      };
    });

    const { error } = await supabase.from("topics").insert(rows);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
