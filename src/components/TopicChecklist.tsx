"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Topic } from "@/lib/types";

interface TopicChecklistProps {
  topics: Topic[];
  showSubject?: boolean;
  subjectNames?: Record<string, string>;
}

export default function TopicChecklist({
  topics,
  showSubject = false,
  subjectNames = {},
}: TopicChecklistProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function toggleTopic(topic: Topic) {
    setLoadingId(topic.id);
    try {
      await fetch(`/api/topics/${topic.id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_done: !topic.is_done }),
      });
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  if (topics.length === 0) {
    return (
      <p className="text-sm text-zinc-500">No topics scheduled for today.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {topics.map((topic) => (
        <li key={topic.id}>
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
              topic.is_done
                ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                : "border-zinc-200 bg-white hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
            } ${loadingId === topic.id ? "opacity-60" : ""}`}
          >
            <input
              type="checkbox"
              checked={topic.is_done}
              disabled={loadingId === topic.id}
              onChange={() => toggleTopic(topic)}
              className="mt-0.5 h-5 w-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="min-w-0 flex-1">
              <p
                className={`font-medium ${
                  topic.is_done
                    ? "text-green-700 line-through dark:text-green-400"
                    : "text-zinc-900 dark:text-zinc-100"
                }`}
              >
                {topic.title}
              </p>
              {showSubject && subjectNames[topic.subject_id] && (
                <p className="text-xs text-zinc-500">
                  {subjectNames[topic.subject_id]}
                </p>
              )}
            </div>
          </label>
        </li>
      ))}
    </ul>
  );
}
