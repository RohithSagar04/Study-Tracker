"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Priority } from "@/lib/types";

export default function AddSubjectForm({
  defaultDailyMinutes,
}: {
  defaultDailyMinutes: number;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [durationValue, setDurationValue] = useState(2);
  const [durationUnit, setDurationUnit] = useState<"days" | "weeks">("weeks");
  const [priority, setPriority] = useState<Priority | "">("medium");
  const [dailyMinutes, setDailyMinutes] = useState(defaultDailyMinutes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addTopic() {
    const t = topicInput.trim();
    if (t && !topics.includes(t)) {
      setTopics([...topics, t]);
      setTopicInput("");
    }
  }

  function removeTopic(index: number) {
    setTopics(topics.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Subject name is required");
      return;
    }
    if (topics.length === 0) {
      setError("Add at least one topic");
      return;
    }

    const totalDays =
      durationUnit === "weeks" ? durationValue * 7 : durationValue;

    setLoading(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          topics,
          total_days: totalDays,
          daily_time_minutes: dailyMinutes,
          priority: priority || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create subject");

      router.push(`/subjects/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium">Subject / Skill</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. DSA, AWS, System Design"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Topics</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTopic();
              }
            }}
            placeholder="Add a topic"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="button"
            onClick={addTopic}
            className="rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium dark:bg-zinc-800"
          >
            Add
          </button>
        </div>
        {topics.length > 0 && (
          <ul className="mt-2 space-y-1">
            {topics.map((t, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-1.5 text-sm dark:bg-zinc-800/50"
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeTopic(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Duration</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={durationValue}
              onChange={(e) => setDurationValue(Number(e.target.value))}
              className="w-20 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <select
              value={durationUnit}
              onChange={(e) =>
                setDurationUnit(e.target.value as "days" | "weeks")
              }
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Daily study time (min)
          </label>
          <input
            type="number"
            min={15}
            step={15}
            value={dailyMinutes}
            onChange={(e) => setDailyMinutes(Number(e.target.value))}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Priority (optional)
        </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority | "")}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Creating timetable…" : "Create study plan"}
      </button>
    </form>
  );
}
