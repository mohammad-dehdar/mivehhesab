import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { formatJalaliLong, shiftDay, todayKey, type DayKey } from "../lib/date";
import { cn } from "../lib/cn";
import { Button } from "../ui/button";

/**
 * "‹ yesterday | Friday 3 Mehr 1405 | tomorrow ›" — moves between days via the
 * `?date=` search param of `basePath`. Future days are not reachable.
 */
export function DayNavigator({ date, basePath }: { date: DayKey; basePath: string }) {
  const today = todayKey();
  const href = (d: DayKey) => (d === today ? basePath : `${basePath}?date=${d}`);
  const isToday = date === today;
  const next = shiftDay(date, 1);

  return (
    <div className="bg-card flex items-center gap-2 rounded-(--radius-card) border p-2">
      <Button asChild variant="ghost" size="icon" aria-label="روز قبل">
        <Link href={href(shiftDay(date, -1))}>
          <ChevronRightIcon />
        </Link>
      </Button>
      <div className="flex flex-1 flex-col items-center">
        <span className="text-lg font-bold">{formatJalaliLong(date)}</span>
        {isToday ? (
          <span className="text-primary text-xs font-medium">امروز</span>
        ) : (
          <Link href={basePath} className="text-primary text-xs underline-offset-4 hover:underline">
            برگشت به امروز
          </Link>
        )}
      </div>
      <Button
        asChild={!isToday}
        variant="ghost"
        size="icon"
        aria-label="روز بعد"
        disabled={isToday}
        className={cn(isToday && "invisible")}
      >
        {isToday ? (
          <ChevronLeftIcon />
        ) : (
          <Link href={href(next)}>
            <ChevronLeftIcon />
          </Link>
        )}
      </Button>
    </div>
  );
}
