"use client";

import { TriangleAlertIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

export default function ShellError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-4 py-16 text-center">
      <TriangleAlertIcon className="text-danger size-10" />
      <p className="text-lg font-semibold">مشکلی پیش آمد</p>
      <Button onClick={reset}>تلاش دوباره</Button>
    </Card>
  );
}
