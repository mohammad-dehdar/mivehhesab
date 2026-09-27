"use client";

import { ChevronRightIcon, UserXIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loading } from "@/shared/components/loading";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { usePartyLedger } from "../hooks";
import { PartyLedger } from "./party-ledger";

/** One person's ledger, from `?id=` (static export has no dynamic routes). */
export function PersonScreen() {
  const id = Number(useSearchParams().get("id"));
  const ledger = usePartyLedger(Number.isInteger(id) && id > 0 ? id : 0);

  if (ledger.isPending) return <Loading blocks={1} className="lg:grid-cols-1" />;

  if (!ledger.data) {
    return (
      <Card className="flex flex-col items-center gap-4 py-16 text-center">
        <UserXIcon className="text-muted-foreground size-10" />
        <p className="text-lg font-semibold">این حساب پیدا نشد</p>
        <Button asChild>
          <Link href="/accounts/">برگشت به دفتر حساب‌ها</Link>
        </Button>
      </Card>
    );
  }

  const { party, entries } = ledger.data;
  return (
    <>
      <Link
        href={party.kind === "supplier" ? "/accounts/?kind=supplier" : "/accounts/"}
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ChevronRightIcon className="size-4" />
        دفتر حساب‌ها
      </Link>
      <PartyLedger party={party} entries={entries} />
    </>
  );
}
