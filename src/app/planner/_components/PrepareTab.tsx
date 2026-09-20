"use client";

import { Check, Plug, Siren, Wallet, Droplets, HandCoins } from "lucide-react";
import Card from "@/components/ui/Card";
import ResultsHeader from "@/components/ui/ResultsHeader";
import Badge from "@/components/ui/Badge";
import { getCountryEssentials } from "@/domain/countries";
import BeforeYouGo from "@/features/planner/components/BeforeYouGo";
import { packingList } from "@/features/planner/lib/packing";
import { Activity, Bookings, TripIntent, TripPlan } from "@/features/planner/types";

type Props = {
  trip: TripPlan;
  intent: TripIntent;
  bookings: Bookings;
  onBook: (activity: Activity, dayLabel: string) => void;
};

/** Everything that happens before the trip starts: what to reserve, what to
 *  pack, and what each country expects of you once you land. */
export default function PrepareTab({ trip, intent, bookings, onBook }: Props) {
  const sections = packingList(trip, intent);
  const countries = [...new Set(trip.stops.map((stop) => stop.country))];

  return (
    <div className="space-y-12">
      <BeforeYouGo itinerary={trip.itinerary} bookings={bookings} onBook={onBook} />

      <section>
        <ResultsHeader
          title="What to pack"
          blurb="Worked out from this trip's weather, itinerary, and countries — not a generic list."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section) => (
            <Card key={section.title} padding="lg">
              <h3 className="text-h3 text-[var(--fg)] mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.label} className="flex gap-2.5 text-sm">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-[var(--primary)]" />
                    <span className="min-w-0">
                      <span className="text-[var(--fg)]">{item.label}</span>
                      {item.why && (
                        <span className="block text-xs text-[var(--muted)] italic">
                          {item.why}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <ResultsHeader
          title="Know before you land"
          blurb="Plugs, money, and who to call — for every country on the route."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {countries.map((country) => {
            const essentials = getCountryEssentials(country);
            if (!essentials) return null;

            return (
              <Card key={country} padding="lg">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-h3 text-[var(--fg)]">{country}</h3>
                  <Badge tone={essentials.tapWater === "safe" ? "success" : "warning"}>
                    <Droplets className="w-2.5 h-2.5" />
                    {essentials.tapWater === "safe" ? "Tap water fine" : "Bottled water"}
                  </Badge>
                </div>

                <dl className="space-y-3 text-sm">
                  <Fact Icon={Plug} label="Power">
                    Type {essentials.plugTypes.join(", ")} · {essentials.voltage}
                  </Fact>
                  <Fact Icon={Wallet} label="Money">
                    {essentials.currency}
                    {essentials.moneyNote && (
                      <span className="block text-xs text-[var(--muted)] italic">
                        {essentials.moneyNote}
                      </span>
                    )}
                  </Fact>
                  <Fact Icon={HandCoins} label="Tipping">
                    {essentials.tipping}
                  </Fact>
                  <Fact Icon={Siren} label="Emergency">
                    {essentials.emergency}
                  </Fact>
                </dl>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Fact({
  Icon,
  label,
  children,
}: {
  Icon: typeof Plug;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2.5">
      <Icon className="w-4 h-4 mt-0.5 shrink-0 text-[var(--muted)]" />
      <div className="min-w-0">
        <dt className="text-caption text-[var(--muted)]">{label}</dt>
        <dd className="text-[var(--fg)]">{children}</dd>
      </div>
    </div>
  );
}
