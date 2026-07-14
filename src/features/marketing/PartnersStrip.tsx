"use client";

import { useMemo } from "react";
import {
  SiAirbnb,
  SiTripadvisor,
  SiGoogle,
  SiBookingdotcom,
  SiOpenstreetmap,
} from "react-icons/si";

const PARTNERS = [
  { name: "Airbnb", Icon: SiAirbnb, color: "#FF5A5F" },
  { name: "Tripadvisor", Icon: SiTripadvisor, color: "#34E0A1" },
  { name: "Google", Icon: SiGoogle, color: "#4285F4" },
  { name: "Booking.com", Icon: SiBookingdotcom, color: "#003580" },
  { name: "OpenStreetMap", Icon: SiOpenstreetmap, color: "#7EBC6F" },
];

function Logo({ name, Icon, color }: { name: string; Icon: React.ElementType; color: string }) {
  return (
    <div
      className="group flex items-center justify-center px-10 py-6 rounded-2xl transition-all duration-300
                 opacity-50 hover:opacity-100 hover:scale-105"
    >
      <Icon
        size={40}
        color={color}
        className="grayscale group-hover:grayscale-0 transition-all duration-300"
        aria-label={name}
      />
    </div>
  );
}

export default function PartnersStrip() {
  const loop = useMemo(() => [...PARTNERS, ...PARTNERS, ...PARTNERS], []);

  return (
    <section className="relative border-y border-[var(--border)] bg-[var(--bg)] py-8 overflow-hidden">
      <p className="text-center text-xs uppercase tracking-widest text-[var(--muted)] mb-6 font-medium">
        Trusted by leading platforms
      </p>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--bg)] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--bg)] to-transparent z-10" />

      <div className="overflow-hidden">
        <div className="flex w-max gap-10 animate-marquee hover:[animation-play-state:paused]">
          {loop.map((item, i) => (
            <Logo
              key={`${item.name}-${i}`}
              name={item.name}
              Icon={item.Icon}
              color={item.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
