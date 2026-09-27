import { cn } from "../lib/cn";

export type Bar = {
  key: string;
  label: string;
  value: number;
  /** Tooltip text. */
  title?: string;
  highlight?: boolean;
};

/**
 * Minimal CSS bar chart. Negative values are drawn in red with the same height
 * scale, so a loss is visible at a glance.
 */
export function BarChart({
  bars,
  label,
  className,
}: {
  bars: Bar[];
  label: string;
  className?: string;
}) {
  const max = Math.max(...bars.map((b) => Math.abs(b.value)), 1);
  return (
    <div className={cn("flex h-44 items-end gap-2", className)} role="img" aria-label={label}>
      {bars.map((bar) => (
        <div key={bar.key} className="flex h-full min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              title={bar.title}
              className={cn(
                "w-full rounded-lg transition-[height]",
                bar.value < 0
                  ? "bg-danger/70"
                  : bar.highlight
                    ? "bg-primary"
                    : "bg-card-elevated border",
              )}
              style={{
                height: `${bar.value === 0 ? 2 : Math.max(4, (Math.abs(bar.value) / max) * 100)}%`,
              }}
            />
          </div>
          <span
            className={cn(
              "w-full truncate text-center text-xs",
              bar.highlight ? "text-foreground font-semibold" : "text-muted-foreground",
            )}
          >
            {bar.label}
          </span>
        </div>
      ))}
    </div>
  );
}
