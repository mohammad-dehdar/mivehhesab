import { ArrowDownIcon, ArrowUpIcon, PencilIcon, PhoneIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { toPersianDigits } from "@/shared/lib/digits";
import { formatJalali } from "@/shared/lib/date";
import { formatToman, toman } from "@/shared/lib/money";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardTitle } from "@/shared/ui/card";
import type { EntryWithBalance, PartyWithBalance } from "../domain/account";
import { KIND_LABELS } from "../domain/labels";
import { Balance } from "./balance";
import { EntryDialog } from "./entry-dialog";
import { DeleteEntryButton, DeletePartyButton } from "./ledger-actions";
import { PartyDialog } from "./party-dialog";

/** One person's page: balance, quick actions and the full ledger. */
export function PartyLedger({
  party,
  entries,
}: {
  party: PartyWithBalance;
  entries: EntryWithBalance[];
}) {
  const labels = KIND_LABELS[party.kind];
  const newestFirst = [...entries].reverse();

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{party.name}</h1>
              <Badge tone="primary">{labels.single}</Badge>
            </div>
            {party.phone && (
              <a
                href={`tel:${party.phone}`}
                className="text-muted-foreground flex items-center gap-1 text-sm"
                dir="ltr"
              >
                <PhoneIcon className="size-4" />
                {toPersianDigits(party.phone)}
              </a>
            )}
            {party.note && <p className="text-muted-foreground text-sm">{party.note}</p>}
          </div>
          <Balance kind={party.kind} balance={party.balance} size="lg" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <EntryDialog
            partyId={party.id}
            partyName={party.name}
            kind={party.kind}
            type="debt"
            trigger={
              <Button size="lg">
                <ArrowUpIcon />
                {labels.entry.debt}
              </Button>
            }
          />
          <EntryDialog
            partyId={party.id}
            partyName={party.name}
            kind={party.kind}
            type="payment"
            trigger={
              <Button size="lg" variant="success">
                <ArrowDownIcon />
                {labels.entry.payment}
              </Button>
            }
          />
        </div>
      </Card>

      <Card className="p-0">
        <CardTitle className="p-5 pb-3">ریز حساب</CardTitle>
        {newestFirst.length === 0 ? (
          <p className="text-muted-foreground p-10 pt-4 text-center">هنوز چیزی ثبت نشده</p>
        ) : (
          <ul className="divide-y border-t">
            {newestFirst.map((e) => (
              <li key={e.id} className="flex items-center gap-3 p-4">
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full",
                    e.type === "debt" ? "bg-primary/15 text-primary" : "bg-success/15 text-success",
                  )}
                >
                  {e.type === "debt" ? (
                    <ArrowUpIcon className="size-5" />
                  ) : (
                    <ArrowDownIcon className="size-5" />
                  )}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="font-medium">{labels.entry[e.type]}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {formatJalali(e.date, "EEEE d MMMM yyyy")}
                    {e.note && ` · ${e.note}`}
                  </span>
                </span>
                <span className="ms-auto flex flex-col items-end">
                  <span className="tabular font-semibold">
                    {e.type === "debt" ? "+" : "−"}
                    {formatToman(e.amount, { unit: false })}
                  </span>
                  <span className="text-muted-foreground tabular text-xs">
                    مانده: {formatToman(toman(e.balanceAfter), { unit: false })}
                  </span>
                </span>
                <DeleteEntryButton entryId={e.id} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="flex justify-between">
        <PartyDialog
          party={party}
          trigger={
            <Button variant="ghost">
              <PencilIcon />
              ویرایش مشخصات
            </Button>
          }
        />
        <DeletePartyButton partyId={party.id} name={party.name} />
      </div>
    </div>
  );
}
