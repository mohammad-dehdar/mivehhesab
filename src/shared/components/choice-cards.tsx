"use client";

import { RadioGroup } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type Choice<T extends string> = {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
};

/** Options shown as large selectable cards; the selected one turns blue. */
export function ChoiceCards<T extends string>({
  value,
  onChange,
  choices,
  label,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  choices: Choice<T>[];
  label: string;
  className?: string;
}) {
  return (
    <RadioGroup.Root
      aria-label={label}
      value={value}
      onValueChange={(v) => onChange(v as T)}
      className={cn("grid grid-cols-2 gap-3", className)}
      dir="rtl"
    >
      {choices.map((choice) => (
        <RadioGroup.Item
          key={choice.value}
          value={choice.value}
          className={cn(
            "flex min-h-14 items-center gap-3 rounded-(--radius-control) border p-3 text-start transition-colors",
            "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            "data-[state=unchecked]:bg-card-elevated data-[state=unchecked]:hover:border-muted-foreground",
          )}
        >
          <span className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-current">
            <RadioGroup.Indicator className="size-2.5 rounded-full bg-current" />
          </span>
          <span className="flex flex-col">
            <span className="font-semibold">{choice.label}</span>
            {choice.description && <span className="text-xs opacity-80">{choice.description}</span>}
          </span>
          {choice.icon && <span className="ms-auto">{choice.icon}</span>}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
