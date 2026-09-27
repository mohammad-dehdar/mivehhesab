import { cn } from "@/shared/lib/cn";
import { formatToman, toman } from "@/shared/lib/money";
import type { PartyKind } from "../domain/account";
import { KIND_LABELS } from "../domain/labels";

/** Outstanding balance with a plain-language caption ("owes you", "settled"). */
export function Balance({
  kind,
  balance,
  size = "md",
}: {
  kind: PartyKind;
  balance: number;
  size?: "md" | "lg";
}) {
  const labels = KIND_LABELS[kind];
  const settled = balance === 0;
  const caption = settled ? "تسویه" : balance > 0 ? labels.owes : labels.overpaid;
  // Amber = someone owes the shop (money to collect); red = the shop owes someone.
  const tone = settled
    ? "text-muted-foreground"
    : (kind === "customer") === balance > 0
      ? "text-warning"
      : "text-danger";

  return (
    <span className="flex flex-col items-end">
      <span
        className={cn(
          "tabular font-bold",
          size === "lg" ? "text-3xl" : "text-lg",
          !settled && tone,
        )}
      >
        {settled ? "۰" : formatToman(toman(Math.abs(balance)), { unit: false })}
        {!settled && <span className="text-muted-foreground ms-1 text-xs font-normal">تومان</span>}
      </span>
      <span className="text-muted-foreground text-xs">{caption}</span>
    </span>
  );
}
