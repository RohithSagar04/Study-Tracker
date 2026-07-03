interface StreakCounterProps {
  streak: number;
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-900 dark:bg-orange-950/40">
      <span className="text-2xl" aria-hidden>
        🔥
      </span>
      <div>
        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
          {streak}
        </p>
        <p className="text-xs text-orange-700/80 dark:text-orange-300/80">
          day streak
        </p>
      </div>
    </div>
  );
}
