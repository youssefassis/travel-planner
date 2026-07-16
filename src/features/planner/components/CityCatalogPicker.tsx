"use client";

import { citiesByCountry } from "@/domain/cities";
import TogglePill from "@/components/ui/TogglePill";

/** The full city catalog, grouped by country, as toggleable chips. */
export default function CityCatalogPicker({
  selectedCityIds,
  onToggleCity,
}: {
  selectedCityIds: string[];
  onToggleCity: (cityId: string) => void;
}) {
  const citiesByCountryMap = citiesByCountry();
  const countries = Object.keys(citiesByCountryMap).sort((a, b) =>
    a.localeCompare(b),
  );

  return (
    <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
      {countries.map((country) => (
        <div key={country}>
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
            {country}
          </p>
          <div className="flex flex-wrap gap-2">
            {citiesByCountryMap[country].map((city) => (
              <TogglePill
                key={city.id}
                selected={selectedCityIds.includes(city.id)}
                onClick={() => onToggleCity(city.id)}
              >
                {city.name}
              </TogglePill>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
