import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../../api/client";
import { useQuery } from "../../api/useQuery";
import { ChartCard } from "../common/ChartCard";
import { ChartTooltip } from "../common/ChartTooltip";
import { Legend } from "../common/Legend";
import { CountryMultiSelect } from "../controls/CountryMultiSelect";
import { MetricSelect } from "../controls/MetricSelect";
import { COMPARE_METRICS } from "../../api/types";
import type { Country, MetricKey } from "../../api/types";
import { SERIES, seriesColor } from "../../theme/palette";
import { formatPrecise } from "../../utils/format";

interface CompareChartProps {
  countries: Country[];
  selected: string[];
  onSelectedChange: (countries: string[]) => void;
}

export function CompareChart({ countries, selected, onSelectedChange }: CompareChartProps) {
  const [metric, setMetric] = useState<MetricKey>("co2");
  const [logScale, setLogScale] = useState(false);

  const compareQ = useQuery(
    () => (selected.length ? api.compare(selected, metric) : Promise.resolve([])),
    [selected.join("|"), metric],
  );

  const rows = compareQ.data ?? [];
  const canLog = metric !== "land_use_change_co2";

  const legendItems = selected.map((name, i) => ({
    key: name,
    label: name,
    color: seriesColor(i),
    shape: "line" as const,
  }));

  const tableColumns = useMemo(
    () => [
      { key: "year", label: "Année", render: (r: (typeof rows)[number]) => r.year },
      ...selected.map((name) => ({
        key: name,
        label: name,
        align: "right" as const,
        render: (r: (typeof rows)[number]) => formatPrecise(r[name] as number | undefined, 2),
      })),
    ],
    [selected, rows],
  );

  return (
    <ChartCard
      eyebrow="Comparaison"
      title="Comparaison entre pays"
      description="Comparez jusqu'à 6 pays sur l'indicateur de votre choix."
      isFetching={compareQ.isFetching}
      error={compareQ.error}
      tableData={[...rows].reverse()}
      tableColumns={tableColumns}
      controls={
        <>
          <CountryMultiSelect
            countries={countries}
            value={selected}
            onChange={onSelectedChange}
            label="Pays"
            getColor={seriesColor}
          />
          <MetricSelect options={COMPARE_METRICS} value={metric} onChange={(k) => setMetric(k as MetricKey)} label="Indicateur" />
          <label className="log-toggle">
            <input
              type="checkbox"
              checked={logScale && canLog}
              disabled={!canLog}
              onChange={(e) => setLogScale(e.target.checked)}
            />
            Échelle log
          </label>
        </>
      }
      id="fig-compare"
    >
      {selected.length === 0 ? (
        <div className="chart-empty">Ajoutez au moins un pays pour afficher la comparaison.</div>
      ) : (
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 8, right: 28, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--gridline)" />
              <XAxis
                dataKey="year"
                tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                axisLine={{ stroke: "var(--baseline)" }}
                tickLine={false}
                minTickGap={28}
              />
              <YAxis
                scale={logScale && canLog ? "log" : "linear"}
                domain={logScale && canLog ? ["auto", "auto"] : [0, "auto"]}
                tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                axisLine={false}
                tickLine={false}
                width={52}
                tickFormatter={(v) => formatPrecise(v, 0)}
                allowDataOverflow
              />
              <Tooltip
                cursor={{ stroke: "var(--baseline)", strokeWidth: 1 }}
                content={({ active, label, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <ChartTooltip
                      heading={String(label)}
                      rows={payload
                        .filter((p) => p.value !== undefined && p.value !== null)
                        .map((p) => ({
                          key: String(p.dataKey),
                          label: String(p.dataKey),
                          value: `${formatPrecise(Number(p.value), 2)} Mt`,
                          color: String(p.stroke),
                        }))}
                    />
                  );
                }}
              />
              {selected.map((name, i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={SERIES[i % SERIES.length]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <Legend items={legendItems} />
    </ChartCard>
  );
}
