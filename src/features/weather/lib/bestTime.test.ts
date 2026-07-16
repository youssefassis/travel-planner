import { describe, expect, it } from "vitest";
import { rateCityMonths } from "./bestTime";

describe("rateCityMonths", () => {
  it("rates all 12 months and returns the top 3", () => {
    const report = rateCityMonths("barcelona-es")!;
    expect(report.months).toHaveLength(12);
    expect(report.bestMonths).toHaveLength(3);
  });

  it("keeps every score within 0-100", () => {
    const report = rateCityMonths("rome-it")!;
    for (const m of report.months) {
      expect(m.score).toBeGreaterThanOrEqual(0);
      expect(m.score).toBeLessThanOrEqual(100);
    }
  });

  it("orders best months by descending score", () => {
    const { bestMonths } = rateCityMonths("lisbon-pt")!;
    expect(bestMonths[0].score).toBeGreaterThanOrEqual(bestMonths[1].score);
    expect(bestMonths[1].score).toBeGreaterThanOrEqual(bestMonths[2].score);
  });

  it("favours late spring / early autumn over deep winter for a Mediterranean city", () => {
    const { bestMonths } = rateCityMonths("rome-it")!;
    const bestIdx = bestMonths.map((m) => m.normal.monthIndex);
    // No December/January in the top three for Rome.
    expect(bestIdx).not.toContain(0);
    expect(bestIdx).not.toContain(11);
  });

  it("returns null for unknown cities", () => {
    expect(rateCityMonths("nowhere-zz")).toBeNull();
  });
});
