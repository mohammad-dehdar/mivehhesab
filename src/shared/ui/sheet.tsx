"use client";

import { Dialog as SheetPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;

/** Panel that slides up from the bottom — used for menus on phones. */
export function SheetContent({
  className,
  children,
  title,
  ...props
}: ComponentProps<typeof SheetPrimitive.Content> & { title: string }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60" />
      <SheetPrimitive.Content
        aria-describedby={undefined}
        className={cn(
          "bg-card fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-(--radius-card) border-t p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
          className,
        )}
        {...props}
      >
        <div className="bg-border mx-auto mb-4 h-1.5 w-12 rounded-full" />
        <SheetPrimitive.Title className="mb-4 text-lg font-bold">{title}</SheetPrimitive.Title>
        {children}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}
