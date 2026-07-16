"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { City } from "@/domain/types";
import { toLngLat } from "@/domain/geo";

import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  pool: City[];
  /** Increment to trigger a spin toward `winner`. 0 = no spin yet. */
  spinToken: number;
  /** The city to land on when spinToken changes. */
  winner: City | null;
  /** Fired once the globe finishes flying to the winner. */
  onLanded: (city: City) => void;
  className?: string;
};

const POOL_SOURCE = "discover-pool";
const SPIN_MS = 2200;
const POOL_COLOR = "#f97316";

export default function GlobeSpinner({
  pool,
  spinToken,
  winner,
  onLanded,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const rafRef = useRef<number | null>(null);
  const winnerMarkerRef = useRef<maplibregl.Marker | null>(null);
  const onLandedRef = useRef(onLanded);
  useEffect(() => {
    onLandedRef.current = onLanded;
  }, [onLanded]);

  const [styleLoaded, setStyleLoaded] = useState(false);

  // INIT — a draggable globe, scroll-zoom off so it stays a contained toy.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [10, 25],
      zoom: 1.4,
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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
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

  // SPIN — reset to a full-globe view, spin with an ease-out, then fly to the
  // winner and drop a marker. Runs once per spinToken bump.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoaded || spinToken === 0 || !winner) return;

    winnerMarkerRef.current?.remove();
    winnerMarkerRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    map.jumpTo({ center: [map.getCenter().lng, 20], zoom: 1.4 });
    const startLng = map.getCenter().lng;
    const totalSpin = 2.5 * 360;
    let startTime: number | null = null;

    const step = (t: number) => {
      if (startTime === null) startTime = t;
      const p = Math.min(1, (t - startTime) / SPIN_MS);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic — fast then settling
      map.setCenter([startLng + totalSpin * eased, 20]);

      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      rafRef.current = null;
      const dest = toLngLat(winner.coords);
      map.flyTo({ center: dest, zoom: 4.2, duration: 1600, essential: true });
      map.once("moveend", () => {
        const el = document.createElement("div");
        el.className =
          "px-2.5 py-1 rounded-full bg-[var(--primary)] text-white text-xs font-semibold shadow-md whitespace-nowrap border-2 border-white";
        el.textContent = winner.name;
        winnerMarkerRef.current = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat(dest)
          .addTo(map);
        onLandedRef.current(winner);
      });
    };

    rafRef.current = requestAnimationFrame(step);
  }, [spinToken, winner, styleLoaded]);

  return (
    <div
      ref={containerRef}
      className={`w-full rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card-subtle)] ${
        className ?? "h-[360px] sm:h-[440px]"
      }`}
    />
  );
}
