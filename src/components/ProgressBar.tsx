interface ProgressBarProps {
  label: string;
  value: number;
  size?: "sm" | "md";
}

export default function ProgressBar({
  label,
  value,
  size = "md",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
        <span className="font-medium">{clamped}%</span>
      </div>
      <div
        className={`w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 ${
          size === "sm" ? "h-2" : "h-3"
        }`}
      >
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
