import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { is_done } = await request.json();

  const { data: topic } = await supabase
    .from("topics")
    .select("id, subject_id")
    .eq("id", id)
    .single();

  if (!topic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: subject } = await supabase
    .from("subjects")
    .select("id")
    .eq("id", topic.subject_id)
    .eq("user_id", user.id)
    .single();

  if (!subject) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("topics")
    .update({
      is_done,
      done_at: is_done ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
