"use client";

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import { CITIES, getCity } from "@/domain/cities";
import { City } from "@/domain/types";

const MAX_SUGGESTIONS = 8;

function displayName(city: City): string {
  return `${city.name}, ${city.country}`;
}

type Props = {
  value: string;
  onChange: (cityId: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  /** "field" (default): bordered input with a leading pin icon, matching
   * other form fields. "bare": transparent/borderless, larger text, no
   * leading icon — for embedding in a custom search bar that already has
   * its own icon and surrounding chrome (e.g. the marketing hero). */
  variant?: "field" | "bare";
};

export default function CityAutocomplete({
  value,
  onChange,
  placeholder = "Search a city...",
  id,
  className = "",
  variant = "field",
}: Props) {
  const [query, setQuery] = useState(() => {
    const city = getCity(value);
    return city ? displayName(city) : "";
  });
  // Tracks the last `value` we synced `query` from, so an external change
  // (deep-link prefill, clearing the field elsewhere) can reset the
  // displayed text during render rather than via an effect.
  const [syncedValue, setSyncedValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = `${id ?? "city"}-listbox`;

  if (value !== syncedValue) {
    setSyncedValue(value);
    const city = getCity(value);
    setQuery(city ? displayName(city) : "");
    setHighlightedIndex(0);
  }

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...CITIES].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return sorted.slice(0, MAX_SUGGESTIONS);
    return sorted
      .filter((city) => displayName(city).toLowerCase().includes(q))
      .slice(0, MAX_SUGGESTIONS);
  }, [query]);

  // Close on outside click (mousedown fires before the input's blur, so a
  // click on a suggestion still registers).
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        const city = getCity(value);
        setQuery(city ? displayName(city) : "");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [value]);

  const selectCity = (city: City) => {
    onChange(city.id);
    setQuery(displayName(city));
    setIsOpen(false);
  };

  const clear = () => {
    onChange("");
    setQuery("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const city = suggestions[highlightedIndex];
      if (city) selectCity(city);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      const city = getCity(value);
      setQuery(city ? displayName(city) : "");
    }
  };

  const fieldClasses =
    "w-full pl-9 pr-8 py-2 sm:py-3 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] text-sm";
  const bareClasses =
    "w-full bg-transparent text-[var(--fg)] text-lg md:text-xl font-medium placeholder-[var(--muted)] border-none outline-none";

  return (
    <div ref={rootRef} className="relative">
      <div className="relative flex items-center">
        {variant === "field" && (
          <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
        )}
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            isOpen && suggestions[highlightedIndex]
              ? `${listboxId}-${suggestions[highlightedIndex].id}`
              : undefined
          }
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightedIndex(0);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${variant === "field" ? fieldClasses : bareClasses} ${className}`}
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear"
            className={`shrink-0 flex items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--fg)] transition-colors ${
              variant === "field"
                ? "absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5"
                : "w-6 h-6 ml-2"
            }`}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg"
        >
          {suggestions.map((city, i) => (
            <li key={city.id} role="presentation">
              <button
                type="button"
                id={`${listboxId}-${city.id}`}
                role="option"
                aria-selected={city.id === value}
                onClick={() => selectCity(city)}
                onMouseEnter={() => setHighlightedIndex(i)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  i === highlightedIndex
                    ? "bg-[var(--card-subtle)] text-[var(--fg)]"
                    : "text-[var(--fg)] hover:bg-[var(--card-subtle)]"
                }`}
              >
                {city.name}
                <span className="text-[var(--muted)]">, {city.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.trim() && suggestions.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg px-4 py-3 text-sm text-[var(--muted)]">
          No cities found.
        </div>
      )}
    </div>
  );
}
