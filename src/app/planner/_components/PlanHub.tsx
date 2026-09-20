"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";

import {
  addActivity,
  addCity,
  makeRainFriendly,
  moveActivity,
  moveActivityToDay,
  removeActivity,
  removeCity,
  removeDay,
  swapActivity,
  unusedPoisForCity,
} from "@/features/planner/engine";
import TripSummaryHeader from "@/features/planner/components/TripSummaryHeader";
import MapView from "@/features/planner/components/MapView";
import BudgetOverlay from "@/features/planner/components/BudgetOverlay";
import RouteStrip from "@/features/planner/components/RouteStrip";
import DayByDay from "@/features/planner/components/DayByDay";
import DayDetails from "@/features/planner/components/DayDetails";
import ShareTripBar from "@/features/planner/components/ShareTripBar";
import BookActivityPanel, {
  BookingTarget,
} from "@/features/planner/components/BookActivityPanel";
import {
  Booking,
  Bookings,
  TransportLeg,
  TripIntent,
  TripPlan,
} from "@/features/planner/types";
import { getCity } from "@/domain/cities";
import { dateOfDay } from "@/features/planner/lib/tripDates";
import { localISODate, tripProgress } from "@/features/planner/lib/today";
import { fadeInUp } from "@/components/motion";

import HubTabs, { HubTab } from "./HubTabs";
import ClimatePanel from "./ClimatePanel";
import { partySize } from "../_lib/derive";

// Non-itinerary tabs pull in the flights/stays/weather features + their data;
// splitting them keeps the initial /planner chunk lean.
const FlightsTab = dynamic(() => import("./FlightsTab"), { loading: TabSpinner });
const StaysTab = dynamic(() => import("./StaysTab"), { loading: TabSpinner });
const BudgetTab = dynamic(() => import("./BudgetTab"), { loading: TabSpinner });
const PrepareTab = dynamic(() => import("./PrepareTab"), { loading: TabSpinner });
const TodayTab = dynamic(() => import("./TodayTab"), { loading: TabSpinner });

function TabSpinner() {
  return <div className="py-20 text-center text-[var(--muted)]">Loading…</div>;
}

type Props = {
  trip: TripPlan;
  setTrip: (plan: TripPlan) => void;
  planIntent: TripIntent;
  activeDayId: string | null;
  setActiveDayId: (id: string | null) => void;
  onEdit: () => void;
  initialTab: HubTab;
  /** Keep this trip in the browser so it survives beyond the session. */
  onSave: () => void;
  isSaved: boolean;
  /** What the traveller has already reserved. */
  bookings: Bookings;
  onBooked: (booking: Booking) => void;
};

/** The revealed trip: a tabbed hub over one plan — itinerary, flights, stays,
 *  budget — with the map/route rail on the itinerary and share on every tab. */
