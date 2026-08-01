import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
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
import { CountryAutocomplete } from "../controls/CountryAutocomplete";
import { SECTOR_METRICS } from "../../api/types";
import type { Country } from "../../api/types";
import { SERIES } from "../../theme/palette";
import { formatPrecise } from "../../utils/format";

interface SectorBreakdownChartProps {
  countries: Country[];
  country: string;
  onCountryChange: (country: string) => void;
}

export function SectorBreakdownChart({ countries, country, onCountryChange }: SectorBreakdownChartProps) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const emissionsQ = useQuery(() => api.countryEmissions(country), [country]);

  const rows = emissionsQ.data ?? [];

  const legendItems = SECTOR_METRICS.map((s, i) => ({
    key: s.key,
    label: s.label,
    color: SERIES[i],
    muted: hidden.has(s.key),
  }));

  function toggle(key: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const tableColumns = useMemo(
    () => [
      { key: "year", label: "Année", render: (r: (typeof rows)[number]) => r.year },
      ...SECTOR_METRICS.map((s) => ({
        key: s.key,
        label: s.label,
        align: "right" as const,
        render: (r: (typeof rows)[number]) => formatPrecise(r[s.key], 2),
      })),
      {
        key: "co2",
        label: "Total CO2",
        align: "right" as const,
        render: (r: (typeof rows)[number]) => formatPrecise(r.co2, 1),
      },
    ],
    [],
  );

  return (
    <ChartCard
      eyebrow="Un pays"
      title="Émissions par secteur"
      isFetching={emissionsQ.isFetching}
      error={emissionsQ.error}
      tableData={[...rows].reverse()}
      tableColumns={tableColumns}
      footnote="Le changement d'usage des sols peut être négatif : la terre absorbe alors plus de CO2 qu'elle n'en émet."
      controls={
        <CountryAutocomplete countries={countries} value={country} onChange={onCountryChange} label="Pays" />
      }
      id="fig-sectors"
    >
      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap={2}>
            <CartesianGrid vertical={false} stroke="var(--gridline)" />
            <XAxis
              dataKey="year"
              tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
              axisLine={{ stroke: "var(--baseline)" }}
              tickLine={false}
              minTickGap={28}
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              width={44}
              tickFormatter={(v) => formatPrecise(v, 0)}
            />
            <ReferenceLine y={0} stroke="var(--baseline)" />
            <Tooltip
              cursor={{ fill: "var(--surface-2)" }}
              content={({ active, label, payload }) => {
                if (!active || !payload?.length) return null;
                const visible = payload.filter((p) => !hidden.has(String(p.dataKey)));
                const total = visible.reduce((s, p) => s + (Number(p.value) || 0), 0);
                return (
                  <ChartTooltip
                    heading={String(label)}
                    rows={[
                      ...visible
                        .slice()
                        .reverse()
                        .map((p) => {
                          const meta = SECTOR_METRICS.find((s) => s.key === p.dataKey);
                          return {
                            key: String(p.dataKey),
                            label: meta?.label ?? String(p.dataKey),
                            value: `${formatPrecise(Number(p.value), 1)} Mt`,
                            color: String(p.fill),
                          };
                        }),
                      { key: "total", label: "Total", value: `${formatPrecise(total, 1)} Mt`, color: "var(--text-muted)" },
                    ]}
                  />
                );
              }}
            />
            {SECTOR_METRICS.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                stackId="sectors"
                fill={SERIES[i]}
                hide={hidden.has(s.key)}
                isAnimationActive={false}
                radius={0}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Legend items={legendItems} onToggle={toggle} />
    </ChartCard>
  );
}
