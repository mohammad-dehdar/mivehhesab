import Link from "next/link";
import { cn } from "../lib/cn";

export type LinkTab = { key: string; label: string; href: string };

/** Segmented tabs that navigate (state lives in the URL, e.g. ?by=month). */
export function LinkTabs({
  tabs,
  active,
  label,
}: {
  tabs: LinkTab[];
  active: string;
  label: string;
}) {
  return (
    <nav
      aria-label={label}
      className="bg-card grid gap-1 rounded-(--radius-card) border p-1"
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === active ? "page" : undefined}
          className={cn(
            "flex h-11 items-center justify-center rounded-(--radius-control) font-semibold transition-colors",
            tab.key === active
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
