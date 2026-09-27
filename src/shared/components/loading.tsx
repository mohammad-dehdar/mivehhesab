import { cn } from "../lib/cn";

/** Placeholder blocks while data loads from the on-device database. */
export function Loading({ blocks = 2, className }: { blocks?: number; className?: string }) {
  return (
    <div
      className={cn("grid gap-4 lg:grid-cols-2", className)}
      aria-busy
      aria-label="در حال بارگذاری"
    >
      {Array.from({ length: blocks }, (_, i) => (
        <div key={i} className="bg-card h-40 animate-pulse rounded-(--radius-card) border" />
      ))}
    </div>
  );
}
