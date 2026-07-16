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

Imports flow one way: `app → features → domain`. `src/components` may be used by all layers. **Features never import each other** — cross-feature integration happens only through URL links (`/stays?city=…&budget=…&nights=…`, `/flights?from=…&to=…`, and into the planner: `/planner?destination=<cityId>&travelers=<solo|couple|group>&budget=<backpacker|comfort|luxury>` — parsed by `features/planner/lib/heroPrefill.ts` to prefill the wizard; share links `?plan=1&…` take precedence).

```
src/
  app/         Routes: (marketing) home, /planner, /flights, /stays
  domain/      Shared vocabulary: types, city dataset, geo helpers
  components/  ui/ primitives, layout/ (Header, Footer), theme/, motion.ts
  features/
    planner/   engine/ (trip generation), components/ (incl. wizard/), store/ (Zustand), lib/ (share, wizard step machine, heroPrefill)
    flights/   searchFlights + recommendFlights (decision support)
    stays/     adviseStays (neighborhood + accommodation advisor)
    marketing/ Landing-page sections
```

### The trip engine (`features/planner/engine`)

Pure and **deterministic**: the same `TripIntent` always produces the identical `TripPlan`. No `Date.now`/`Math.random`; ids are content-derived. This powers backend-free share links — the URL encodes the intent and the recipient regenerates the exact same plan (`lib/share.ts`).

Pipeline: `selectCities → orderRoute → allocateDays → dayPlans → transport → budget → generatePlan`. Plus:

- `schedule.ts` — timed day schedule; food POIs become lunch/dinner venues, nightlife lands after dinner
- `replan.ts` — pure plan-in → plan-out edits: `swapActivity`, `makeRainFriendly`, `addActivity`/`removeActivity`, `moveActivity` (reorder within a day, scheduling-class scoped), `moveActivityToDay` (same-city only), `removeDay` (city's last day removes the stop), `addCity`/`removeCity` (cheapest-insertion, day renumbering, budget recompute)

### Coordinates

`{lat, lng}` everywhere. `[lng, lat]` only at the MapLibre boundary via `toLngLat` in `src/domain/geo.ts`.

## Styling

- Tokens in `globals.css`: `--bg --fg --muted --border --card --card-subtle --input-bg --input-border --primary --accent --gradient-hero --header-bg` (light + dark variants)
- Type scale utilities: `.text-display .text-h1 .text-h2 .text-h3 .text-body-lg .text-small .text-caption`
- Radius: buttons/pills `rounded-full`, cards `rounded-xl`, media cards/map `rounded-2xl`
- Dark mode via next-themes (`attribute="class"`); style both themes
- Base form styles live in `@layer base` — unlayered rules would beat Tailwind utilities

## Conventions

- Server Components by default; `"use client"` only where needed (planner, forms, map)
- Reuse `src/components/ui` primitives (Button, Card, Container, Section, PageHeader, SectionHeader, CityAutocomplete, SegmentedControl, Stepper, CycleField, ThemeToggle) and the motion vocabulary in `src/components/motion.ts`
- New engine behavior gets a colocated Vitest test; keep the engine pure and deterministic
