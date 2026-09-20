# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Commands

- `npm run dev` — dev server on http://localhost:3000
- `npm run build` — production build
- `npm run lint` — ESLint (baseline is zero errors/warnings — keep it)
- `npm t` — Vitest (tests are colocated `*.test.ts`)

## What this is

**Wanderly** — a travel-planning app. Users set preferences (or pick cities) and get a full round trip: route, day-by-day itinerary, transport, budget, flights, and stays. Everything runs client-side on a static city dataset — no backend, no API keys.

**Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4, Zustand, Framer Motion, MapLibre GL + OpenFreeMap tiles (keyless), next-themes, Vitest.

## Architecture

Imports flow one way: `app → features → domain`. `src/components` may be used by all layers. **Features never import each other** — but the `app` layer MAY compose several features on one route. That is how the **trip hub** works: `/planner` is a tabbed hub whose tabs live in `app/planner/_components/` and pull in the flights/stays/weather features, prefilled from the trip via `app/planner/_lib/derive.ts`. Feature→feature data still never crosses through imports.

**Hub tabs are staged by the trip's moment** (`app/planner/_lib/tabs.ts`): Overview · Today · Itinerary · Book · Budget · Prepare — *Today* exists only while the trip runs (and is then the default), *Prepare* only between setting dates and departure; otherwise the hub opens on *Overview* (map, route strip, budget glance, plan variants inline). *Book* fronts flights and stays behind one segmented switch; legacy `?tab=flights` / `?tab=stays` deep links map to it, and `resolveTab` falls back to the phase default when the URL names a section the trip doesn't have right now.

Entry points hand off through the URL: hero/cards → `/planner?destination=<cityId>&origin=<cityId>&travelers=<solo|couple|group>&budget=<tier>&month=<0-11>&date=<YYYY-MM-DD>` (parsed by `features/planner/lib/heroPrefill.ts` to prefill the wizard); share links `?plan=1&…` (regenerate the exact plan, skip the wizard) take precedence; `/planner?trip=<id>` opens a saved trip exactly as stored (from `/trips`); the hub tab is carried in `?tab=` and `/explore`'s open tool in `?tool=` (both ignored by the share/hero parsers). Legacy `/flights`, `/stays`, `/discover`, `/weather` are **redirects** — `/flights` & `/stays` are server pages that map their query into `/planner?…&tab=…`; `/discover` & `/weather` redirect to `/explore` via `next.config.ts`.

```
src/
  app/         Routes: (marketing) home (+ ResumeTripCard), /planner (hub), /trips (shelf),
               /explore (chooser → spin · weather · budget); /flights /stays (redirects → hub);
               not-found.tsx, error.tsx, robots.ts, sitemap.ts, opengraph-image.tsx
    planner/_components/  hub tabs (PlanHub, TodayTab, BookTab → FlightsTab+StaysTab,
                          BudgetTab, PrepareTab, ClimatePanel, HubTabs, VariantsPanel)
    planner/_lib/         derive.ts (leg → flight search, stop → stay prefs, party size);
                          tabs.ts (staged tab set, legacy mapping, resolveTab)
    trips/                the shelf: draft + saved trips with status chips (_lib/status.ts)
    explore/_components/  AffordabilityPanel (budget-first discovery)
    explore/_lib/         affordable.ts (budget → destinations, priced by the real engine)
  domain/      Shared vocabulary: types, city dataset, geo helpers, booking.ts (ref generator)
  components/  ui/ primitives, layout/ (Header, Footer), theme/, pwa/, motion.ts
  features/
    planner/   engine/ (trip generation), components/ (incl. wizard/), store/ (Zustand), lib/ (share, wizard step machine, heroPrefill)
    flights/   searchFlights + recommendFlights; FlightLegResults (route-agnostic results)
    stays/     adviseStays (neighborhood + accommodation advisor); StayAdviceResults
    weather/   suggestTrips + rateCityMonths (weather match + climate report)
    discover/  spin-the-globe destination picker
    marketing/ Landing-page sections
```

### The trip engine (`features/planner/engine`)

Pure and **deterministic**: the same `TripIntent` always produces the identical `TripPlan`. No `Date.now`/`Math.random`; ids are content-derived. This powers backend-free share links — the URL encodes the intent and the recipient regenerates the exact same plan (`lib/share.ts`).

Pipeline: `selectCities → orderRoute → allocateDays → transport → dayPlans → budget → generatePlan`. **Transport runs before `dayPlans`** on purpose: travel eats into the day it falls on, so a day has to know what it's losing before it knows how much it can hold.

