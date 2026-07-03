import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import TimetableView from "@/components/TimetableView";
import ProgressBar from "@/components/ProgressBar";
import TopicChecklist from "@/components/TopicChecklist";
import { createClient } from "@/lib/supabase/server";
import { getTodayString } from "@/lib/timetable";
import {
  calculateProgress,
  calculateWeekProgress,
} from "@/lib/progress";
import type { Topic } from "@/lib/types";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const today = getTodayString();

  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", id)
    .single();

  if (!subject) notFound();

  const { data: topics } = await supabase
    .from("topics")
    .select("*")
    .eq("subject_id", id)
    .order("assigned_date")
    .order("sort_order");

  const topicList = (topics ?? []) as Topic[];
  const todayTopics = topicList.filter((t) => t.assigned_date === today);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 pb-20">
        <h1 className="mb-1 text-2xl font-bold">{subject.name}</h1>
        <p className="mb-6 text-sm text-zinc-500">
          {subject.total_days} days · {subject.daily_time_minutes} min/day
        </p>

        <div className="mb-6 space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <ProgressBar
            label="Overall progress"
            value={calculateProgress(topicList)}
          />
          <ProgressBar
            label="This week"
            value={calculateWeekProgress(topicList)}
            size="sm"
          />
        </div>

        {todayTopics.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-semibold">Today</h2>
            <TopicChecklist topics={todayTopics} />
          </section>
        )}

        <section>
          <h2 className="mb-3 text-lg font-semibold">Timetable</h2>
          <TimetableView subjectId={id} topics={topicList} />
        </section>
      </main>
    </>
  );
}
