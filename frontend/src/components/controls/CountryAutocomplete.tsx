import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Country } from "../../api/types";
import "./Controls.css";

interface CountryAutocompleteProps {
  countries: Country[];
  value: string;
  onChange: (country: string) => void;
  label: string;
  placeholder?: string;
}

export function CountryAutocomplete({ countries, value, onChange, label, placeholder }: CountryAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [value]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries.slice(0, 8);
    return countries.filter((c) => c.country.toLowerCase().includes(q)).slice(0, 8);
  }, [countries, query]);

  function select(country: Country) {
    onChange(country.country);
    setQuery(country.country);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (matches[activeIndex]) select(matches[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery(value);
    }
  }

  return (
    <div className="combobox" ref={rootRef}>
      <label className="combobox__label eyebrow" htmlFor={listId}>
        {label}
      </label>
      <input
        id={listId}
        className="combobox__input"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${listId}-list`}
        autoComplete="off"
        placeholder={placeholder ?? "Rechercher un pays…"}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIndex(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {open && matches.length > 0 && (
        <ul className="combobox__list thin-scroll" role="listbox" id={`${listId}-list`}>
          {matches.map((c, i) => (
            <li
              key={c.iso_code}
              role="option"
              aria-selected={i === activeIndex}
              className={`combobox__option${i === activeIndex ? " is-active" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                select(c);
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span>{c.country}</span>
              <span className="combobox__iso">{c.iso_code}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
