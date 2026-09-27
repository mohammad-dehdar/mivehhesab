import { CalendarPlusIcon, ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { formatJalali, todayKey } from "@/shared/lib/date";
import { formatToman, toman } from "@/shared/lib/money";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { profitOf, type DaySummary } from "../domain/day";

export function ProfitText({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn("tabular font-bold", value >= 0 ? "text-success" : "text-danger", className)}
    >
      {value < 0 && "−"}
      {formatToman(toman(Math.abs(value)), { unit: false })}
    </span>
  );
}

const dayHref = (date: string) => (date === todayKey() ? "/day/" : `/day/?date=${date}`);

/** Every recorded day, newest first: a table on desktop, cards on phones. */
export function DaysList({ days }: { days: DaySummary[] }) {
  if (days.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-4 py-16 text-center">
        <CalendarPlusIcon className="text-muted-foreground size-10" />
        <p className="text-lg font-semibold">هنوز هیچ روزی ثبت نشده</p>
        <Button asChild>
          <Link href="/day/">ثبت حساب امروز</Link>
        </Button>
      </Card>
    );
  }

  return (
    <>
      <Card className="hidden overflow-hidden p-0 md:block">
        <table className="w-full text-start">
          <thead className="bg-card-elevated text-muted-foreground text-sm">
            <tr>
              <th className="p-4 text-start font-medium">تاریخ</th>
              <th className="p-4 text-start font-medium">فروش</th>
              <th className="p-4 text-start font-medium">خرید</th>
              <th className="p-4 text-start font-medium">هزینه‌ها</th>
              <th className="p-4 text-start font-medium">سود / ضرر</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {days.map((d) => (
              <tr key={d.date} className="hover:bg-card-elevated/50 relative">
                <td className="p-4">
                  <Link
                    href={dayHref(d.date)}
                    className="font-semibold after:absolute after:inset-0"
                  >
                    {formatJalali(d.date, "EEEE d MMMM")}
                  </Link>
                </td>
                <td className="tabular p-4">{formatToman(d.sales, { unit: false })}</td>
                <td className="tabular p-4">{formatToman(d.purchases, { unit: false })}</td>
                <td className="tabular text-muted-foreground p-4">
                  {formatToman(d.expenses, { unit: false })}
                </td>
                <td className="p-4">
                  <ProfitText value={profitOf(d)} />
                </td>
                <td className="text-muted-foreground p-4">
                  <ChevronLeftIcon className="size-5" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <ul className="flex flex-col gap-3 md:hidden">
        {days.map((d) => (
          <li key={d.date}>
            <Link
              href={dayHref(d.date)}
              className="bg-card flex flex-col gap-3 rounded-(--radius-card) border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{formatJalali(d.date, "EEEE d MMMM")}</span>
                <ProfitText value={profitOf(d)} className="text-lg" />
              </div>
              <div className="text-muted-foreground tabular grid grid-cols-3 gap-2 text-sm">
                <span>فروش: {formatToman(d.sales, { unit: false })}</span>
                <span>خرید: {formatToman(d.purchases, { unit: false })}</span>
                <span>هزینه: {formatToman(d.expenses, { unit: false })}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
