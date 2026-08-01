import "./ChartTooltip.css";

export interface TooltipRow {
  key: string;
  label: string;
  value: string;
  color: string;
}

interface ChartTooltipProps {
  heading?: string;
  rows: TooltipRow[];
}

/** Shared readout: value leads (Strong), label follows, line-key not a box. */
export function ChartTooltip({ heading, rows }: ChartTooltipProps) {
  if (!rows.length) return null;
  return (
    <div className="chart-tooltip">
      {heading && <div className="chart-tooltip__heading">{heading}</div>}
      <ul className="chart-tooltip__rows">
        {rows.map((row) => (
          <li key={row.key} className="chart-tooltip__row">
            <span className="chart-tooltip__key" style={{ backgroundColor: row.color }} aria-hidden="true" />
            <span className="chart-tooltip__value tabular">{row.value}</span>
            <span className="chart-tooltip__label">{row.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
