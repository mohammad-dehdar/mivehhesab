"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { MoneyInput } from "@/shared/components/money-input";
import { formatJalaliLong, shiftDay, todayKey, type DayKey } from "@/shared/lib/date";
import type { Toman } from "@/shared/lib/money";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/shared/ui/dialog";
import { Input, Label } from "@/shared/ui/input";
import { useAddEntry } from "../hooks";
import type { EntryType, PartyKind } from "../domain/account";
import { KIND_LABELS } from "../domain/labels";

/** Record a credit ("نسیه") or a payment against one person's account. */
export function EntryDialog({
  trigger,
  partyId,
  partyName,
  kind,
  type,
}: {
  trigger: ReactNode;
  partyId: number;
  partyName: string;
  kind: PartyKind;
  type: EntryType;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={`${partyName} — ${KIND_LABELS[kind].entry[type]}`}>
        <EntryForm partyId={partyId} type={type} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function EntryForm({
  partyId,
  type,
  onDone,
}: {
  partyId: number;
  type: EntryType;
  onDone: () => void;
}) {
  const id = useId();
  const today = todayKey();
  const [amount, setAmount] = useState<Toman | null>(null);
  const [date, setDate] = useState<DayKey>(today);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const addEntry = useAddEntry();
  const pending = addEntry.isPending;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return setError("مبلغ را وارد کنید");
    addEntry.mutate(
      { partyId, type, amount, date, note },
      { onSuccess: onDone, onError: () => setError("ثبت نشد؛ دوباره تلاش کنید") },
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div>
        <Label htmlFor={`${id}-amount`}>مبلغ</Label>
        <MoneyInput
          id={`${id}-amount`}
          value={amount}
          onChange={(v) => {
            setAmount(v);
            setError(null);
          }}
          autoFocus
          className="h-16 text-2xl font-bold"
          aria-invalid={!!error}
        />
        {error && <p className="text-danger mt-1 text-sm">{error}</p>}
      </div>

      <div>
        <Label>تاریخ</Label>
        <div className="bg-background flex items-center gap-2 rounded-(--radius-control) border p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setDate(shiftDay(date, -1))}
            aria-label="روز قبل"
          >
            <ChevronRightIcon />
          </Button>
          <span className="flex-1 text-center font-medium">
            {formatJalaliLong(date)}
            {date === today && <span className="text-primary ms-2 text-xs">امروز</span>}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setDate(shiftDay(date, 1))}
            disabled={date === today}
            aria-label="روز بعد"
          >
            <ChevronLeftIcon />
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor={`${id}-note`}>توضیح (اختیاری)</Label>
        <Input
          id={`${id}-note`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="مثلاً: ۵ کیلو سیب و ۳ کیلو پرتقال"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        variant={type === "payment" ? "success" : "primary"}
      >
        {pending ? "در حال ثبت…" : "ثبت"}
      </Button>
    </form>
  );
}
