import { addDays, format, startOfMonth, startOfWeek } from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale";
import { toPersianDigits } from "./digits";

/**
 * A calendar day as "YYYY-MM-DD" (Gregorian, shop-local time). This is how
 * days are stored; the Jalali calendar is only used for display and grouping.
 */
export type DayKey = string & { readonly __brand: "DayKey" };

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function isDayKey(value: unknown): value is DayKey {
  if (typeof value !== "string" || !DAY_KEY.test(value)) return false;
  return toDayKey(fromDayKey(value as DayKey)) === value;
}

export function toDayKey(date: Date): DayKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}` as DayKey;
}

/** Local midnight of the given day. */
export function fromDayKey(key: DayKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export const todayKey = (): DayKey => toDayKey(new Date());

export const shiftDay = (key: DayKey, days: number): DayKey =>
  toDayKey(addDays(fromDayKey(key), days));

/** First day (Saturday) of the Jalali week containing `key`. */
export const weekStartKey = (key: DayKey): DayKey =>
  toDayKey(startOfWeek(fromDayKey(key), { locale: faIR }));

/** First day of the Jalali month containing `key`. */
export const monthStartKey = (key: DayKey): DayKey => toDayKey(startOfMonth(fromDayKey(key)));

/** Formats a date in the Jalali calendar with Persian digits. */
export function formatJalali(date: Date | string, pattern = "yyyy/MM/dd"): string {
  const value = typeof date === "string" && isDayKey(date) ? fromDayKey(date) : new Date(date);
  return toPersianDigits(format(value, pattern, { locale: faIR }));
}

/** "جمعه ۳ مهر ۱۴۰۵" */
export const formatJalaliLong = (date: Date | string) => formatJalali(date, "EEEE d MMMM yyyy");
