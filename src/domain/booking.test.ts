import { describe, expect, it } from "vitest";
import { bookingReference } from "./booking";

describe("bookingReference", () => {
  it("is deterministic for a given seed", () => {
    expect(bookingReference("abc|123")).toBe(bookingReference("abc|123"));
  });

  it("differs for different seeds", () => {
    expect(bookingReference("a")).not.toBe(bookingReference("b"));
  });

  it("always returns a WND- prefixed 6-char code", () => {
    for (const seed of ["", "x", "a-very-long-seed-value|42|foo"]) {
      const ref = bookingReference(seed);
      expect(ref).toMatch(/^WND-[0-9A-Z]{6}$/);
    }
  });
});
