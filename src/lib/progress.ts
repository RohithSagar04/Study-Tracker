import type { Topic } from "./types";
import { formatDate, parseDate } from "./timetable";

/** Consecutive days (ending today or yesterday) with at least one topic done. */
export function calculateStreak(topics: Topic[]): number {
  const doneDates = new Set<string>();
  for (const t of topics) {
    if (t.is_done && t.done_at) {
      doneDates.add(formatDate(new Date(t.done_at)));
    } else if (t.is_done) {
      doneDates.add(t.assigned_date);
    }
  }

  if (doneDates.size === 0) return 0;

  const today = parseDate(formatDate(new Date()));
  let streak = 0;
  const cursor = new Date(today);

  // If nothing done today, streak may still count from yesterday
  const todayStr = formatDate(today);
  if (!doneDates.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = formatDate(cursor);
    if (doneDates.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function calculateProgress(topics: Topic[]): number {
  if (topics.length === 0) return 0;
  const done = topics.filter((t) => t.is_done).length;
  return Math.round((done / topics.length) * 100);
}

export function calculateWeekProgress(topics: Topic[]): number {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekTopics = topics.filter((t) => {
    const d = parseDate(t.assigned_date);
    return d >= weekStart && d <= weekEnd;
  });

  return calculateProgress(weekTopics);
}

export interface HeatmapDay {
  date: string;
  count: number;
}

/** Last ~13 weeks of study activity for heatmap. */
export function buildHeatmapData(topics: Topic[], weeks = 13): HeatmapDay[] {
  const counts = new Map<string, number>();

  for (const t of topics) {
    if (!t.is_done) continue;
    const key = t.done_at
      ? formatDate(new Date(t.done_at))
      : t.assigned_date;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const today = new Date();
  const days: HeatmapDay[] = [];
  const totalDays = weeks * 7;

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = formatDate(d);
    days.push({ date: key, count: counts.get(key) ?? 0 });
  }

  return days;
}
