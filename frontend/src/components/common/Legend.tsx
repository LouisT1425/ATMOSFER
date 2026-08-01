import "./Legend.css";

export interface LegendItem {
  key: string;
  label: string;
  color: string;
  shape?: "rect" | "line";
  muted?: boolean;
}

interface LegendProps {
  items: LegendItem[];
  onToggle?: (key: string) => void;
}

export function Legend({ items, onToggle }: LegendProps) {
  return (
    <ul className="viz-legend" role="list">
      {items.map((item) => (
        <li key={item.key}>
          <button
            type="button"
            className={`viz-legend__item${item.muted ? " is-muted" : ""}`}
            onClick={onToggle ? () => onToggle(item.key) : undefined}
            disabled={!onToggle}
            aria-pressed={onToggle ? !item.muted : undefined}
          >
            <span
              className={`viz-legend__swatch viz-legend__swatch--${item.shape ?? "rect"}`}
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
