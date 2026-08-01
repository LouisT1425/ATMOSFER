import { useMemo } from "react";
import "./Controls.css";

interface YearSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (year: number) => void;
  label: string;
}

function roundTo5(year: number): number {
  return Math.round(year / 5) * 5;
}

export function YearSlider({ min, max, value, onChange, label }: YearSliderProps) {
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;

  const presets = useMemo(() => {
    if (max <= min) return [min];
    const raw = [min, min + (max - min) / 3, min + (2 * (max - min)) / 3, max].map(roundTo5);
    const clamped = raw.map((y) => Math.min(max, Math.max(min, y)));
    return Array.from(new Set(clamped)).sort((a, b) => a - b);
  }, [min, max]);

  return (
    <div className="field-select year-picker">
      <div className="year-picker__head">
        <span className="eyebrow">{label}</span>
        <span className="year-picker__value tabular">{value}</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="year-picker__track"
        style={{
          background: `linear-gradient(to right, var(--accent-gold) ${percent}%, var(--surface-2) ${percent}%)`,
        }}
      />

      <div className="year-picker__presets" role="group" aria-label={`${label} — raccourcis`}>
        {presets.map((year) => (
          <button
            key={year}
            type="button"
            className={`year-picker__preset${value === year ? " is-active" : ""}`}
            onClick={() => onChange(year)}
            title={year === max ? "Dernière année disponible" : undefined}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
}
