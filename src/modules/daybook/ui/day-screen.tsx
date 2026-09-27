"use client";

import { useSearchParams } from "next/navigation";
import { DayNavigator } from "@/shared/components/day-navigator";
import { Loading } from "@/shared/components/loading";
import { isDayKey, todayKey } from "@/shared/lib/date";
import { useDay } from "../hooks";
import { DayForm } from "./day-form";

/** "Record a day" screen; the day comes from `?date=` (defaults to today, never the future). */
export function DayScreen() {
  const requested = useSearchParams().get("date");
  const today = todayKey();
  const date = isDayKey(requested) && requested <= today ? requested : today;
  const day = useDay(date);

  return (
    <>
      <div className="mb-4">
        <DayNavigator date={date} basePath="/day/" />
      </div>
      {day.isPending ? (
        <Loading />
      ) : (
        // keyed so switching days resets the form
        <DayForm key={date} date={date} initial={day.data ?? null} />
      )}
    </>
  );
}
