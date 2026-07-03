"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Topic } from "@/lib/types";
import { formatDisplayDate } from "@/lib/timetable";

interface TimetableViewProps {
  subjectId: string;
  topics: Topic[];
}

export default function TimetableView({ subjectId, topics }: TimetableViewProps) {
  const router = useRouter();
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editTitles, setEditTitles] = useState("");
  const [saving, setSaving] = useState(false);

  const byDate = topics.reduce<Record<string, Topic[]>>((acc, t) => {
    if (!acc[t.assigned_date]) acc[t.assigned_date] = [];
    acc[t.assigned_date].push(t);
    return acc;
  }, {});

  const dates = Object.keys(byDate).sort();

  function startEdit(date: string, dayTopics: Topic[]) {
    setEditingDate(date);
    setEditTitles(dayTopics.map((t) => t.title).join("\n"));
  }

  async function saveDay(date: string) {
    setSaving(true);
    try {
      const titles = editTitles
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      await fetch(`/api/subjects/${subjectId}/timetable`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, titles }),
      });

      setEditingDate(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      {dates.map((date, i) => {
        const dayTopics = byDate[date].sort(
          (a, b) => a.sort_order - b.sort_order
        );
        const isEditing = editingDate === date;

        return (
          <div
            key={date}
            className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Day {i + 1} — {formatDisplayDate(date)}
              </h4>
              {!isEditing && (
                <button
                  onClick={() => startEdit(date, dayTopics)}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editTitles}
                  onChange={(e) => setEditTitles(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  placeholder="One topic per line"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveDay(date)}
                    disabled={saving}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingDate(null)}
                    className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <ul className="space-y-1">
                {dayTopics.map((t) => (
                  <li
                    key={t.id}
                    className={`text-sm ${
                      t.is_done
                        ? "text-green-600 line-through dark:text-green-400"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {t.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
