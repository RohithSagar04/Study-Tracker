import type { HeatmapDay } from "@/lib/progress";

interface HeatmapProps {
  data: HeatmapDay[];
}

function level(count: number): string {
  if (count === 0) return "bg-zinc-100 dark:bg-zinc-800";
  if (count === 1) return "bg-indigo-200 dark:bg-indigo-900";
  if (count <= 3) return "bg-indigo-400 dark:bg-indigo-700";
  return "bg-indigo-600 dark:bg-indigo-500";
}

export default function Heatmap({ data }: HeatmapProps) {
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Study activity
      </h3>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} topic(s) done`}
                className={`h-3 w-3 rounded-sm ${level(day.count)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
        <span>Less</span>
        {[0, 1, 2, 4].map((n) => (
          <div
            key={n}
            className={`h-3 w-3 rounded-sm ${level(n)}`}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
