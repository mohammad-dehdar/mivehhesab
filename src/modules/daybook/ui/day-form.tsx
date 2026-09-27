"use client";

import { PlusIcon, SaveIcon, Trash2Icon, XIcon } from "lucide-react";
import { useId, useState } from "react";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { MoneyInput } from "@/shared/components/money-input";
import { useFlash } from "@/shared/hooks/use-flash";
import { cn } from "@/shared/lib/cn";
import type { DayKey } from "@/shared/lib/date";
import { formatToman, toman, type Toman } from "@/shared/lib/money";
import { Button } from "@/shared/ui/button";
import { Card, CardTitle } from "@/shared/ui/card";
import { Input, Label } from "@/shared/ui/input";
import { useDeleteDay, useSaveDay } from "../hooks";
import { expensesTotal, profitOf, type Day } from "../domain/day";
import { EXPENSE_CATEGORIES } from "../domain/expense-categories";

type ExpenseRow = { key: number; category: string; amount: Toman | null };

let nextKey = 0;
const row = (category = "", amount: Toman | null = null): ExpenseRow => ({
  key: nextKey++,
  category,
  amount,
});

function SummaryLine({ label, value, sign }: { label: string; value: Toman; sign?: "+" | "−" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular font-semibold">
        {sign && <span className="text-muted-foreground me-1">{sign}</span>}
        {formatToman(value)}
      </span>
    </div>
  );
}

/** Enter one day's totals: purchases, sales and itemized expenses. */
export function DayForm({ date, initial }: { date: DayKey; initial: Day | null }) {
  const id = useId();
  const [purchases, setPurchases] = useState<Toman | null>(initial?.purchases ?? null);
  const [sales, setSales] = useState<Toman | null>(initial?.sales ?? null);
  const [expenses, setExpenses] = useState<ExpenseRow[]>(
    initial?.expenses.map((e) => row(e.category, e.amount)) ?? [],
  );
  const [note, setNote] = useState(initial?.note ?? "");
  const saveDay = useSaveDay();
  const deleteDay = useDeleteDay();
  const pending = saveDay.isPending;
  const flash = useFlash();

  const filledExpenses = expenses.filter((e) => e.amount !== null && e.amount > 0);
  const expenseSum = expensesTotal(
    filledExpenses.map((e) => ({ category: e.category, amount: e.amount as Toman })),
  );
  const totals = {
    purchases: purchases ?? toman(0),
    sales: sales ?? toman(0),
    expenses: expenseSum,
  };
  const profit = profitOf(totals);
  const canSave = purchases !== null || sales !== null || filledExpenses.length > 0;

  const updateExpense = (key: number, patch: Partial<ExpenseRow>) =>
    setExpenses((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  function save() {
    saveDay.mutate(
      {
        date,
        purchases: totals.purchases,
        sales: totals.sales,
        note,
        expenses: filledExpenses.map((e) => ({
          category: e.category.trim() || "سایر",
          amount: e.amount as Toman,
        })),
      },
      {
        onSuccess: () => flash.show("success", "حساب این روز ذخیره شد"),
        onError: () => flash.show("danger", "ذخیره نشد؛ مبلغ‌ها را بررسی کنید"),
      },
    );
  }

  async function remove() {
    try {
      await deleteDay.mutateAsync(date);
    } catch {
      return flash.show("danger", "پاک کردن ناموفق بود");
    }
    setPurchases(null);
    setSales(null);
    setExpenses([]);
    setNote("");
    flash.show("success", "حساب این روز پاک شد");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="flex flex-col gap-4">
        <Card className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor={`${id}-purchases`}>خرید کل از بار</Label>
            <MoneyInput
              id={`${id}-purchases`}
              value={purchases}
              onChange={setPurchases}
              placeholder="۰"
              className="h-14 text-xl font-semibold"
            />
          </div>
          <div>
            <Label htmlFor={`${id}-sales`}>فروش کل روز</Label>
            <MoneyInput
              id={`${id}-sales`}
              value={sales}
              onChange={setSales}
              placeholder="۰"
              className="h-14 text-xl font-semibold"
            />
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-base">هزینه‌های روز</CardTitle>
            {expenseSum > 0 && (
              <span className="tabular text-muted-foreground text-sm">
                {formatToman(expenseSum)}
              </span>
            )}
          </div>

          {expenses.map((e) => (
            <div key={e.key} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
              <Input
                aria-label="عنوان هزینه"
                placeholder="عنوان"
                value={e.category}
                onChange={(ev) => updateExpense(e.key, { category: ev.target.value })}
              />
              <MoneyInput
                aria-label={`مبلغ ${e.category || "هزینه"}`}
                value={e.amount}
                onChange={(amount) => updateExpense(e.key, { amount })}
                placeholder="۰"
                autoFocus={e.amount === null}
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-danger"
                onClick={() => setExpenses((rows) => rows.filter((r) => r.key !== e.key))}
                aria-label="حذف هزینه"
              >
                <XIcon />
              </Button>
            </div>
          ))}

          <div className="flex flex-wrap gap-2">
            {EXPENSE_CATEGORIES.map((category) => (
              <Button
                key={category}
                variant="secondary"
                size="sm"
                onClick={() => setExpenses((rows) => [...rows, row(category)])}
              >
                <PlusIcon className="size-4!" />
                {category}
              </Button>
            ))}
          </div>
        </Card>

        <Card>
          <Label htmlFor={`${id}-note`}>یادداشت (اختیاری)</Label>
          <textarea
            id={`${id}-note`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="مثلاً: بار سیب از آقای کریمی، هوا بارانی بود…"
            className="bg-background placeholder:text-muted-foreground focus-visible:border-primary w-full rounded-(--radius-control) border px-4 py-3 focus-visible:outline-none"
          />
        </Card>
      </div>

      <Card className="flex flex-col gap-3 lg:sticky lg:top-22">
        <CardTitle className="text-foreground text-base">خلاصه‌ی روز</CardTitle>
        <SummaryLine label="فروش" value={totals.sales} />
        <SummaryLine label="خرید" value={totals.purchases} sign="−" />
        <SummaryLine label="هزینه‌ها" value={expenseSum} sign="−" />
        <div
          className={cn(
            "mt-2 flex items-baseline justify-between rounded-(--radius-control) p-4",
            profit >= 0 ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
          )}
        >
          <span className="font-semibold">{profit >= 0 ? "سود" : "ضرر"}</span>
          <span className="tabular text-3xl font-bold">{formatToman(toman(Math.abs(profit)))}</span>
        </div>

        <Button size="lg" onClick={save} disabled={!canSave || pending} className="mt-2">
          <SaveIcon />
          {pending ? "در حال ذخیره…" : initial ? "ذخیره‌ی تغییرات" : "ذخیره‌ی روز"}
        </Button>

        {initial && (
          <ConfirmDialog
            title="پاک کردن این روز؟"
            description="خرید، فروش و هزینه‌های این روز پاک می‌شود و از جمع‌ها کم می‌شود."
            onConfirm={remove}
            trigger={
              <Button variant="ghost" className="text-danger">
                <Trash2Icon />
                پاک کردن این روز
              </Button>
            }
          />
        )}
      </Card>

      {flash.element}
    </div>
  );
}
