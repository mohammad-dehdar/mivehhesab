"use client";

import { UserPlusIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { LinkTabs } from "@/shared/components/link-tabs";
import { Loading } from "@/shared/components/loading";
import { PageHeader } from "@/shared/components/page-header";
import { cn } from "@/shared/lib/cn";
import { formatToman } from "@/shared/lib/money";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import type { PartyKind } from "../domain/account";
import { KIND_LABELS } from "../domain/labels";
import { useOutstandingTotals, useParties } from "../hooks";
import { PartiesBrowser } from "./parties-browser";
import { PartyDialog } from "./party-dialog";

/** The accounts book: customers / suppliers tabs (`?kind=supplier`), totals and people. */
export function AccountsScreen() {
  const kind: PartyKind = useSearchParams().get("kind") === "supplier" ? "supplier" : "customer";
  const parties = useParties(kind);
  const totals = useOutstandingTotals();

  return (
    <>
      <PageHeader
        title="دفتر حساب‌ها"
        description="کسانی که با شما حساب نسیه دارند"
        actions={
          <PartyDialog
            defaultKind={kind}
            trigger={
              <Button>
                <UserPlusIcon />
                حساب جدید
              </Button>
            }
          />
        }
      />
      <div className="flex flex-col gap-4">
        <LinkTabs
          label="نوع حساب"
          active={kind}
          tabs={[
            { key: "customer", label: KIND_LABELS.customer.plural, href: "/accounts/" },
            {
              key: "supplier",
              label: KIND_LABELS.supplier.plural,
              href: "/accounts/?kind=supplier",
            },
          ]}
        />
        <Card className="flex items-center justify-between">
          <span className="text-muted-foreground">{KIND_LABELS[kind].total}</span>
          <span
            className={cn(
              "tabular text-2xl font-bold",
              kind === "customer" ? "text-warning" : "text-danger",
            )}
          >
            {totals.data ? formatToman(totals.data[kind]) : "…"}
          </span>
        </Card>
        {parties.isPending ? (
          <Loading blocks={1} className="lg:grid-cols-1" />
        ) : (
          <PartiesBrowser kind={kind} parties={parties.data ?? []} />
        )}
      </div>
    </>
  );
}
