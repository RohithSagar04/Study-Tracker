import Link from "next/link";
import ProgressBar from "./ProgressBar";
import type { Subject, Topic } from "@/lib/types";
import { calculateProgress } from "@/lib/progress";

interface SubjectCardProps {
  subject: Subject;
  topics: Topic[];
}

const priorityColors = {
  high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export default function SubjectCard({ subject, topics }: SubjectCardProps) {
  const progress = calculateProgress(topics);

  return (
    <Link
      href={`/subjects/${subject.id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          {subject.name}
        </h3>
        {subject.priority && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityColors[subject.priority]}`}
          >
            {subject.priority}
          </span>
        )}
      </div>
      <ProgressBar label="Overall progress" value={progress} size="sm" />
      <p className="mt-2 text-xs text-zinc-500">
        {topics.filter((t) => t.is_done).length} / {topics.length} topics done
      </p>
    </Link>
  );
}
