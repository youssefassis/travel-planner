# Wanderly

One place to plan a trip. Set your preferences — or pick cities directly — and Wanderly builds a full round trip from your front door: the journey out, the route between cities, a day-by-day itinerary, a budget breakdown, the journey home, plus flight recommendations and stay advice.

Everything runs client-side on a curated city dataset. No backend, no API keys.

## Features

- **Budget-first discovery** (`/explore`) — name your money, your dates, and who's coming, and see every destination it reaches, best trip first. Each figure is a real generated plan, so the estimate is what you get when you click through.
- **Trip planner** (`/planner`) — three quick questions, then a full plan: optimized route, realistic timed daily schedules (meals at restaurants, nightlife after dinner), pace-aware load, booking checklist, and an interactive map (MapLibre + OpenFreeMap). Your home city bookends the trip instead of appearing as a stop on it, so getting there and back is costed like every other leg.
- **Editable plans** — swap a stop, remove a museum, add an unused sight, make a day rain-friendly, add or remove whole cities; the route, day numbering, and budget recompute instantly.
- **Budgets in one unit** — every figure is per person, with the whole party's total alongside it.
- **Travel days that cost time** — a day you arrive on starts when the train does, a day you fly home on ends before the flight, and both hold fewer stops than a full day. The journeys show up on the timeline, in the print-out, and in the calendar export.
- **Real dates** — pin a start date and the itinerary picks up weekdays and calendar dates, flight legs search their actual departure day, and the trip exports to `.ics`. Leave it out and the plan works in Day 1..N as before.
- **Saved trips** — the planner restores what you were last looking at after a refresh, and trips you save are listed before the wizard so you can pick one back up. Everything stays in your browser.
- **Share & export** — copy a link that regenerates the identical plan (the engine is deterministic), add it to a calendar, open the route in Google Maps, share as text, or print to PDF.
- **Flights** (`/flights`) — decision support: a handful of recommendations tailored to your priorities with trade-offs and full expected cost, not an endless results list.
- **Stays** (`/stays`) — advisor-style picks: matching neighborhoods with reasoning, a shortlist of accommodations with strengths and totals including taxes and fees.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
```

Other scripts: `npm run build`, `npm run lint`, `npm t` (Vitest).

## Tech

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand · Framer Motion · MapLibre GL · Vitest

Architecture notes for contributors (layering rules, engine internals, design tokens) live in [CLAUDE.md](CLAUDE.md).