**Home is not a stop.** `intent.originCityId` is where the traveler lives: `selectCities` never picks it as a destination, and `routeLegs` bookends the route with an `outbound` (home → first stop) and a `homebound` (last stop → home), each omitted when home already *is* that stop. They live outside `plan.legs` so the "`legs[i]` connects `stops[i]` to `stops[i+1]`" invariant still holds — use `allLegs(plan)` for everything the traveler actually rides. On edit, `replan` recovers home from those legs, so it survives adding and removing cities.

**Trips persist in `localStorage`** via `lib/tripStorage.ts` — a draft (auto-saved, restored on refresh) and a capped list of saved trips. The **plan** is stored, not just the intent, because `replan` edits aren't reconstructible from the wizard's answers. Keys are versioned (`wanderly.v1.*`): bump on a shape change and old entries are ignored. Stored values are validated on read and every access is try/caught — storage is absent in private windows. On mount, precedence is **share link → ?trip= → hero params → stored draft**. Components never read storage in effects: `lib/useTripShelf.ts` wraps it in `useSyncExternalStore` (call `refreshTripShelf()` after every write) — that's what the home page's resume card and `/trips` subscribe to.

**The clock stays out of the logic.** The engine and every library function are time-free; `lib/today.ts` takes the current date/minute as arguments. Only components read `new Date()`, and only two ways: `TodayTab` ticks live, while `PlanHub`, `/trips` and the resume card read it **once** into lazy state for status/tab decisions. That keeps "what day of the trip is it" testable at any moment. The hub opens on **Today** when the trip is running and the URL didn't ask for a tab.

**Offline is a PWA, not a framework.** `public/sw.js` is hand-written (no dependency): GET + same-origin only, cache-first for `/_next/static/` and `/icons/`, network-first for navigations, stale-while-revalidate otherwise, and `_rsc` payloads are left to the router. It registers in **production only** (`components/pwa/`), so it never sits in front of dev HMR. Bump `CACHE` in `sw.js` to retire everything at once (currently `wanderly-v2` — the test pins the name, bump both). Its routing is covered by `components/pwa/serviceWorker.test.ts`, which evaluates the real file against a stubbed worker environment.

**Bookings, packing, and country facts.** Reservations are trip state (`Bookings` in `planner/types.ts`), stored with the plan and shown on the *Prepare* tab. `lib/packing.ts` derives the packing list on demand from climate normals, the itinerary's categories, trip length, and `domain/countries.ts` — never stored, so it follows plan edits. `domain/countries.ts` covers exactly the countries the city dataset can reach, and a test enforces that in both directions.

**Variants are derived, never stored** — and shown inline on the hub's Overview (`VariantsPanel`), not behind a button. `engine/variants.ts` builds alternatives from the current plan — each changing one variable so the trade is legible. Two guards keep them honest: a variant identical to another is deduped (`greener` is evaluated before `fewerCities`, so when both would drop the same stop the carbon reason wins), and `greener` only fires when the result both flies less *and* still has a ground leg between cities — otherwise "one less flight" would just mean a shorter trip. Each variant carries the `TripIntent` that rebuilds it, so adopting one keeps a later edit or share consistent.

**Real journeys beat the distance model.** `domain/corridors.ts` holds ~50 hand-authored city pairs — the high-speed rail corridors the estimate makes ~2× too slow, and the water crossings it would put a train across (Britain–Ireland, the Adriatic). `pickTransportLeg` uses a corridor when one exists and the formula otherwise. **Every duration, every mode, is door to door**, so a flight's figure includes the airport at both ends — that's what makes rail and air comparable, and travel days subtract these hours directly. A `railAlternative` on a flown pair feeds the note on the Flights tab.

`domain/carbon.ts` prices those legs in CO₂e per passenger-km (car assumes two occupants; flight includes the altitude uplift) with a mode-specific circuity factor over straight-line distance. Surfaced as `FootprintCard` on the Budget tab.

Note `TransportMode` now lives in `domain/types.ts` — corridors and carbon both need it — and is re-exported from `features/planner/types.ts`, so existing imports are unchanged.

**Travel days are real.** `travelDays.ts` maps legs onto the days they consume — the traveler arrives on a stay's **first** day (off `outbound` for the first stop, off `legs[i-1]` for the rest) and leaves home on the trip's **last** day, matching how `lib/tripDates.ts` dates those legs. `ItineraryDay.arrival` / `.departure` carry it; `dayPlans` sizes each day's activity count to the hours left after travel (always ≥ 1), and `schedule.ts` starts an arrival day late, ends a departure day early, and emits a `kind: "travel"` `ScheduleItem`. On replan only the bracketing is recomputed, never the activity counts — rebuilding those would discard the traveler's edits.

