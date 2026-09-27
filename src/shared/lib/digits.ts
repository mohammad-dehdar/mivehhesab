const PERSIAN = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC = "٠١٢٣٤٥٦٧٨٩";

/** Converts Latin digits in a string to Persian digits. */
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => PERSIAN[Number(d)]);
}

/**
 * Normalizes user input to Latin digits: Persian/Arabic digits become 0-9,
 * Persian decimal marks (٫ and /) become ".", and thousand separators are removed.
 */
export function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(PERSIAN.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC.indexOf(d)))
    .replace(/[٫/]/g, ".")
    .replace(/[٬,،\s]/g, "");
}
