import { z } from "zod";
import { isDayKey, type DayKey } from "@/shared/lib/date";

const amount = z.number().int("مبلغ باید عدد صحیح باشد").min(0, "مبلغ نمی‌تواند منفی باشد");

export const dayKeySchema = z.custom<DayKey>(isDayKey, "تاریخ نامعتبر است");

export const dayInputSchema = z.object({
  date: dayKeySchema,
  purchases: amount,
  sales: amount,
  note: z.string().trim().max(500),
  expenses: z
    .array(
      z.object({
        category: z.string().trim().min(1, "عنوان هزینه را بنویسید").max(50),
        amount: amount.min(1, "مبلغ هزینه را وارد کنید"),
      }),
    )
    .max(30),
});

export type DayInput = z.infer<typeof dayInputSchema>;
