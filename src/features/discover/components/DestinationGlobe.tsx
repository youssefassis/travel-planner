"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { City } from "@/domain/types";
import { toLngLat } from "@/domain/geo";

import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  pool: City[];
  /** The landed city to fly to; null keeps the globe at its world view. */
  focus: City | null;
  className?: string;
};

const POOL_SOURCE = "discover-pool";
const POOL_COLOR = "#bc3f2b";
const WORLD_VIEW = { center: [10, 25] as [number, number], zoom: 1.4 };

/**
 * The reveal half of Spin the globe: a draggable globe showing every city
 * the spin could pick, which flies to the one the departure board settled on.
 */
export default function DestinationGlobe({ pool, focus, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [styleLoaded, setStyleLoaded] = useState(false);

  // INIT — scroll-zoom off so it stays a contained toy inside the page.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      ...WORLD_VIEW,
      attributionControl: { compact: true },
      scrollZoom: false,
    });
    mapRef.current = map;

    const handleLoad = () => {
      map.setProjection({ type: "globe" });
      setStyleLoaded(true);
      containerRef.current
        ?.querySelector(".maplibregl-ctrl-attrib")
        ?.classList.remove("maplibregl-compact-show");
    };
    map.on("load", handleLoad);

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.off("load", handleLoad);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // POOL DOTS — the candidate cities the spin can land on.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoaded) return;

    const data: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: pool.map((city) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: toLngLat(city.coords) },
        properties: { id: city.id },
      })),
    };

    const source = map.getSource(POOL_SOURCE) as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(data);
      return;
    }

    map.addSource(POOL_SOURCE, { type: "geojson", data });
    map.addLayer({
      id: `${POOL_SOURCE}-glow`,
      type: "circle",
      source: POOL_SOURCE,
      paint: { "circle-radius": 7, "circle-color": POOL_COLOR, "circle-opacity": 0.25 },
    });
    map.addLayer({
      id: `${POOL_SOURCE}-dot`,
      type: "circle",
      source: POOL_SOURCE,
      paint: {
        "circle-radius": 3.5,
        "circle-color": POOL_COLOR,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 1,
      },
    });
  }, [pool, styleLoaded]);

  // FOCUS — fly to the destination the board landed on and pin it. Clearing
  // the focus (a new spin) returns the globe to the world view.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoaded) return;

    markerRef.current?.remove();
    markerRef.current = null;

    if (!focus) {
      map.flyTo({ ...WORLD_VIEW, duration: 900, essential: true });
      return;
    }

    const dest = toLngLat(focus.coords);
    map.flyTo({ center: dest, zoom: 4.2, duration: 1600, essential: true });

    const el = document.createElement("div");
    el.className =
      "px-2.5 py-1 rounded-full bg-[var(--primary)] text-white text-xs font-semibold shadow-md whitespace-nowrap border-2 border-white";
    el.textContent = focus.name;
    markerRef.current = new maplibregl.Marker({ element: el, anchor: "bottom" })
      .setLngLat(dest)
      .addTo(map);
  }, [focus, styleLoaded]);

  return (
    <div
      ref={containerRef}
      className={`w-full rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card-subtle)] ${
        className ?? "h-[320px] sm:h-[400px]"
      }`}
    />
  );
}