export default function PlanHub({
  trip,
  setTrip,
  planIntent,
  activeDayId,
  setActiveDayId,
  onEdit,
  initialTab,
  onSave,
  isSaved,
  bookings,
  onBooked,
}: Props) {
  // A trip that is happening right now opens on Today, unless the URL asked
  // for something specific. PlanHub only ever renders client-side (a plan has
  // to exist first), so reading the clock here can't desync hydration.
  const [tab, setTab] = useState<HubTab>(() => {
    if (initialTab !== "itinerary") return initialTab;
    const progress = tripProgress(
      trip,
      planIntent.startDate,
      localISODate(new Date()),
    );
    return progress.phase === "during" ? "today" : "itinerary";
  });
  // Keep-alive: a tab mounts on first visit, then hides — so its entrance
  // animation runs once, while visible, and its local state survives switches.
  const [mounted, setMounted] = useState<Set<HubTab>>(() => new Set([tab]));

  const [booking, setBooking] = useState<BookingTarget | null>(null);
  const [climateCityId, setClimateCityId] = useState<string | null>(null);
  const [flightFocus, setFlightFocus] = useState<{ legId: string } | null>(null);
  const [staysCityId, setStaysCityId] = useState<string>(
    () => trip.stops[0]?.cityId ?? "",
  );

  const itinerary = trip.itinerary;
  const activeDayIndex = itinerary.findIndex((day) => day.id === activeDayId);
  const activeDay = activeDayIndex === -1 ? null : itinerary[activeDayIndex];
  const activeDayDate = dateOfDay(planIntent.startDate, activeDayIndex + 1);

  const selectTab = (next: HubTab) => {
    setTab(next);
    setMounted((m) => (m.has(next) ? m : new Set(m).add(next)));
    // Reflect the tab in the URL without a navigation, preserving other params.
    const params = new URLSearchParams(window.location.search);
    params.set("tab", next);
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  /* ── Itinerary edits ─────────────────────────────────────────── */

  const handleSwap = (activityId: string): boolean => {
    if (!activeDayId) return false;
    const next = swapActivity(trip, planIntent, activeDayId, activityId);
    if (!next) return false;
    setTrip(next);
    return true;
  };

  const handleRainDay = (): boolean => {
    if (!activeDayId) return false;
    const next = makeRainFriendly(trip, planIntent, activeDayId);
    if (!next) return false;
    setTrip(next);
    return true;
  };

  const handleRemoveActivity = (activityId: string) => {
    if (!activeDayId) return;
    const next = removeActivity(trip, planIntent, activeDayId, activityId);
    if (next) setTrip(next);
  };

  const handleAddActivity = (poiId: string) => {
    if (!activeDayId) return;
    const next = addActivity(trip, planIntent, activeDayId, poiId);
    if (next) setTrip(next);
  };

  const handleMoveActivity = (activityId: string, direction: "up" | "down"): boolean => {
    if (!activeDayId) return false;
    const next = moveActivity(trip, planIntent, activeDayId, activityId, direction);
    if (!next) return false;
    setTrip(next);
    return true;
  };

  const handleMoveToDay = (activityId: string, toDayId: string): boolean => {
    if (!activeDayId) return false;
    const next = moveActivityToDay(trip, planIntent, activeDayId, activityId, toDayId);
    if (!next) return false;
    setTrip(next);
    return true;
  };

  // City/day edits renumber day ids — keep the selection on the same city
  // when it survives, otherwise fall back to the first day.
  const applyCityEdit = (next: TripPlan | null): boolean => {
    if (!next) return false;
    const stillThere = next.itinerary.some((d) => d.id === activeDayId);
    const sameCity = activeDay
      ? next.itinerary.find((d) => d.cityId === activeDay.cityId)
      : undefined;
    setTrip(next);
    if (!stillThere) {
      setActiveDayId(sameCity?.id ?? next.itinerary[0]?.id ?? null);
    }
    return true;
  };

  const handleAddCity = (cityId: string): boolean =>
    applyCityEdit(addCity(trip, planIntent, cityId));

  const handleRemoveCity = (cityId: string): boolean =>
    applyCityEdit(removeCity(trip, planIntent, cityId));

  const handleRemoveDay = (): boolean => {
    if (!activeDayId) return false;
    return applyCityEdit(removeDay(trip, planIntent, activeDayId));
  };

  const availablePois = useMemo(
    () => (activeDay ? unusedPoisForCity(trip, activeDay.cityId) : []),
    [trip, activeDay],
  );

  const size = partySize(planIntent);

  const goToStays = (cityId: string) => {
    if (trip.stops.some((s) => s.cityId === cityId)) setStaysCityId(cityId);
    selectTab("stays");
  };

  // A fresh object each click, so re-clicking the same leg scrolls again.
  const goToFlights = (leg?: TransportLeg) => {
    setFlightFocus(leg ? { legId: leg.id } : null);
    selectTab("flights");
  };

  // Keep the Stays selection valid as cities are added/removed.
  const validStaysCityId = trip.stops.some((s) => s.cityId === staysCityId)
    ? staysCityId
    : (trip.stops[0]?.cityId ?? "");

  return (
    <div className="space-y-6">
      <TripSummaryHeader
        plan={trip}
        intent={planIntent}
        onEdit={onEdit}
        onSave={onSave}
        isSaved={isSaved}
        actions={
          <ShareTripBar plan={trip} intent={planIntent} pace={planIntent.vibe.pace} />
        }
      />

      <div className="sticky top-20 z-20 -mx-4 px-4 py-2 bg-[var(--bg)]/85 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg)]/70 print:hidden">
        <HubTabs active={tab} onChange={selectTab} />
      </div>

      {/* Itinerary — always mounted: it owns the map/route rail. */}
      <div hidden={tab !== "itinerary"}>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8">
          <section className="space-y-4">
            <DayByDay
              itinerary={itinerary}
              activeDayId={activeDayId}
              setActiveDayId={setActiveDayId}
              legs={trip.legs}
              startDate={planIntent.startDate}
            >
              <DayDetails
                day={activeDay}
                stops={trip.stops}
                pace={planIntent.vibe.pace}
                travelMonth={planIntent.travelMonth}
                date={activeDayDate}
                availablePois={availablePois}
                onSwap={handleSwap}
                onRainDay={handleRainDay}
                onBook={(activity, startMin) =>
                  setBooking({ activity, dayLabel: activeDay?.label ?? "", startMin })
                }
                onRemove={handleRemoveActivity}
                onAdd={handleAddActivity}
                onMove={handleMoveActivity}
                onMoveToDay={handleMoveToDay}
                onRemoveDay={handleRemoveDay}
                onShowClimate={setClimateCityId}
                onFindStays={goToStays}
              />
            </DayByDay>
          </section>

          <aside>
            <div className="space-y-4 lg:sticky lg:top-36">
              <MapView
                itinerary={itinerary}
                activeDayId={activeDayId}
                onSelectDay={setActiveDayId}
                stops={trip.stops}
                legs={trip.legs}
                className="h-[260px] lg:h-[300px]"
              />
              <RouteStrip
                stops={trip.stops}
                legs={trip.legs}
                outbound={trip.outbound}
                homebound={trip.homebound}
                itinerary={itinerary}
                setActiveDayId={setActiveDayId}
                onRemoveCity={handleRemoveCity}
                onAddCity={handleAddCity}
                onFlightLeg={goToFlights}
              />
              <BudgetOverlay
                budget={trip.budget}
                onViewDetails={() => selectTab("budget")}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Flights */}
      {mounted.has("flights") && (
        <div hidden={tab !== "flights"}>
          <FlightsTab trip={trip} intent={planIntent} focus={flightFocus} />
        </div>
      )}

      {/* Stays */}
      {mounted.has("stays") && (
        <div hidden={tab !== "stays"}>
          <StaysTab
            trip={trip}
            intent={planIntent}
            cityId={validStaysCityId}
            onCityChange={setStaysCityId}
          />
        </div>
      )}

      {/* Budget */}
      {mounted.has("budget") && (
        <div hidden={tab !== "budget"}>
          <BudgetTab
            trip={trip}
            bookings={bookings}
            onGoToFlights={() => selectTab("flights")}
            onGoToStays={() => selectTab("stays")}
          />
        </div>
      )}

      {/* Today */}
      {mounted.has("today") && (
        <div hidden={tab !== "today"}>
          <TodayTab
            trip={trip}
            intent={planIntent}
            bookings={bookings}
            onOpenDay={(dayId) => {
              setActiveDayId(dayId);
              selectTab("itinerary");
            }}
            onEdit={onEdit}
          />
        </div>
      )}

      {/* Prepare */}
      {mounted.has("prepare") && (
        <div hidden={tab !== "prepare"}>
          <PrepareTab
            trip={trip}
            intent={planIntent}
            bookings={bookings}
            onBook={(activity, dayLabel) =>
              setBooking({ activity, dayLabel, startMin: null })
            }
          />
        </div>
      )}

      {/* Attraction / restaurant booking */}
      <AnimatePresence>
        {booking && (
          <motion.div variants={fadeInUp}>
            <BookActivityPanel
              target={booking}
              partySize={size}
              onBooked={onBooked}
              onClose={() => setBooking(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Best time to visit */}
      {climateCityId && (
        <ClimatePanel
          cityId={climateCityId}
          cityName={getCity(climateCityId)?.name ?? "this city"}
          onClose={() => setClimateCityId(null)}
          onFindStays={goToStays}
        />
      )}
    </div>
  );
}
