# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` — Start the Next.js dev server on http://localhost:3000 (Turbopack). Requires `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local` for the planner's map to render.
- `npm run build` — Build the production bundle.
- `npm start` — Start the production server.
- `npm run lint` — Run ESLint (no auto-fix). Keep this at zero errors/warnings; never grow the baseline.
- `npm t` — Run the Vitest suite (`vitest run`). Covers the trip engine and the shared dataset.

## Architecture

### Project overview

Wanderly is an AI-styled (currently rule-based, no LLM) travel planning app built with **Next.js 16** (App Router). It has three independently usable features that share one dataset:

1. **Planner** (`/planner`) — set trip preferences (or pick cities directly) and get a multi-city road-trip itinerary: ordered route, per-city day plans, intercity transport, and a budget breakdown.
2. **Flights** (`/flights`) — standalone flight search over the same city dataset.
3. **Stays** (`/stays`) — standalone accommodation search over the same city dataset.

**Key technologies:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Zustand · Mapbox GL + Mapbox SDK · Framer Motion · Tailwind CSS v4 · Vitest.

### Layering rule — read this before adding a file

```
app/  →  features/*  →  domain/  →  (nothing)
components/  (importable by app and any feature)
```

- **`domain/`** is the shared, framework-free layer: types and the city dataset. It imports nothing from `features/` or `app/`.
- **`features/*`** never import from each other. `features/planner` must not import from `features/flights` or `features/stays`, and vice versa. Each feature must work if the others were deleted.
- **Cross-feature integration happens only through links with URL query params** — e.g. the planner's "Find stays →" / "Find flights →" buttons are plain `<a href="/stays?city=...">` / `<a href="/flights?from=...&to=...">` links, not imports. See "Cross-feature deep links" below.
- **`app/`** route files should stay thin: state + composition, delegating logic to `features/*`.

### Code organization

#### `/src/domain/` — Shared domain layer (no React, no feature imports)
- `types.ts` — `Coordinates`, `BudgetTier`, `Pace`, `Climate`, `Interest`, `Region`, `PoiCategory`, `Poi`, `City`.
- `geo.ts` — `distanceKm(a, b)` (Haversine, km) and `toLngLat(c)`. The app's coordinate convention is `{ lat, lng }` **everywhere**; `[lng, lat]` tuples exist only at the Mapbox boundary, produced by `toLngLat`. Don't reintroduce raw tuple indexing.
- `cities/` — the city dataset, one file per region (`france.ts`, `iberia.ts`, `italy.ts`, `central.ts`, `benelux.ts`, `british-isles.ts`, `nordics.ts`, `balkans.ts`, `east.ts`), aggregated by `cities/index.ts` into `CITIES: City[]`, `CITY_BY_ID`, `getCity(id)`, and `citiesByCountry()`. ~41 European cities, each with 5-8 POIs, tiered stay/food costs, and min/max recommended days.
  - Adding a city: follow the existing entries for id conventions (`kebab-city-country`, e.g. `lisbon-pt`; POI ids `cityid-poi-slug`), realistic tiered pricing, and 5-8 POIs with real-ish coordinates near the city center.
  - `cities/index.test.ts` and `geo.test.ts` are dataset/geo sanity tests (unique ids, POI counts, Europe bounding box) — keep them passing when editing the dataset.

#### `/src/features/planner/` — Trip planning feature
- `types.ts` — `TripIntent`, `TripPlan`, `CityStay`, `TransportLeg`, `BudgetBreakdown`, `ItineraryDay`, `Activity`.
- `engine/` — the rule-based trip engine. **Pure, synchronous, deterministic**: same `TripIntent` in → identical `TripPlan` out (no `Math.random`, no `Date.now`, no `crypto.randomUUID`; ids are derived from content). Entry point is `generateTripPlan(intent, cities = CITIES)` in `generatePlan.ts`, which orchestrates:
  `selectCities` (surprise mode: score + filter + greedy pick) → `orderRoute` (nearest-neighbor from the origin) → `allocateDays` (distributes trip length across cities by min/max stay) → `buildCityDayPlans` (ranks POIs by interest/budget fit, deals them into days, pads short-POI cities with a free filler activity) → `pickTransportLeg` (distance-banded car/bus/train/flight cost+duration formula) → `computeBudget`.
  Every module has a colocated `*.test.ts`. Run `npm t` after any engine change.
