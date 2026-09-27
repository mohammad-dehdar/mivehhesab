"use client";

import { useState, type ReactNode } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "../ui/dialog";

/** Asks "are you sure?" before a destructive action. */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "حذف",
  onConfirm,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function confirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={title}>
        <p className="text-muted-foreground">{description}</p>
        <div className="grid grid-cols-2 gap-3">
          <DialogClose asChild>
            <Button variant="secondary">انصراف</Button>
          </DialogClose>
          <Button variant="danger" onClick={confirm} disabled={pending}>
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
