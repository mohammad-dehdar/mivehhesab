"use client";

import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { formatToman, parseToman, type Toman } from "../lib/money";
import { Input } from "../ui/input";

/**
 * Amount in tomans. Accepts Persian or Latin digits, shows thousand separators
 * while typing, and ignores characters that aren't digits.
 */
export function MoneyInput({
  value,
  onChange,
  className,
  ...props
}: Omit<ComponentProps<"input">, "value" | "onChange" | "type"> & {
  value: Toman | null;
  onChange: (value: Toman | null) => void;
}) {
  return (
    <div className="relative">
      <Input
        inputMode="numeric"
        autoComplete="off"
        className={cn("tabular pl-16 text-lg", className)}
        value={value === null ? "" : formatToman(value, { unit: false })}
        onChange={(e) => {
          const text = e.target.value.trim();
          if (text === "") return onChange(null);
          const parsed = parseToman(text);
          if (parsed !== null) onChange(parsed);
        }}
        {...props}
      />
      <span className="text-muted-foreground pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm">
        تومان
      </span>
    </div>
  );
}
