"use client";

import { SearchIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatJalali } from "@/shared/lib/date";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import type { PartyKind, PartyWithBalance } from "../domain/account";
import { KIND_LABELS } from "../domain/labels";
import { Balance } from "./balance";

/** Searchable list of people in the accounts book, each linking to their ledger. */
export function PartiesBrowser({
  kind,
  parties,
}: {
  kind: PartyKind;
  parties: PartyWithBalance[];
}) {
  const [query, setQuery] = useState("");
  const q = query.trim();
  const visible = q ? parties.filter((p) => p.name.includes(q) || p.phone.includes(q)) : parties;

  return (
    <div className="flex flex-col gap-4">
      {parties.length > 5 && (
        <div className="relative">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute inset-y-0 right-4 my-auto size-5" />
          <Input
            type="search"
            placeholder="جستجوی نام یا تلفن…"
            aria-label="جستجو"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-12"
          />
        </div>
      )}

      <Card className="p-0">
        <ul className="divide-y">
          {visible.map((p) => (
            <li key={p.id}>
              <Link
                href={`/accounts/person/?id=${p.id}`}
                className="hover:bg-card-elevated/50 flex items-center gap-4 p-4 transition-colors"
              >
                <span className="bg-card-elevated text-muted-foreground grid size-11 shrink-0 place-items-center rounded-full">
                  <UserIcon className="size-5" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold">{p.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {p.lastEntryDate
                      ? `آخرین ثبت: ${formatJalali(p.lastEntryDate, "d MMMM")}`
                      : "بدون ثبت"}
                  </span>
                </span>
                <span className="ms-auto">
                  <Balance kind={p.kind} balance={p.balance} />
                </span>
              </Link>
            </li>
          ))}
          {visible.length === 0 && (
            <li className="text-muted-foreground p-10 text-center">
              {q ? "کسی با این نام پیدا نشد" : `هنوز هیچ ${KIND_LABELS[kind].single} اضافه نشده`}
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
