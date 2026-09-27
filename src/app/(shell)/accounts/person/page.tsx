import type { Metadata } from "next";
import { Suspense } from "react";
import { PersonScreen } from "@/modules/accounts";

export const metadata: Metadata = { title: "حساب" };

export default function PersonPage() {
  return (
    <Suspense>
      <PersonScreen />
    </Suspense>
  );
}
