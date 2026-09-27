"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type ReactNode } from "react";
import { ChoiceCards } from "@/shared/components/choice-cards";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/shared/ui/dialog";
import { Input, Label } from "@/shared/ui/input";
import { useCreateParty, useUpdateParty } from "../hooks";
import { partyInputSchema } from "../schemas";
import type { Party, PartyKind } from "../domain/account";
import { KIND_LABELS } from "../domain/labels";

/** Add a new person to the accounts book, or edit an existing one. */
export function PartyDialog({
  trigger,
  party,
  defaultKind = "customer",
}: {
  trigger: ReactNode;
  party?: Party;
  defaultKind?: PartyKind;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={party ? "ویرایش حساب" : "حساب جدید"}>
        <PartyForm party={party} defaultKind={defaultKind} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function PartyForm({
  party,
  defaultKind,
  onDone,
}: {
  party?: Party;
  defaultKind: PartyKind;
  onDone: () => void;
}) {
  const id = useId();
  const router = useRouter();
  const [name, setName] = useState(party?.name ?? "");
  const [phone, setPhone] = useState(party?.phone ?? "");
  const [kind, setKind] = useState<PartyKind>(party?.kind ?? defaultKind);
  const [note, setNote] = useState(party?.note ?? "");
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const createParty = useCreateParty();
  const updateParty = useUpdateParty();
  const pending = createParty.isPending || updateParty.isPending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const input = { name, phone, kind, note };
    const parsed = partyInputSchema.safeParse(input);
    if (!parsed.success) return setErrors(parsed.error.flatten().fieldErrors);
    try {
      if (party) {
        await updateParty.mutateAsync({ id: party.id, input });
        onDone();
      } else {
        const id = await createParty.mutateAsync(input);
        onDone();
        router.push(`/accounts/person/?id=${id}`);
      }
    } catch {
      setErrors({ name: ["ذخیره نشد؛ دوباره تلاش کنید"] });
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <ChoiceCards
        label="نوع حساب"
        value={kind}
        onChange={setKind}
        choices={[
          {
            value: "customer",
            label: KIND_LABELS.customer.single,
            description: "از شما نسیه می‌برد",
          },
          {
            value: "supplier",
            label: KIND_LABELS.supplier.single,
            description: "به شما بار نسیه می‌دهد",
          },
        ]}
      />
      <div>
        <Label htmlFor={`${id}-name`}>نام</Label>
        <Input
          id={`${id}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          aria-invalid={!!errors.name}
          placeholder="مثلاً: آقای رضایی"
        />
        {errors.name && <p className="text-danger mt-1 text-sm">{errors.name[0]}</p>}
      </div>
      <div>
        <Label htmlFor={`${id}-phone`}>تلفن (اختیاری)</Label>
        <Input
          id={`${id}-phone`}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          dir="ltr"
          className="text-end"
          aria-invalid={!!errors.phone}
        />
        {errors.phone && <p className="text-danger mt-1 text-sm">{errors.phone[0]}</p>}
      </div>
      <div>
        <Label htmlFor={`${id}-note`}>یادداشت (اختیاری)</Label>
        <Input id={`${id}-note`} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "در حال ذخیره…" : party ? "ذخیره‌ی تغییرات" : "ساختن حساب"}
      </Button>
    </form>
  );
}
