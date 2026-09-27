import { describe, expect, it } from "vitest";
import { activeHref } from "./navigation";

describe("activeHref", () => {
  it("ignores the trailing slash of static-export URLs", () => {
    expect(activeHref("/day")).toBe("/day/");
    expect(activeHref("/day/")).toBe("/day/");
  });
  it("matches nested pages to their section, and / only exactly", () => {
    expect(activeHref("/accounts/person/")).toBe("/accounts/");
    expect(activeHref("/")).toBe("/");
    expect(activeHref("/days/")).toBe("/days/");
  });
});
