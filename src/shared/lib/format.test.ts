import { describe, expect, it } from "vitest";
import { toLatinDigits, toPersianDigits } from "./digits";
import { formatToman, parseToman, sumToman, toman } from "./money";

describe("digits", () => {
  it("converts both ways", () => {
    expect(toPersianDigits(1405)).toBe("۱۴۰۵");
    expect(toLatinDigits("۱۲٬۵۰۰")).toBe("12500");
    expect(toLatinDigits("٢٫٥")).toBe("2.5");
  });
});

describe("money", () => {
  it("formats with Persian digits and unit", () => {
    expect(formatToman(toman(12500))).toBe("۱۲٬۵۰۰ تومان");
    expect(formatToman(toman(0), { unit: false })).toBe("۰");
  });
  it("parses Persian and Latin input", () => {
    expect(parseToman("۸۰٬۰۰۰")).toBe(80000);
    expect(parseToman("80,000")).toBe(80000);
    expect(parseToman("abc")).toBeNull();
    expect(parseToman("12.5")).toBeNull();
  });
  it("sums", () => {
    expect(sumToman([toman(1), toman(2)])).toBe(3);
  });
});
