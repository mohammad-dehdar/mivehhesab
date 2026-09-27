import type { EntryType, PartyKind } from "./account";

/** All wording that depends on which side of the counter the person is on. */
export const KIND_LABELS: Record<
  PartyKind,
  {
    plural: string;
    single: string;
    entry: Record<EntryType, string>;
    owes: string;
    overpaid: string;
    total: string;
  }
> = {
  customer: {
    plural: "مشتری‌ها",
    single: "مشتری",
    entry: { debt: "نسیه برد", payment: "پرداخت کرد" },
    owes: "به شما بدهکار است",
    overpaid: "از شما طلبکار است",
    total: "جمع طلب شما از مشتری‌ها",
  },
  supplier: {
    plural: "بارفروش‌ها",
    single: "بارفروش",
    entry: { debt: "بار نسیه گرفتم", payment: "پرداخت کردم" },
    owes: "شما به او بدهکارید",
    overpaid: "به شما بدهکار است",
    total: "جمع بدهی شما به بارفروش‌ها",
  },
};
