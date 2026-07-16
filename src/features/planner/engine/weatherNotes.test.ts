import { describe, expect, it } from "vitest";
import { getCity } from "@/domain/cities";
import { CityStay } from "../types";
import { weatherWarnings } from "./weatherNotes";

/** Minimal CityStay for the fields weatherWarnings reads. */
function stop(cityId: string): CityStay {
  const c = getCity(cityId)!;
  return {
    cityId: c.id,
    city: c.name,
    country: c.country,
    coords: c.coords,
    days: 2,
    dayPlans: [],
    stayPerNight: 0,
    stayTotal: 0,
  };
}

describe("weatherWarnings", () => {
  it("warns about oppressive summer heat", () => {
    const notes = weatherWarnings([stop("seville-es")], 7); // August
    expect(notes).toHaveLength(1);
    expect(notes[0]).toMatch(/Seville in August averages \d+°C highs/);
  });

  it("warns about deep winter cold", () => {
    const notes = weatherWarnings([stop("oslo-no")], 0); // January
    expect(notes[0]).toMatch(/Oslo in January averages -?\d+°C highs — pack for real cold/);
  });

  it("warns about a very wet month", () => {
    const notes = weatherWarnings([stop("porto-pt")], 10); // November, ~13 rain days
    expect(notes[0]).toMatch(/Porto sees about \d+ rainy days in November/);
  });

  it("stays quiet for a pleasant window", () => {
    expect(weatherWarnings([stop("barcelona-es")], 4)).toEqual([]); // May
  });

  it("returns one note per problem stop", () => {
    const notes = weatherWarnings([stop("seville-es"), stop("barcelona-es")], 7);
    expect(notes).toHaveLength(1); // only Seville is extreme in August
  });
});
