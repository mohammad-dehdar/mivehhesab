import { z } from "zod";
import { isDayKey, type DayKey } from "@/shared/lib/date";
import { toLatinDigits } from "@/shared/lib/digits";

export const partyKindSchema = z.enum(["customer", "supplier"]);

export const partyInputSchema = z.object({
  name: z.string().trim().min(1, "نام را بنویسید").max(80),
  phone: z
    .string()
    .transform((v) => toLatinDigits(v))
    .pipe(z.string().regex(/^\+?\d{0,15}$/, "شماره تلفن نامعتبر است")),
  kind: partyKindSchema,
  note: z.string().trim().max(300),
});

export const entryInputSchema = z.object({
  partyId: z.number().int().positive(),
  date: z.custom<DayKey>(isDayKey, "تاریخ نامعتبر است"),
  type: z.enum(["debt", "payment"]),
  amount: z.number().int().min(1, "مبلغ را وارد کنید"),
  note: z.string().trim().max(300),
});

export type PartyInput = z.input<typeof partyInputSchema>;
export type EntryInput = z.infer<typeof entryInputSchema>;
