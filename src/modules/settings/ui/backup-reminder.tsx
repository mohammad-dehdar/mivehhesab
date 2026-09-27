"use client";

import { ShieldAlertIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { needsBackupReminder } from "../domain/backup";
import { useBackupStatus } from "../hooks";

/** Nudges the seller to download a backup when there's data and none in the last week. */
export function BackupReminder() {
  const { data } = useBackupStatus();
  if (!data || !needsBackupReminder(data.lastBackupAt, data.hasData)) return null;

  return (
    <Card className="border-warning/60 mb-4 flex flex-wrap items-center gap-4">
      <ShieldAlertIcon className="text-warning size-8 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-bold">
          {data.lastBackupAt
            ? "یک هفته است پشتیبان نگرفته‌اید"
            : "هنوز از اطلاعات پشتیبان نگرفته‌اید"}
        </p>
        <p className="text-muted-foreground text-sm">
          اطلاعات فقط روی همین دستگاه است؛ با یک فایل پشتیبان از گم شدنش جلوگیری کنید.
        </p>
      </div>
      <Button asChild variant="secondary">
        <Link href="/settings/">گرفتن پشتیبان</Link>
      </Button>
    </Card>
  );
}
