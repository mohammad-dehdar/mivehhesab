import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "bg-background placeholder:text-muted-foreground h-12 w-full rounded-(--radius-control) border px-4 text-base transition-colors",
        "focus-visible:border-primary aria-invalid:border-danger focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-muted-foreground mb-2 block text-sm", className)} {...props} />;
}
