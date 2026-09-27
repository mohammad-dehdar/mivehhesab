"use client";

import { useSyncExternalStore } from "react";
import { formatJalaliLong, todayKey } from "../lib/date";

const noSubscribe = () => () => {};

/**
 * Today's Jalali date. Pages are prerendered at build time, so the date is
 * only filled in on the device (empty in the static HTML).
 */
export function TodayLabel() {
  const today = useSyncExternalStore(noSubscribe, todayKey, () => null);
  return <span>{today ? formatJalaliLong(today) : "\u00a0"}</span>;
}
