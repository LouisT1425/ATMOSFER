import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Country } from "../../api/types";
import "./Controls.css";

interface CountryMultiSelectProps {
  countries: Country[];
  value: string[];
  onChange: (countries: string[]) => void;
  label: string;
  max?: number;
  getColor: (index: number) => string;
}

export function CountryMultiSelect({ countries, value, onChange, label, max = 6, getColor }: CountryMultiSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const atMax = value.length >= max;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const matches = useMemo(() => {
    if (atMax) return [];
    const q = query.trim().toLowerCase();
    const pool = countries.filter((c) => !value.includes(c.country));
    if (!q) return pool.slice(0, 8);
    return pool.filter((c) => c.country.toLowerCase().includes(q)).slice(0, 8);
  }, [countries, query, value, atMax]);

  function add(country: Country) {
    if (atMax) return;
    onChange([...value, country.country]);
    setQuery("");
    setActiveIndex(0);
  }

  function remove(name: string) {
    onChange(value.filter((v) => v !== name));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && query === "" && value.length > 0) {
      remove(value[value.length - 1]);
      return;
    }
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
      if (matches[activeIndex]) add(matches[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="combobox combobox--multi" ref={rootRef}>
      <label className="combobox__label eyebrow" htmlFor={listId}>
        {label} <span className="combobox__cap">({value.length}/{max})</span>
      </label>
      <div className="combobox__tags" onClick={() => document.getElementById(listId)?.focus()}>
        {value.map((name, i) => (
          <span className="combobox__tag" key={name}>
            <span className="combobox__tag-dot" style={{ backgroundColor: getColor(i) }} aria-hidden="true" />
            {name}
            <button
              type="button"
              className="combobox__tag-remove"
              aria-label={`Retirer ${name}`}
              onClick={(e) => {
                e.stopPropagation();
                remove(name);
              }}
            >
              ×
            </button>
          </span>
        ))}
        {!atMax && (
          <input
            id={listId}
            className="combobox__input combobox__input--inline"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls={`${listId}-list`}
            autoComplete="off"
            placeholder={value.length === 0 ? "Ajouter un pays…" : "Ajouter…"}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIndex(0);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
          />
        )}
      </div>
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
                add(c);
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
