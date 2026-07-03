import type { DaySchedule } from "./types";

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Split topics evenly across days; extra topics go on earlier days. */
export function splitTopicsAcrossDays(
  topicTitles: string[],
  totalDays: number,
  startDate: string
): DaySchedule[] {
  if (totalDays < 1 || topicTitles.length === 0) return [];

  const base = Math.floor(topicTitles.length / totalDays);
  const remainder = topicTitles.length % totalDays;
  const start = parseDate(startDate);
  const schedule: DaySchedule[] = [];
  let index = 0;

  for (let day = 0; day < totalDays; day++) {
    const count = base + (day < remainder ? 1 : 0);
    const dayTopics = topicTitles.slice(index, index + count);
    index += count;

    const date = new Date(start);
    date.setDate(start.getDate() + day);

    schedule.push({
      date: formatDate(date),
      topics: dayTopics,
    });
  }

  return schedule;
}

export function getTodayString(): string {
  return formatDate(new Date());
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export { formatDate, parseDate };
