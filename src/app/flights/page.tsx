"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import FlightSearch, {
  FlightSearchFormData,
} from "@/features/flights/components/FlightSearch";
import FlightLegResults from "@/features/flights/components/FlightLegResults";
import { getCity } from "@/domain/cities";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import PlannerCallout from "@/components/ui/PlannerCallout";

function validCityId(id: string | null): string {
  return id && getCity(id) ? id : "";
}

function searchKey(s: FlightSearchFormData): string {
  return [
    s.fromCityId,
    s.toCityId,
    s.tripType,
    s.departDate,
    s.returnDate,
    s.travelers,
    s.stops,
  ].join("|");
}

function FlightsPageContent() {
  const searchParams = useSearchParams();
  const initialFrom = validCityId(searchParams.get("from"));
  const initialTo = validCityId(searchParams.get("to"));

  const [search, setSearch] = useState<FlightSearchFormData | null>(() =>
    initialFrom && initialTo && initialFrom !== initialTo
      ? {
          fromCityId: initialFrom,
          toCityId: initialTo,
          travelers: 1,
          stops: "any",
          tripType: "oneway",
          departDate: "",
          returnDate: "",
        }
      : null,
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="pt-28 md:pt-32 pb-16 sm:pb-20">
        <Container size="wide">
          <PageHeader
            title="Find flights"
            description="Our picks with the trade-offs explained — decide, don't dig."
          />

          <PlannerCallout variant={initialFrom && initialTo ? "linked" : "standalone"} />

          {/* Search Form */}
          <div className="mb-12 sm:mb-16">
            <FlightSearch
              initialFromCityId={initialFrom}
              initialToCityId={initialTo}
              onSearch={setSearch}
            />
          </div>

          {search ? (
            <FlightLegResults key={searchKey(search)} search={search} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-[var(--muted)] text-lg">
                Enter your flight details above to see tailored recommendations
              </p>
            </motion.div>
          )}
        </Container>
      </div>
    </div>
  );
}

export default function FlightsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <FlightsPageContent />
    </Suspense>
  );
}
