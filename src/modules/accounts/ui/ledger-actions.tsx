"use client";

import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Button } from "@/shared/ui/button";
import { useDeleteEntry, useDeleteParty } from "../hooks";

export function DeleteEntryButton({ entryId }: { entryId: number }) {
  const deleteEntry = useDeleteEntry();
  return (
    <ConfirmDialog
      title="حذف این ردیف؟"
      description="این ردیف از دفتر حذف می‌شود و مانده دوباره حساب می‌شود."
      onConfirm={async () => {
        await deleteEntry.mutateAsync(entryId);
      }}
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-danger size-10"
          aria-label="حذف ردیف"
        >
          <Trash2Icon />
        </Button>
      }
    />
  );
}

export function DeletePartyButton({ partyId, name }: { partyId: number; name: string }) {
  const router = useRouter();
  const deleteParty = useDeleteParty();
  return (
    <ConfirmDialog
      title={`حذف حساب ${name}؟`}
      description="این شخص و همه‌ی ردیف‌های دفترش برای همیشه حذف می‌شود."
      confirmLabel="حذف حساب"
      onConfirm={async () => {
        await deleteParty.mutateAsync(partyId);
        router.replace("/accounts/");
      }}
      trigger={
        <Button variant="ghost" className="text-danger">
          <Trash2Icon />
          حذف حساب
        </Button>
      }
    />
  );
}