- `store/tripIntentStore.ts` — Zustand store for `TripIntent`. `patchIntent(patch: Partial<TripIntent>)` does a partial merge — pass small partials, not full-object spreads (remember to spread `intent.vibe` yourself for nested fields).
- `components/` — `TripCommandBar` (horizontal trip brief: origin autocomplete, duration stepper, Who/Budget cycle fields, mode toggle, collapsible "More filters" for pace/interests/climate/region/cities, Generate button), `MapView` (Mapbox: always-visible city markers + leg lines, POI markers scoped to the active city's day), `BudgetOverlay` (compact expandable budget card docked over the map), `RouteStrip` (stop pills + transport leg badges; flight legs deep-link to `/flights`), `DayTimeline` (horizontal scrollable day tabs), `DayDetails` (selected day's activities + `/stays` deep link).
- Generation is **explicit**: the planner regenerates once on mount and whenever the command bar's Generate button is clicked — not on every keystroke.

#### `/src/features/flights/` and `/src/features/stays/` — Standalone search features
- Each owns its own `types.ts` and a deterministic mock search lib (`lib/searchFlights.ts`, `lib/searchStays.ts`) over `@/domain/cities` — same-input-same-output (string-hash based variation, not `Math.random`).
- Each page (`app/flights/page.tsx`, `app/stays/page.tsx`) reads prefill state from `useSearchParams` (wrapped in `<Suspense>`) and auto-searches when enough params are present.

#### Cross-feature deep links (query-param contract)
- `/stays?city={cityId}&budget={backpacker|comfort|luxury}&nights={n}`
- `/flights?from={cityId}&to={cityId}`

Both params are domain city ids (e.g. `paris-fr`). Prefer extending this contract over adding a cross-feature import.

#### `/src/features/marketing/` — Landing page sections
Server components rendered from `app/(marketing)/page.tsx`. No shared state.

#### `/src/components/`
- `ui/` — generic primitives: `Button` (variants incl. `asLink` for `next/link`-backed buttons), `Card`, `Container`, `SectionHeader`.
- `layout/` — `Header`, `Footer` (used by the root layout). Don't add more here unless it's genuinely used by more than one route — this directory has previously accumulated unused wrappers.

#### `/src/app/` — Routes
- `layout.tsx` — root layout: fonts, `Header`/`Footer`, imports `globals.css` (incl. Mapbox GL CSS is imported inside `MapView.tsx`, not globally).
- `(marketing)/page.tsx`, `planner/page.tsx`, `flights/page.tsx`, `stays/page.tsx`.

### Styling
- Tailwind v4, config in `tailwind.config.js` (`darkMode: "class"`).
- CSS variables defined in `src/app/globals.css`: `--bg`, `--fg`, `--muted`, `--border`, `--card`, `--card-subtle`, `--primary` (+ `-dark`/`-light`), `--accent` (+ `-light`/`-dark`), plus gradient tokens. Use these vars, not hardcoded colors.

### Testing
- Vitest (`npm t`), node environment, `@` alias → `./src`. Currently covers the trip engine (`features/planner/engine/*.test.ts`) and the dataset/geo layer (`domain/**/*.test.ts`). No component/UI tests yet (no jsdom setup) — if you add one, add the jsdom dependency and config deliberately rather than assuming it's there.
- No E2E test runner is configured. Verify UI changes by running `npm run dev` and driving the app in a real (or headless) browser.

## Common tasks

- **Add a trip preference**: extend `TripIntent` in `features/planner/types.ts`, wire a control into `TripCommandBar.tsx`, and use it in the relevant `engine/` module (most preferences flow through `selectCities.ts`, `buildCityDayPlans` (interest/budget ranking), or `pickTransportLeg` (budget tier)).
- **Add cities**: add entries to the appropriate `domain/cities/<region>.ts` file (or a new region file + `Region` union member), matching the existing schema and id conventions. Re-run `npm t`.
- **Change trip-scoring or transport-cost logic**: edit the relevant `features/planner/engine/*.ts` module and its colocated test — the engine's modules are small and single-purpose (`score.ts`, `selectCities.ts`, `orderRoute.ts`, `allocateDays.ts`, `transport.ts`, `dayPlans.ts`, `budget.ts`).
- **Change color scheme**: update CSS variables in `src/app/globals.css`.
- **Link a new cross-feature action**: add a plain `<a href="...">` with query params (see the deep-link contract above) rather than importing across features.
