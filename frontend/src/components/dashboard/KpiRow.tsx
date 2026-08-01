import { useMemo } from "react";
import { api } from "../../api/client";
import { useQuery } from "../../api/useQuery";
import { StatTile } from "../common/StatTile";
import { formatCompact, formatDelta, formatPrecise, formatInteger } from "../../utils/format";
import "./KpiRow.css";

export function KpiRow() {
  const globalQ = useQuery(() => api.globalEmissions(), []);
  const mapQ = useQuery(() => api.map(), []);

  const stats = useMemo(() => {
    const rows = (globalQ.data ?? []).filter((r) => r.world_co2 != null);
    const recent = rows.slice(-15);
    const last = rows[rows.length - 1];
    const prev = rows[rows.length - 2];

    const co2Delta = last && prev ? ((last.world_co2 - prev.world_co2) / prev.world_co2) * 100 : undefined;
    const ghgRows = rows.filter((r) => r.world_total_ghg != null);
    const lastGhg = ghgRows[ghgRows.length - 1];
    const prevGhg = ghgRows[ghgRows.length - 2];
    const ghgDelta =
      lastGhg && prevGhg ? ((lastGhg.world_total_ghg - prevGhg.world_total_ghg) / prevGhg.world_total_ghg) * 100 : undefined;

    const mapRows = (mapQ.data ?? []).filter((r) => r.population && r.co2 != null);
    const totalPop = mapRows.reduce((s, r) => s + (r.population ?? 0), 0);
    const totalCo2 = mapRows.reduce((s, r) => s + (r.co2 ?? 0), 0);
    const avgPerCapita = totalPop > 0 ? (totalCo2 * 1_000_000) / totalPop : undefined;

    return {
      year: last?.year,
      co2: last?.world_co2,
      co2Sparkline: recent.map((r) => r.world_co2),
      co2Delta,
      ghg: lastGhg?.world_total_ghg,
      ghgSparkline: ghgRows.slice(-15).map((r) => r.world_total_ghg),
      ghgDelta,
      avgPerCapita,
      countryCount: mapRows.length,
    };
  }, [globalQ.data, mapQ.data]);

  return (
    <div className="kpi-row">
      <StatTile
        label={`CO2 mondial · ${stats.year ?? "…"}`}
        value={formatCompact(stats.co2)}
        unit="Mt"
        delta={stats.co2Delta !== undefined ? { value: formatDelta(stats.co2Delta) + " %", goodDirection: "down" } : undefined}
        sparkline={stats.co2Sparkline}
      />
      <StatTile
        label={`GES total (CO2 éq.) · ${stats.year ?? "…"}`}
        value={formatCompact(stats.ghg)}
        unit="Mt"
        delta={stats.ghgDelta !== undefined ? { value: formatDelta(stats.ghgDelta) + " %", goodDirection: "down" } : undefined}
        sparkline={stats.ghgSparkline}
      />
      <StatTile
        label="Moyenne mondiale par habitant"
        value={formatPrecise(stats.avgPerCapita, 2)}
        unit="t CO2 / pers."
      />
      <StatTile label="Pays suivis" value={formatInteger(stats.countryCount)} unit={`en ${stats.year ?? ""}`} />
    </div>
  );
}
