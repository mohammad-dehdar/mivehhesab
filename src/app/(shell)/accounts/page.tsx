import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountsScreen } from "@/modules/accounts";

export const metadata: Metadata = { title: "دفتر حساب‌ها" };

export default function AccountsPage() {
  return (
    <Suspense>
      <AccountsScreen />
    </Suspense>
  );
}
