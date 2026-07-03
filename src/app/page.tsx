import Link from "next/link";
import Navbar from "@/components/Navbar";
import TopicChecklist from "@/components/TopicChecklist";
import SubjectCard from "@/components/SubjectCard";
import StreakCounter from "@/components/StreakCounter";
import ProgressBar from "@/components/ProgressBar";
import Heatmap from "@/components/Heatmap";
import { createClient } from "@/lib/supabase/server";
import { getTodayString, formatDisplayDate } from "@/lib/timetable";
import {
  calculateStreak,
  calculateProgress,
  calculateWeekProgress,
  buildHeatmapData,
} from "@/lib/progress";
import type { Subject, Topic } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = getTodayString();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*");

  const subjectList = (subjects ?? []) as Subject[];
  const subjectIds = subjectList.map((s) => s.id);

  let allTopics: Topic[] = [];
  if (subjectIds.length > 0) {
    const { data: topics } = await supabase
      .from("topics")
      .select("*")
      .in("subject_id", subjectIds);
    allTopics = (topics ?? []) as Topic[];
  }

  const todayTopics = allTopics.filter((t) => t.assigned_date === today);
  const subjectNames = Object.fromEntries(
    subjectList.map((s) => [s.id, s.name])
  );

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedSubjects = [...subjectList].sort((a, b) => {
    const pa = a.priority ? priorityOrder[a.priority] : 3;
    const pb = b.priority ? priorityOrder[b.priority] : 3;
    return pa - pb;
  });

  const streak = calculateStreak(allTopics);
  const overallProgress = calculateProgress(allTopics);
  const weekProgress = calculateWeekProgress(allTopics);
  const heatmapData = buildHeatmapData(allTopics);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 pb-20">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Today</h1>
            <p className="text-sm text-zinc-500">{formatDisplayDate(today)}</p>
          </div>
          <Link
            href="/subjects/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Add Subject
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <StreakCounter streak={streak} />
          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <ProgressBar label="Overall" value={overallProgress} size="sm" />
            <div className="mt-3">
              <ProgressBar label="This week" value={weekProgress} size="sm" />
            </div>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Today&apos;s topics</h2>
          <TopicChecklist
            topics={todayTopics}
            showSubject
            subjectNames={subjectNames}
          />
        </section>

        {sortedSubjects.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-semibold">Your subjects</h2>
            <div className="space-y-3">
              {sortedSubjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  topics={allTopics.filter((t) => t.subject_id === subject.id)}
                />
              ))}
            </div>
          </section>
        )}

        <Heatmap data={heatmapData} />
      </main>
    </>
  );
}
