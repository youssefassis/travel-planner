import { redirect } from "next/navigation";

/**
 * Flights are now a tab inside the trip hub. This route only forwards legacy
 * deep links (`/flights?from=&to=`) into the planner so old links never 404.
 * Query→query mapping is why this is a server redirect, not a next.config rule.
 */
export default async function FlightsRedirect({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  const params = new URLSearchParams({ tab: "flights" });
  if (to) params.set("destination", to);
  if (from) params.set("origin", from);
  redirect(`/planner?${params.toString()}`);
}
