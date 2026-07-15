"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { CityStay, ItineraryDay, TransportLeg } from "../types";
import { toLngLat } from "@/domain/geo";

import "maplibre-gl/dist/maplibre-gl.css";


type Props = {
  itinerary: ItineraryDay[];
  activeDayId?: string | null;
  onSelectDay?: (dayId: string) => void;
  stops?: CityStay[];
  legs?: TransportLeg[];
  /** Overrides the default height classes (e.g. for a sidebar placement). */
  className?: string;
};

const DAY_COLORS = ["#000000", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
const ROUTE_COLOR = "#94a3b8";

export default function MapView({
  itinerary,
  activeDayId,
  onSelectDay,
  stops = [],
  legs = [],
  className,
}: Props) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [styleLoaded, setStyleLoaded] = useState(false);

  const markersRef = useRef<maplibregl.Marker[]>([]);
  const sourcesRef = useRef<string[]>([]);
  const clickHandlersRef = useRef<Record<string, () => void>>({});

  // INIT MAP
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [2.3522, 48.8566],
      zoom: 3,
      // Collapsed to the (i) icon — the full bar covers a compact map.
      attributionControl: { compact: true },
    });

    mapRef.current = map;

    const handleLoad = () => {
      setStyleLoaded(true);
      // The compact attribution control starts expanded; collapse it to the
      // (i) toggle so it doesn't cover the bottom of a small map.
      containerRef.current
        ?.querySelector(".maplibregl-ctrl-attrib")
        ?.classList.remove("maplibregl-compact-show");
    };
    map.on("load", handleLoad);

    // MapLibre only self-handles window resizes; layout-driven container
    // resizes (breakpoint changes, column reflow) need an explicit resize.
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.off("load", handleLoad);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // CLEAN MAP
  const clearMap = (map: maplibregl.Map) => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    sourcesRef.current.forEach((id) => {
      const layerId = `${id}-line`;

      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }

      if (map.getSource(id)) {
        map.removeSource(id);
      }

      const handler = clickHandlersRef.current[layerId];
      if (handler) {
        map.off("click", layerId, handler);
      }
    });

    sourcesRef.current = [];
    clickHandlersRef.current = {};
  };

  // RENDER ROUTES
  useEffect(() => {
    const map = mapRef.current;
    // Gated on styleLoaded (set once by the "load" listener in the init
    // effect) instead of a one-off isStyleLoaded() check with an empty
    // callback body — this guarantees the render logic below re-runs once
    // the style is actually ready, even if data arrives before "load" fires.
    if (!map || !styleLoaded) return;

    clearMap(map);

    const bounds = new maplibregl.LngLatBounds();

    // --- CITY MARKERS (always visible waypoints) ---
    const cityCoordsById = new Map<string, [number, number]>();

    stops.forEach((stop) => {
      const lngLat = toLngLat(stop.coords);
      cityCoordsById.set(stop.cityId, lngLat);
      bounds.extend(lngLat);

      const el = document.createElement("div");
      el.className =
        "px-2.5 py-1 rounded-full bg-[var(--primary)] text-white text-xs font-semibold shadow-md whitespace-nowrap border-2 border-white";
      el.textContent = stop.city;

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(lngLat)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // --- LEG LINES (primary route geometry, always visible) ---
    legs.forEach((leg) => {
      const from = cityCoordsById.get(leg.fromCityId);
      const to = cityCoordsById.get(leg.toCityId);
      if (!from || !to) return;

      const sourceId = `leg-${leg.id}`;
      const layerId = `${sourceId}-line`;

      sourcesRef.current.push(sourceId);

      map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [from, to],
          },
          properties: {},
        },
      });

      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": ROUTE_COLOR,
          "line-width": 3,
          ...(leg.mode === "flight" ? { "line-dasharray": [2, 2] } : {}),
        },
      });
    });

    // --- POI MARKERS + PER-DAY ROUTE (scoped to the active city only) ---
    const activeDay = itinerary.find((d) => d.id === activeDayId);
    const activeCityId = activeDay?.cityId;

    const coloredDays = itinerary.map((day, index) => ({
      day,
      color: DAY_COLORS[index % DAY_COLORS.length],
    }));

    const visibleDays = activeCityId
      ? coloredDays.filter(({ day }) => day.cityId === activeCityId)
      : coloredDays;

    visibleDays.forEach(({ day, color }) => {
      const coords: [number, number][] = [];

      day.activities.forEach((a) => {
        if (!a.location) return;

        const lngLat = toLngLat(a.location);

        coords.push(lngLat);
        bounds.extend(lngLat);

        const marker = new maplibregl.Marker({ color }).setLngLat(lngLat).addTo(map);

        markersRef.current.push(marker);
      });

      if (coords.length < 2) return;

      const sourceId = `route-${day.id}`;
      const layerId = `${sourceId}-line`;

      sourcesRef.current.push(sourceId);

      map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: coords,
          },
          properties: {},
        },
      });

      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": color,
          "line-width": activeDayId === day.id ? 5 : 3,
          "line-opacity": activeDayId && activeDayId !== day.id ? 0.25 : 0.9,
        },
      });

      const handler = () => onSelectDay?.(day.id);

      clickHandlersRef.current[layerId] = handler;
      map.on("click", layerId, handler);
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, {
        // Extra room at the bottom keeps pins clear of the attribution icon.
        padding: { top: 40, right: 40, left: 40, bottom: 56 },
        duration: 800,
      });
    }
  }, [itinerary, activeDayId, onSelectDay, stops, legs, styleLoaded]);

  return (
    <div
      ref={containerRef}
      className={`w-full rounded-xl overflow-hidden border border-[var(--border)] ${
        className ?? "h-[300px] sm:h-[400px] lg:h-[480px] min-h-[300px]"
      }`}
    />
  );
}
