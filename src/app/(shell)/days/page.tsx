import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DaysScreen } from "@/modules/daybook";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/ui/button";

export const metadata: Metadata = { title: "روزهای ثبت‌شده" };

export default function DaysPage() {
  return (
    <>
      <PageHeader
        title="روزهای ثبت‌شده"
        description="برای دیدن یا اصلاح هر روز، روی آن بزنید."
        actions={
          <Button asChild>
            <Link href="/day/">
              <PlusIcon />
              ثبت امروز
            </Link>
          </Button>
        }
      />
      <DaysScreen />
    </>
  );
}
