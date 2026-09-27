import type { Metadata } from "next";
import { Suspense } from "react";
import { ReportsScreen } from "@/modules/reports";
import { PageHeader } from "@/shared/components/page-header";

export const metadata: Metadata = { title: "گزارش‌ها" };

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="گزارش‌ها" description="جمع خرید، فروش، هزینه و سود هر هفته و هر ماه" />
      <Suspense>
        <ReportsScreen />
      </Suspense>
    </>
  );
}
