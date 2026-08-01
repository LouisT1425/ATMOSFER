import "./StatTile.css";

interface StatTileProps {
  label: string;
  value: string;
  unit?: string;
  delta?: { value: string; goodDirection: "up" | "down" };
  sparkline?: number[];
}

export function StatTile({ label, value, unit, delta, sparkline }: StatTileProps) {
  const deltaIsUp = delta?.value.trim().startsWith("+");
  const isGood = delta ? (deltaIsUp ? delta.goodDirection === "up" : delta.goodDirection === "down") : undefined;

  return (
    <div className="stat-tile">
      <p className="stat-tile__label">{label}</p>
      <div className="stat-tile__value-row">
        <span className="stat-tile__value">{value}</span>
        {unit && <span className="stat-tile__unit">{unit}</span>}
      </div>
      <div className="stat-tile__foot">
        {delta && (
          <span className={`stat-tile__delta${isGood ? " is-good" : " is-bad"}`}>
            {delta.value}
          </span>
        )}
        {sparkline && sparkline.length > 1 && <Sparkline points={sparkline} />}
      </div>
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const w = 64;
  const h = 20;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(h - ((p - min) / range) * h).toFixed(1)}`)
    .join(" ");
  const lastX = (points.length - 1) * step;
  const lastY = h - ((points[points.length - 1] - min) / range) * h;

  return (
    <svg className="stat-tile__spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={path} fill="none" stroke="var(--gridline)" strokeWidth={1.5} />
      <path
        d={`M${((points.length - 2) * step).toFixed(1)},${(
          h - ((points[points.length - 2] - min) / range) * h
        ).toFixed(1)} L${lastX.toFixed(1)},${lastY.toFixed(1)}`}
        fill="none"
        stroke="var(--series-1)"
        strokeWidth={1.5}
      />
      <circle cx={lastX} cy={lastY} r={2} fill="var(--series-1)" />
    </svg>
  );
}
