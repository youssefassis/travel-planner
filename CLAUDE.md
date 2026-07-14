# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` — Start the Next.js dev server on http://localhost:3000. The app will auto-reload on file changes.
- `npm run build` — Build the production bundle.
- `npm start` — Start the production server.
- `npm run lint` — Run ESLint on the codebase (no auto-fix).

## Architecture

### Project Overview

This is an AI-powered travel planning application built with **Next.js 16** (App Router). Users input trip preferences, and the app generates customized itineraries with destinations, activities, and logistics.

**Key technologies:**
- **Next.js 16** with App Router (`app/` directory)
- **React 19** with Server and Client components (`"use client"`)
- **TypeScript** with strict mode enabled
- **Zustand** for client-side state management
- **Mapbox GL** for interactive maps and **Mapbox SDK** for geolocation
- **Framer Motion** for animations
- **Tailwind CSS v4** for styling
- **Geist Font** (via `next/font`)

### Code Organization

#### `/app/` — Next.js App Router Pages
- `layout.tsx` — Root layout with Header, Footer, and global styles (including Mapbox CSS)
- `page.tsx` — Landing page with hero, product preview, partners strip, and CTA sections
- `planner/page.tsx` — Main planner interface (3-column grid: sidebar filters, map canvas, suggestions panel)
- `planner/types.ts` — Planner-specific types (ItineraryDay, TripOption, etc.)

The planner page is **client-side only** (`"use client"`), uses Zustand to fetch user intent, and calls `generateTripPlan()` to generate itineraries whenever intent changes.

#### `/components/` — React Components

**Feature-based organization:**
- `planner/` — Planner-specific components (PlannerSidebar for filters, PlannerCanvas for map/itinerary, SuggestionsPanel for flights/stays/activities)
- `layout/` — Layout wrappers (AppShell, PageHeader, PageSection)
- `ui/` — Reusable UI primitives (Button, Card, Container, Section)
- **Root level** — Standalone sections (Header, Footer, TripCard, MapView, SearchPanel, etc.) and landing page sections

#### `/store/` — Zustand State Management

- `tripIntentStore.ts` — Single store for trip user intent (query, duration, companions, vibe preferences). Exports `useTripIntentStore` hook.

**TripIntent shape:**
```tsx
{ query, duration, companions, vibe: { pace, budget, activities } }
```

#### `/lib/` — Business Logic

- `tripEngine.ts` — Main export `generateTripPlan(intent)` that generates trip options. Internally:
  - Scores destinations based on intent (query match, budget alignment, pace)
  - Builds itineraries with ranked destinations
  - Generates 3 variations (best match, alternative route, exploration)
  - Calls `enrichWithActivities()` to attach activities to destinations
- `tripEngine/` — Modular trip engine submodules (internal exports used by `tripEngine.ts`)
- `mapActivities.ts` — Maps destination data to activity suggestions
- `geo.ts` — Geolocation utilities

#### `/types/` — TypeScript Type Definitions

- `tripIntent.tsx` — User intent shape
- `tripPlan.tsx` — Trip plan/itinerary shape
- `trip.tsx` — Destination/trip data shape

#### `/data/` — Destination Data
Static destination data used as seed for itinerary generation.

#### `/context/` — React Context
- `TripIntentContext.tsx` — Context provider for trip intent (minimal usage; Zustand is preferred)

#### `/services/providers/` — External Service Integration
Integrations with external providers (API clients, handlers).

#### `/state_old/` — Deprecated
Old state management code (ignored; use Zustand store instead).

### Styling

- **Tailwind v4** config in `tailwind.config.js`
- **CSS variables** for theming: `--bg`, `--fg`, `--primary` (set in `globals.css`)
- **Dark mode** support via `darkMode: "class"` in Tailwind config

### Configuration Files

- `tsconfig.json` — TypeScript strict mode, path alias `@/*` points to root
- `next.config.ts` — Minimal Next.js config (can be extended with image optimization, redirects, etc.)
- `eslint.config.mjs` — Next.js ESLint config (core web vitals + TypeScript rules)
- `postcss.config.mjs` — PostCSS config for Tailwind CSS v4
- `.env.local` — Runtime environment variables (e.g., Mapbox tokens)

## Development Notes

### Next.js 16 Breaking Changes
Before writing code, consult the Next.js 16 documentation in `node_modules/next/dist/docs/`. Key differences from older versions:
- App Router is the default structure.
- Layout files can be Server Components by default; use `"use client"` for Client Components.
- `useRouter` is imported from `next/navigation`, not `next/router`.
- No automatic static generation for dynamic routes; use `generateStaticParams()` if needed.

### Component Best Practices

- **Server vs Client Components:**
  - Landing page sections are server components (default in App Router)
  - Pages that need interactivity or hooks (e.g., `/planner`) are client components (`"use client"`)
  - Mapbox map renders in client components (requires DOM)

- **Naming Conventions:**
  - UI components in `components/ui/` are generic, reusable, and prefix-agnostic
  - Feature components in `components/planner/` or `components/layout/` are feature-specific
  - Page components (in `app/*/page.tsx`) are capitalized and match the route

### State Management Pattern

- Use `useTripIntentStore()` hook to read/write user preferences
- Call `patchIntent()` to update the store (full replace, not merge)
- Components automatically re-render when intent changes (Zustand reactivity)

### Mapbox Integration

- Mapbox GL CSS is imported in `layout.tsx` globally
- Mapbox token is stored in `.env.local`
- `MapView` component wraps Mapbox GL initialization
- `lib/geo.ts` contains geolocation utilities
- `lib/mapActivities.ts` enriches destinations with Mapbox-relevant activity data

### Testing & Linting

- `npm run lint` runs ESLint (no auto-fix; use IDE to fix or run with `--fix` manually)
- No test runner configured yet (consider adding Jest or Vitest when needed)

## Common Tasks

- **Modify planner layout:** Edit grid columns in `app/planner/page.tsx` (currently `grid-cols-[280px_1fr_340px]`)
- **Add new trip preferences:** Extend `TripIntent` type in `types/tripIntent.tsx`, then add UI controls in `PlannerSidebar`
- **Change color scheme:** Update CSS variables in `app/globals.css` (--bg, --fg, --primary, etc.)
- **Add new destinations:** Update seed data in `data/destinations.ts` and ensure fields match `Destination` type
- **Update trip scoring logic:** Edit `score()` function in `lib/tripEngine.ts`
