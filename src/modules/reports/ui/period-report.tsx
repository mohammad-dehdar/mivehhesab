import { BarChart3Icon } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { formatJalali, shiftDay, type DayKey } from "@/shared/lib/date";
import { toPersianDigits } from "@/shared/lib/digits";
import { formatToman, toman } from "@/shared/lib/money";
import { BarChart } from "@/shared/components/bar-chart";
import { LinkTabs } from "@/shared/components/link-tabs";
import { Card, CardTitle } from "@/shared/ui/card";
import type { PeriodKind, PeriodTotals } from "../domain/periods";

const TABS = [
  { key: "week", label: "هفتگی", href: "/reports/" },
  { key: "month", label: "ماهانه", href: "/reports/?by=month" },
];

function periodLabel(kind: PeriodKind, start: DayKey) {
  if (kind === "month") return formatJalali(start, "MMMM yyyy");
  return `${formatJalali(start, "d MMMM")} تا ${formatJalali(shiftDay(start, 6), "d MMMM")}`;
}

function shortLabel(kind: PeriodKind, start: DayKey) {
  return kind === "month" ? formatJalali(start, "MMMM") : formatJalali(start, "d MMM");
}

/** Weekly or monthly totals: a profit chart of recent periods plus the full list. */
export function PeriodReport({ kind, periods }: { kind: PeriodKind; periods: PeriodTotals[] }) {
  const recent = periods.slice(0, kind === "week" ? 8 : 6).reverse();

  return (
    <div className="flex flex-col gap-4">
      <LinkTabs tabs={TABS} active={kind} label="نوع گزارش" />

      {periods.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <BarChart3Icon className="text-muted-foreground size-10" />
          <p className="text-lg font-semibold">هنوز داده‌ای برای گزارش نیست</p>
          <p className="text-muted-foreground">بعد از ثبت چند روز، گزارش اینجا ساخته می‌شود.</p>
        </Card>
      ) : (
        <>
          <Card className="flex flex-col gap-4">
            <CardTitle>{kind === "week" ? "سود هفته‌های اخیر" : "سود ماه‌های اخیر"}</CardTitle>
            <BarChart
              label="نمودار سود دوره‌ها"
              bars={recent.map((p, i) => ({
                key: p.start,
                label: shortLabel(kind, p.start),
                value: p.totals.profit,
                highlight: i === recent.length - 1,
                title: `${periodLabel(kind, p.start)}: ${formatToman(p.totals.profit)}`,
              }))}
            />
          </Card>

          <Card className="p-0">
            <ul className="divide-y">
              {periods.map((p) => {
                const loss = p.totals.profit < 0;
                return (
                  <li key={p.start} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="flex flex-col sm:w-56">
                      <span className="font-semibold">{periodLabel(kind, p.start)}</span>
                      <span className="text-muted-foreground text-xs">
                        {toPersianDigits(p.totals.days)} روز ثبت‌شده
                      </span>
                    </div>
                    <div className="text-muted-foreground tabular grid flex-1 grid-cols-3 gap-2 text-sm">
                      <span>فروش: {formatToman(p.totals.sales, { unit: false })}</span>
                      <span>خرید: {formatToman(p.totals.purchases, { unit: false })}</span>
                      <span>هزینه: {formatToman(p.totals.expenses, { unit: false })}</span>
                    </div>
                    <span
                      className={cn(
                        "tabular text-lg font-bold sm:w-40 sm:text-end",
                        loss ? "text-danger" : "text-success",
                      )}
                    >
                      {loss ? "ضرر " : "سود "}
                      {formatToman(toman(Math.abs(p.totals.profit)), { unit: false })}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
