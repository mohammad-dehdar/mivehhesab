import type { Metadata } from "next";
import { Suspense } from "react";
import { DayScreen } from "@/modules/daybook";
import { PageHeader } from "@/shared/components/page-header";

export const metadata: Metadata = { title: "ثبت حساب روز" };

export default function DayPage() {
  return (
    <>
      <PageHeader
        title="ثبت حساب روز"
        description="آخر روز، جمع خرید و فروش و هزینه‌ها را وارد کنید؛ سود خودکار حساب می‌شود."
      />
      <Suspense>
        <DayScreen />
      </Suspense>
    </>
  );
}
