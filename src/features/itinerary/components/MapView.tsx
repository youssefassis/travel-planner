"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { ItineraryDay } from "../types";

import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type Props = {
  itinerary: ItineraryDay[];
  activeDayId?: string | null;
  onSelectDay?: (dayId: string) => void;
};

const DAY_COLORS = ["#000000", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function MapView({ itinerary, activeDayId, onSelectDay }: Props) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const sourcesRef = useRef<string[]>([]);
  const clickHandlersRef = useRef<Record<string, () => void>>({});

  // INIT MAP
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [2.3522, 48.8566],
      zoom: 3,
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // CLEAN MAP
  const clearMap = (map: mapboxgl.Map) => {
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

  // RENDER ROUTES (FIXED: use day.activities[].location instead of day.destinations[].coordinates)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!map.isStyleLoaded()) {
      map.once("load", () => {
        // re-trigger render after load
      });
      return;
    }

    clearMap(map);

    const bounds = new mapboxgl.LngLatBounds();

    itinerary.forEach((day, index) => {
      const color = DAY_COLORS[index % DAY_COLORS.length];

      const coords: [number, number][] = [];

      day.activities.forEach((a) => {
        if (!a.location) return;

        const lngLat: [number, number] = [a.location[1], a.location[0]];

        coords.push(lngLat);
        bounds.extend(lngLat);

        const marker = new mapboxgl.Marker({ color }).setLngLat(lngLat).addTo(map);

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
        padding: 100,
        duration: 800,
      });
    }
  }, [itinerary, activeDayId, onSelectDay]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[420px] min-h-[420px] rounded-2xl overflow-hidden"
    />
  );
}
