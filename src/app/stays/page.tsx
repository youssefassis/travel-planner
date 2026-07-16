import { redirect } from "next/navigation";

/**
 * Stays are now a tab inside the trip hub. This route only forwards legacy
 * deep links (`/stays?city=&budget=`) into the planner so old links never 404.
 * (`nights` is dropped — the engine allocates days from the trip itself.)
 */
export default async function StaysRedirect({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; budget?: string }>;
}) {
  const { city, budget } = await searchParams;
  const params = new URLSearchParams({ tab: "stays" });
  if (city) params.set("destination", city);
  if (budget) params.set("budget", budget);
  redirect(`/planner?${params.toString()}`);
}