**Dates sit on top of the engine, not inside it.** The engine plans in Day 1..N and never sees a calendar, which is what keeps share links reproducible. `TripIntent.startDate` (optional, `YYYY-MM-DD`) is mapped onto those days by `lib/tripDates.ts`, and all date arithmetic lives in `domain/dates.ts` in **UTC** so nothing drifts across a timezone or DST boundary. `startDate` and `travelMonth` must agree — write them together via `withStartDate` / `withTravelMonth`, never directly. `lib/calendar.ts` turns a dated plan into `.ics`.

**Budget figures are per person** (`STAY_SHARE` is a share of a room; food and activities are per head; a leg cost is one seat). `travelers` and `partyTotal` carry what the whole group pays, and `PARTY_SIZE` in `engine/constants.ts` is the one definition of party size — the booking panels read the same table.

Plus:

- `schedule.ts` — timed day schedule; food POIs become lunch/dinner venues, nightlife lands after dinner
- `replan.ts` — pure plan-in → plan-out edits: `swapActivity`, `makeRainFriendly`, `addActivity`/`removeActivity`, `moveActivity` (reorder within a day, scheduling-class scoped), `moveActivityToDay` (same-city only), `removeDay` (city's last day removes the stop), `addCity`/`removeCity` (cheapest-insertion, day renumbering, budget recompute)

### Coordinates

`{lat, lng}` everywhere. `[lng, lat]` only at the MapLibre boundary via `toLngLat` in `src/domain/geo.ts`.

## Styling — the Atlas identity

Ink on chart paper: ivory ground, ink-navy text, **route-red** (`--primary`) for actions and the journey line, **chart teal** (`--accent`) for water/links/weather. Dark mode is a night navigation chart (navy ground, paper-toned text). `--danger` is a colder crimson than the brand red on purpose — route-red means "act", crimson means "wrong".

- **Theme config is CSS-first** — all in `globals.css`, there is **no `tailwind.config.js`** (Tailwind v4 wouldn't load it). Dark mode is class-based via `@custom-variant dark (&:where(.dark, .dark *))`; next-themes toggles `.dark`, and every color flows through a token, so **never add `dark:` color overrides** — the token carries both themes.
- Tokens in `globals.css`: surfaces/brand (`--bg --fg --muted --border --card --card-subtle --input-bg --input-border --primary --accent --gradient-hero --header-bg`) and **semantic status** (`--success --warning --danger` each with a `-bg` tint, plus `--rating`). Use as `text-[var(--warning)] bg-[var(--warning-bg)]` — never hardcode reds/teals/golds.
- **Three font roles** (`layout.tsx`): Newsreader (`--font-serif`, display/headlines/prices), Source Sans 3 (`--font-sans`, UI/body), IBM Plex Mono (`--font-data`). Every time, fare, distance or countdown wears `.text-data` (tabular mono, timetable-style); `.text-caption` is the map-label: caps, letter-spaced, data face.
- Type scale utilities: `.text-display .text-h1 .text-h2 .text-h3 .text-body-lg .text-small .text-caption .text-data`. **12px type floor** — nothing below `text-xs`; tiny labels use `.text-caption` or `<Badge>`.
- Radius rule: `rounded-full` pills/buttons/avatars · `rounded-xl` cards/sub-panels/popovers/inputs · `rounded-2xl` overlays/media/map/hero.
- Base form styles live in `@layer base` — unlayered rules would beat Tailwind utilities.

## Conventions

- Server Components by default; `"use client"` only where needed (planner, forms, map)
- **Reuse `src/components/ui` primitives, don't re-roll them:**
  - Surfaces: `Card` (server) / `MotionCard` (client list items) — both from `cardClasses()`. The **only** card hover is the built-in CSS lift (`-translate-y-0.5 hover:shadow-md`), applied only to cards with a primary action; **never `whileHover` on a card**.
  - Pills: `TogglePill` (multi-select) / `FilterPills` (single-select radiogroup) — both from `pillClasses()`. Never inline pill classes.
  - Headers: `PageHeader` (the page's one h1) → `ResultsHeader` (h2 over a result group) → `SectionHeader` (marketing bands only).
  - Overlays: `Modal` + `ModalHeader` / `ModalConfirmation` / `PriceBreakdown`; booking refs from `domain/booking.ts`.
  - Money: `Price` (serif brand-colored). Small status/label chips: `Badge`.
  - Also: Button, Container, Section, CityAutocomplete, SegmentedControl, Stepper, CycleField, ThemeToggle; motion vocab in `src/components/motion.ts`.
- Page shell: `pt-28 md:pt-32 pb-16 sm:pb-20`; result grids `gap-4`, `md:grid-cols-2 xl:grid-cols-3` for compact cards / `md:grid-cols-2` for content-heavy.
- New engine behavior gets a colocated Vitest test; keep the engine pure and deterministic
