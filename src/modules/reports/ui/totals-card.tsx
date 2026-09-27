import type { Totals } from "@/modules/daybook/domain";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { formatToman, toman } from "@/shared/lib/money";
import { Card } from "@/shared/ui/card";

function Metric({ label, value }: { label: string; value: number }) {
  return (
    // Row on phones (label ↔ value), small tile from sm up — big amounts never get clipped.
    <div className="bg-card-elevated flex min-w-0 items-center justify-between gap-1 rounded-(--radius-control) px-3 py-2.5 sm:flex-col sm:items-start sm:py-3">
      <span className="text-muted-foreground text-sm sm:text-xs">{label}</span>
      <span className="tabular truncate font-semibold sm:max-w-full sm:text-lg">
        {formatToman(toman(value), { unit: false })}
      </span>
    </div>
  );
}

/** Sales / purchases / expenses with the resulting profit (or loss) highlighted. */
export function TotalsCard({
  title,
  subtitle,
  icon: Icon,
  totals,
  emphasis = false,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  totals: Pick<Totals, "sales" | "purchases" | "expenses" | "profit">;
  emphasis?: boolean;
  action?: ReactNode;
  className?: string;
}) {
  const loss = totals.profit < 0;
  return (
    <Card className={cn("flex flex-col gap-4", emphasis && "border-primary/60", className)}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-10 place-items-center rounded-xl",
            emphasis ? "bg-primary text-primary-foreground" : "bg-card-elevated",
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="flex flex-col">
          <span className="font-bold">{title}</span>
          {subtitle && <span className="text-muted-foreground text-xs">{subtitle}</span>}
        </div>
        {action && <div className="ms-auto">{action}</div>}
      </div>

      <div
        className={cn(
          "flex items-baseline justify-between rounded-(--radius-control) p-4",
          loss ? "bg-danger/15 text-danger" : "bg-success/15 text-success",
        )}
      >
        <span className="font-semibold">{loss ? "ضرر" : "سود"}</span>
        <span className="flex items-baseline gap-1.5">
          <span className="tabular text-3xl font-bold md:text-4xl">
            {formatToman(toman(Math.abs(totals.profit)), { unit: false })}
          </span>
          <span className="text-sm">تومان</span>
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <Metric label="فروش" value={totals.sales} />
        <Metric label="خرید" value={totals.purchases} />
        <Metric label="هزینه‌ها" value={totals.expenses} />
      </div>
    </Card>
  );
}
