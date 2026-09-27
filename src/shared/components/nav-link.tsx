"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeHref, allNavItems } from "../config/navigation";
import { cn } from "../lib/cn";

export function useActiveHref() {
  return activeHref(usePathname());
}

type Variant = "sidebar" | "bottom" | "tile";

const styles: Record<Variant, { base: string; active: string; idle: string }> = {
  sidebar: {
    base: "flex h-12 items-center gap-3 rounded-(--radius-control) px-3 text-base transition-colors md:max-lg:h-16 md:max-lg:flex-col md:max-lg:justify-center md:max-lg:gap-1 md:max-lg:px-1 md:max-lg:text-[11px]",
    active: "bg-primary text-primary-foreground font-semibold",
    idle: "text-muted-foreground hover:bg-card-elevated hover:text-foreground",
  },
  bottom: {
    base: "flex h-16 flex-1 flex-col items-center justify-center gap-1 text-xs",
    active: "text-primary font-semibold",
    idle: "text-muted-foreground",
  },
  tile: {
    base: "flex flex-col items-center gap-2 rounded-(--radius-control) border p-4 text-sm",
    active: "border-primary bg-primary text-primary-foreground",
    idle: "bg-card-elevated",
  },
};

/** Takes an href (not the item) so server components can render it: icons are functions and can't cross the client boundary. */
export function NavLink({
  href,
  variant,
  onNavigate,
}: {
  href: string;
  variant: Variant;
  onNavigate?: () => void;
}) {
  const item = allNavItems.find((i) => i.href === href);
  const isActive = useActiveHref() === href;
  if (!item) return null;
  const s = styles[variant];
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(s.base, isActive ? s.active : s.idle)}
    >
      <Icon className="size-5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
