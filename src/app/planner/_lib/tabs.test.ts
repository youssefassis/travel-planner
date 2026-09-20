import { describe, expect, it } from "vitest";
import { defaultTab, parseTab, resolveTab, visibleTabs } from "./tabs";

describe("visibleTabs", () => {
  it("hides Today and Prepare for an undated trip", () => {
    const tabs = visibleTabs("undated");
    expect(tabs).not.toContain("today");
    expect(tabs).not.toContain("prepare");
    expect(tabs).toContain("overview");
    expect(tabs).toContain("itinerary");
  });

  it("offers Prepare while the departure is ahead", () => {
    expect(visibleTabs("before")).toContain("prepare");
    expect(visibleTabs("before")).not.toContain("today");
  });

  it("swaps Prepare for Today once the trip is running", () => {
    const tabs = visibleTabs("during");
    expect(tabs).toContain("today");
    expect(tabs).not.toContain("prepare");
  });

  it("retires both after the trip", () => {
    const tabs = visibleTabs("after");
    expect(tabs).not.toContain("today");
    expect(tabs).not.toContain("prepare");
  });
});

describe("where the hub opens", () => {
  it("lands on Today mid-trip, Overview otherwise", () => {
    expect(defaultTab("during")).toBe("today");
    expect(defaultTab("before")).toBe("overview");
    expect(defaultTab("undated")).toBe("overview");
  });

  it("honors a URL that names a section that exists right now", () => {
    expect(resolveTab("budget", "undated")).toBe("budget");
    expect(resolveTab("prepare", "before")).toBe("prepare");
  });

  it("falls back when the URL names a section this trip doesn't have", () => {
    expect(resolveTab("today", "before")).toBe("overview");
    expect(resolveTab("prepare", "during")).toBe("today");
  });

  it("reads only real tab names from the URL", () => {
    expect(parseTab("stays")).toBe("stays");
    expect(parseTab("nonsense")).toBeNull();
    expect(parseTab(null)).toBeNull();
  });
});
