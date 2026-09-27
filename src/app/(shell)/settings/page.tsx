import type { Metadata } from "next";
import { SettingsScreen } from "@/modules/settings";
import { PageHeader } from "@/shared/components/page-header";

export const metadata: Metadata = { title: "تنظیمات و پشتیبان‌گیری" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="تنظیمات و پشتیبان‌گیری"
        description="اطلاعات روی همین دستگاه ذخیره می‌شود؛ با فایل پشتیبان آن را امن نگه دارید."
      />
      <SettingsScreen />
    </>
  );
}
