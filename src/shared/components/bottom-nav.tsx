"use client";

import { EllipsisIcon } from "lucide-react";
import { useState } from "react";
import { allNavItems } from "../config/navigation";
import { cn } from "../lib/cn";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { NavLink, useActiveHref } from "./nav-link";

const primary = allNavItems.filter((item) => item.mobile);
const more = allNavItems.filter((item) => !item.mobile);

/** Phone-only bottom bar: the most used sections plus a "more" sheet. */
export function BottomNav() {
  const active = useActiveHref();
  const [open, setOpen] = useState(false);
  const moreActive = more.some((item) => item.href === active);

  return (
    <nav className="bg-card/95 no-print fixed inset-x-0 bottom-0 z-40 flex border-t pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      {primary.map((item) => (
        <NavLink key={item.href} href={item.href} variant="bottom" />
      ))}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className={cn(
            "flex h-16 flex-1 flex-col items-center justify-center gap-1 text-xs",
            moreActive ? "text-primary font-semibold" : "text-muted-foreground",
          )}
        >
          <EllipsisIcon className="size-5" />
          بیشتر
        </SheetTrigger>
        <SheetContent title="بخش‌های دیگر">
          <div className="grid grid-cols-3 gap-3">
            {more.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                variant="tile"
                onNavigate={() => setOpen(false)}
              />
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
