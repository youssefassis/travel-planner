export function formatDuration(durationHrs: number): string {
  const hours = Math.floor(durationHrs);
  const minutes = Math.round((durationHrs - hours) * 60);
  return minutes === 0 ? `${hours}h` : `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

/** "6:30 AM" → minutes since midnight, for departure sorting/filtering. */
export function departureMinutes(time: string): number {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/);
  if (!match) return 0;
  const [, h, m, period] = match;
  const hours = (parseInt(h, 10) % 12) + (period === "PM" ? 12 : 0);
  return hours * 60 + parseInt(m, 10);
}

export type TimeOfDay = "any" | "morning" | "afternoon" | "evening";

export function matchesTimeOfDay(departureTime: string, window: TimeOfDay): boolean {
  if (window === "any") return true;
  const minutes = departureMinutes(departureTime);
  if (window === "morning") return minutes < 12 * 60;
  if (window === "afternoon") return minutes >= 12 * 60 && minutes < 18 * 60;
  return minutes >= 18 * 60;
}
