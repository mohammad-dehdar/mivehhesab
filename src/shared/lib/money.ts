import { toLatinDigits } from "./digits";

/** Whole tomans. Branded so it can't be mixed up with weights or plain counts. */
export type Toman = number & { readonly __brand: "Toman" };

export const toman = (value: number): Toman => Math.round(value) as Toman;

export const ZERO_TOMAN = toman(0);

export function sumToman(values: readonly Toman[]): Toman {
  return toman(values.reduce((acc, v) => acc + v, 0));
}

const formatter = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });

/** "۱۲٬۵۰۰ تومان" — pass `unit: false` to drop the suffix. */
export function formatToman(value: Toman, { unit = true } = {}): string {
  const text = formatter.format(value);
  return unit ? `${text} تومان` : text;
}

/** Parses user input (Persian or Latin digits, with or without separators). */
export function parseToman(input: string): Toman | null {
  const normalized = toLatinDigits(input.trim());
  if (!/^\d+$/.test(normalized)) return null;
  return toman(Number(normalized));
}
