import { CalendarDaysIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "../ui/button";
import { BottomNav } from "./bottom-nav";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { TodayLabel } from "./today-label";

function AppHeader() {
  return (
    <header className="bg-background/90 no-print sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur md:px-6">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <CalendarDaysIcon className="size-5" />
        <TodayLabel />
      </div>
      <div className="ms-auto flex items-center gap-2">
        <ThemeToggle />
        <Button asChild className="hidden md:inline-flex">
          <Link href="/day/">
            <PlusIcon />
            ثبت امروز
          </Link>
        </Button>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
