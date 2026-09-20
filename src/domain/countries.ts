/**
 * Practical facts a traveler needs on arrival, keyed by the `country` string
 * used in the city dataset. Hand-authored and approximate by design — this is
 * a static, backend-free dataset, not a live source. Anything that genuinely
 * changes (entry rules, exchange rates) is described in general terms rather
 * than stated as fact.
 */

export type CountryEssentials = {
  /** Matches `City.country` exactly. */
  country: string;
  currency: string;
  /** Socket letters, as travel adapters label them. */
  plugTypes: string[];
  voltage: string;
  /** Emergency number to dial. */
  emergency: string;
  tipping: string;
  tapWater: "safe" | "caution";
  /** Currency note for a country that isn't on the euro. */
  moneyNote?: string;
};

const EURO = "Euro (€)";
const EU_PLUGS = ["C", "F"];
const EU_VOLTAGE = "230V · 50Hz";
const EU_EMERGENCY = "112";

const ESSENTIALS: CountryEssentials[] = [
  {
    country: "France",
    currency: EURO,
    plugTypes: ["C", "E"],
    voltage: EU_VOLTAGE,
    emergency: EU_EMERGENCY,
    tipping: "Service is included — round up or leave a couple of euros.",
    tapWater: "safe",
  },
  {
    country: "Spain",
    currency: EURO,
    plugTypes: EU_PLUGS,
    voltage: EU_VOLTAGE,
    emergency: EU_EMERGENCY,
    tipping: "Not expected — small change for good service.",
    tapWater: "safe",
  },
  {
    country: "Portugal",
    currency: EURO,
    plugTypes: EU_PLUGS,
    voltage: EU_VOLTAGE,
    emergency: EU_EMERGENCY,
    tipping: "Not expected — round up at restaurants.",
    tapWater: "safe",
  },
  {
    country: "Italy",
    currency: EURO,
    plugTypes: ["C", "F", "L"],
    voltage: EU_VOLTAGE,
    emergency: EU_EMERGENCY,
    tipping: "Not expected; a cover charge (coperto) is often on the bill.",
    tapWater: "safe",
  },
  {
    country: "Germany",
    currency: EURO,
    plugTypes: EU_PLUGS,
    voltage: EU_VOLTAGE,
    emergency: EU_EMERGENCY,
    tipping: "Round up to the nearest euro or two; say the total as you pay.",
    tapWater: "safe",
  },
  {
    country: "Austria",
    currency: EURO,
    plugTypes: EU_PLUGS,
    voltage: EU_VOLTAGE,
    emergency: EU_EMERGENCY,
    tipping: "Round up by roughly 5–10%.",
    tapWater: "safe",
  },
  {
    country: "Netherlands",
    currency: EURO,
    plugTypes: EU_PLUGS,
    voltage: EU_VOLTAGE,
    emergency: EU_EMERGENCY,
    tipping: "Not expected — round up if you like.",
    tapWater: "safe",
  },
  {
    country: "Belgium",
    currency: EURO,
    plugTypes: ["C", "E"],
    voltage: EU_VOLTAGE,
    emergency: EU_EMERGENCY,
    tipping: "Included in the bill — rounding up is plenty.",
    tapWater: "safe",
  },
  {
    country: "Ireland",
    currency: EURO,
    plugTypes: ["G"],
    voltage: EU_VOLTAGE,
    emergency: "112 or 999",
    tipping: "Around 10% at restaurants; not expected in pubs.",
    tapWater: "safe",
  },
  {
    country: "Greece",
    currency: EURO,
    plugTypes: EU_PLUGS,
    voltage: EU_VOLTAGE,
    emergency: EU_EMERGENCY,
    tipping: "Round up or leave 5–10%.",
    tapWater: "caution",
    moneyNote: "Carry some cash — smaller tavernas and islands often prefer it.",
  },
  {
    country: "Croatia",
    currency: EURO,
    plugTypes: EU_PLUGS,
    voltage: EU_VOLTAGE,
    emergency: EU_EMERGENCY,
    tipping: "Round up or leave about 10%.",
    tapWater: "safe",
  },
  {
    country: "Slovenia",
    currency: EURO,
    plugTypes: EU_PLUGS,
    voltage: EU_VOLTAGE,
    emergency: EU_EMERGENCY,
    tipping: "Not expected — round up for good service.",
    tapWater: "safe",
  },
  {
    country: "Czech Republic",
    currency: "Czech koruna (Kč)",
    plugTypes: ["C", "E"],
    voltage: EU_VOLTAGE,
    emergency: EU_EMERGENCY,
    tipping: "Round up or leave about 10%.",
    tapWater: "safe",
    moneyNote: "Not on the euro — avoid the street exchange booths near the centre.",
  },
  {
    country: "Hungary",
    currency: "Hungarian forint (Ft)",
    plugTypes: EU_PLUGS,
    voltage: EU_VOLTAGE,
    emergency: EU_EMERGENCY,
    tipping: "About 10%; check whether service is already on the bill.",
    tapWater: "safe",
    moneyNote: "Not on the euro — paying in euros usually gives a poor rate.",
  },
  {
    country: "Poland",
    currency: "Polish złoty (zł)",
    plugTypes: ["C", "E"],
    voltage: EU_VOLTAGE,
    emergency: EU_EMERGENCY,
    tipping: "Around 10% at restaurants.",
    tapWater: "safe",
    moneyNote: "Not on the euro — cards are accepted almost everywhere.",
  },
  {
    country: "Denmark",
    currency: "Danish krone (kr)",
    plugTypes: ["C", "E", "K"],
    voltage: EU_VOLTAGE,
    emergency: EU_EMERGENCY,
    tipping: "Included — no tip expected.",
    tapWater: "safe",
    moneyNote: "Not on the euro — close to cashless, bring a card.",
  },
  {
    country: "Sweden",
    currency: "Swedish krona (kr)",
    plugTypes: EU_PLUGS,
    voltage: EU_VOLTAGE,
    emergency: EU_EMERGENCY,
    tipping: "Included — rounding up is optional.",
    tapWater: "safe",
    moneyNote: "Not on the euro — many places take cards only.",
  },
  {
    country: "Norway",
    currency: "Norwegian krone (kr)",
    plugTypes: EU_PLUGS,
    voltage: EU_VOLTAGE,
    emergency: "112 · 113 medical",
    tipping: "Included — no tip expected.",
    tapWater: "safe",
    moneyNote: "Not on the euro, and outside the EU — expect high prices.",
  },
  {
    country: "Switzerland",
    currency: "Swiss franc (CHF)",
    plugTypes: ["C", "J"],
    voltage: EU_VOLTAGE,
    emergency: "112",
    tipping: "Included — round up for good service.",
    tapWater: "safe",
    moneyNote:
      "Not on the euro, and outside the EU — a type J socket needs its own adapter.",
  },
  {
    country: "United Kingdom",
    currency: "Pound sterling (£)",
    plugTypes: ["G"],
    voltage: "230V · 50Hz",
    emergency: "999 or 112",
    tipping: "10–15% at restaurants unless service is included; not in pubs.",
    tapWater: "safe",
    moneyNote: "Not on the euro, and outside the EU — a type G adapter is essential.",
  },
];

const BY_COUNTRY: Record<string, CountryEssentials> = Object.fromEntries(
  ESSENTIALS.map((entry) => [entry.country, entry]),
);

export function getCountryEssentials(
  country: string,
): CountryEssentials | undefined {
  return BY_COUNTRY[country];
}

/** Every country the dataset describes, in the order they were authored. */
export function allCountryEssentials(): CountryEssentials[] {
  return ESSENTIALS;
}
