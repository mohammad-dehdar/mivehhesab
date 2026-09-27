import {
  CalendarDaysIcon,
  CalendarRangeIcon,
  CalendarPlusIcon,
  InfinityIcon,
  PencilIcon,
  SunIcon,
} from "lucide-react";
import Link from "next/link";
import { EMPTY_TOTALS, profitOf } from "@/modules/daybook/domain";
import { BarChart } from "@/shared/components/bar-chart";
import { PageHeader } from "@/shared/components/page-header";
import { formatJalali, formatJalaliLong } from "@/shared/lib/date";
import { toPersianDigits } from "@/shared/lib/digits";
import { formatToman, toman } from "@/shared/lib/money";
import { Button } from "@/shared/ui/button";
import { Card, CardTitle } from "@/shared/ui/card";
import type { Dashboard } from "../domain/dashboard";
import { TotalsCard } from "./totals-card";

function TodayMissing() {
  return (
    <Card className="border-primary/60 flex flex-col items-center gap-4 py-10 text-center">
      <span className="bg-primary/15 text-primary grid size-14 place-items-center rounded-2xl">
        <CalendarPlusIcon className="size-7" />
      </span>
      <div>
        <p className="text-lg font-bold">حساب امروز هنوز ثبت نشده</p>
        <p className="text-muted-foreground mt-1">آخر روز خرید، فروش و هزینه‌ها را وارد کنید.</p>
      </div>
      <Button asChild size="lg">
        <Link href="/day/">ثبت حساب امروز</Link>
      </Button>
    </Card>
  );
}

export function DashboardView({ data }: { data: Dashboard }) {
  const { todayDay, allTime } = data;

  return (
    <>
      <PageHeader title="داشبورد" description={formatJalaliLong(data.today)} />

      <div className="grid gap-4 lg:grid-cols-2">
        {todayDay ? (
          <TotalsCard
            title="امروز"
            subtitle={formatJalali(data.today, "EEEE d MMMM")}
            icon={SunIcon}
            emphasis
            totals={{ ...todayDay, profit: profitOf(todayDay) }}
            action={
              <Button asChild variant="secondary" size="sm">
                <Link href="/day/">
                  <PencilIcon className="size-4!" />
                  ویرایش
                </Link>
              </Button>
            }
          />
        ) : (
          <TodayMissing />
        )}

        <TotalsCard
          title="مجموع همه‌ی روزها"
          subtitle={
            allTime.firstDay
              ? `از ${formatJalali(allTime.firstDay, "d MMMM yyyy")} · ${toPersianDigits(allTime.days)} روز`
              : "هنوز روزی ثبت نشده"
          }
          icon={InfinityIcon}
          totals={allTime.days ? allTime : EMPTY_TOTALS}
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/days/">همه‌ی روزها</Link>
            </Button>
          }
        />

        <Card className="flex flex-col gap-4 lg:col-span-2">
          <CardTitle>سود هفت روز گذشته</CardTitle>
          <BarChart
            label="نمودار سود هفت روز گذشته"
            bars={data.week.map((d) => ({
              key: d.date,
              label: formatJalali(d.date, "EEEE"),
              value: d.profit,
              highlight: d.date === data.today,
              title: `${formatJalali(d.date, "d MMMM")}: ${formatToman(toman(d.profit))}`,
            }))}
          />
        </Card>

        <TotalsCard
          title="این هفته"
          subtitle="از شنبه تا امروز"
          icon={CalendarRangeIcon}
          totals={data.thisWeek}
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/reports/">گزارش هفتگی</Link>
            </Button>
          }
        />
        <TotalsCard
          title="این ماه"
          subtitle={formatJalali(data.today, "MMMM yyyy")}
          icon={CalendarDaysIcon}
          totals={data.thisMonth}
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/reports/?by=month">گزارش ماهانه</Link>
            </Button>
          }
        />
      </div>
    </>
  );
}
