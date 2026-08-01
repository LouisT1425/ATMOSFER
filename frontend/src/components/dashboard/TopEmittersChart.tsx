import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../../api/client";
import { useQuery } from "../../api/useQuery";
import { ChartCard } from "../common/ChartCard";
import { ChartTooltip } from "../common/ChartTooltip";
import { MetricSelect } from "../controls/MetricSelect";
import { YearSlider } from "../controls/YearSlider";
import { COMPARE_METRICS } from "../../api/types";
import type { MetricKey } from "../../api/types";
import { formatPrecise } from "../../utils/format";

interface TopEmittersChartProps {
  minYear: number;
  maxYear: number;
}

const N_OPTIONS = [
  { key: "5", label: "5" },
  { key: "10", label: "10" },
  { key: "15", label: "15" },
  { key: "20", label: "20" },
];

export function TopEmittersChart({ minYear, maxYear }: TopEmittersChartProps) {
  const [metric, setMetric] = useState<MetricKey>("co2");
  const [limit, setLimit] = useState(10);
  const [since, setSince] = useState(maxYear);

  const topQ = useQuery(() => api.topCountries(limit, metric, since), [limit, metric, since]);
  const rows = [...(topQ.data ?? [])].sort((a, b) => a.total_emissions - b.total_emissions);
  const metricLabel = COMPARE_METRICS.find((m) => m.key === metric)?.label ?? metric;
  const cumulative = since < maxYear;

  return (
    <ChartCard
      eyebrow="Classement"
      title="Plus gros émetteurs"
      description={
        cumulative
          ? `Cumul de ${metricLabel.toLowerCase()} entre ${since} et ${maxYear}.`
          : `${metricLabel} en ${since} seule.`
      }
      isFetching={topQ.isFetching}
      error={topQ.error}
      tableData={[...rows].reverse().map((r, i, arr) => ({ ...r, _rank: arr.length - i }))}
      tableColumns={[
        { key: "rank", label: "#", render: (r: (typeof rows)[number] & { _rank: number }) => r._rank },
        { key: "country", label: "Pays", render: (r: (typeof rows)[number]) => r.country },
        {
          key: "value",
          label: metricLabel,
          align: "right" as const,
          render: (r: (typeof rows)[number]) => `${formatPrecise(r.total_emissions, 1)} Mt`,
        },
      ]}
      controls={
        <>
          <MetricSelect options={COMPARE_METRICS} value={metric} onChange={(k) => setMetric(k as MetricKey)} label="Indicateur" />
          <MetricSelect options={N_OPTIONS} value={String(limit)} onChange={(k) => setLimit(Number(k))} label="Top N" />
          <YearSlider min={minYear} max={maxYear} value={since} onChange={setSince} label="Depuis" />
        </>
      }
      footnote="Glissez « Depuis » vers la gauche pour cumuler sur plusieurs décennies."
      id="fig-top-emitters"
    >
      <div style={{ height: Math.max(220, rows.length * 34) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 56, left: 8, bottom: 0 }} barCategoryGap={10}>
            <CartesianGrid horizontal={false} stroke="var(--gridline)" />
            <XAxis
              type="number"
              tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatPrecise(v, 0)}
            />
            <YAxis
              type="category"
              dataKey="country"
              tick={{ fill: "var(--text-secondary)", fontSize: 12.5 }}
              axisLine={{ stroke: "var(--baseline)" }}
              tickLine={false}
              width={130}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-2)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const r = payload[0].payload as (typeof rows)[number];
                return (
                  <ChartTooltip
                    heading={r.country}
                    rows={[{ key: "v", label: metricLabel, value: `${formatPrecise(r.total_emissions, 1)} Mt`, color: "var(--series-1)" }]}
                  />
                );
              }}
            />
            <Bar dataKey="total_emissions" fill="var(--series-1)" radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false}>
              {rows.map((r) => (
                <Cell key={r.iso_code} />
              ))}
              <LabelList
                dataKey="total_emissions"
                position="right"
                formatter={(v: unknown) => formatPrecise(typeof v === "number" ? v : Number(v), 0)}
                fill="var(--text-secondary)"
                fontSize={11.5}
                fontFamily="var(--font-mono)"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
