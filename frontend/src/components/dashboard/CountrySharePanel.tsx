import { useMemo } from "react";
import { api } from "../../api/client";
import { useQuery } from "../../api/useQuery";
import { ChartCard } from "../common/ChartCard";
import { DonutChart } from "../common/DonutChart";
import { YearSlider } from "../controls/YearSlider";
import { SERIES } from "../../theme/palette";
import { formatCompact, formatPrecise } from "../../utils/format";
import type { DonutItem } from "../common/DonutChart";

interface CountrySharePanelProps {
  year: number;
  onYearChange: (year: number) => void;
  minYear: number;
  maxYear: number;
}

const TOP_N = 7;

export function CountrySharePanel({ year, onYearChange, minYear, maxYear }: CountrySharePanelProps) {
  const sharesQ = useQuery(() => api.shares(year), [year]);

  const { items, total } = useMemo(() => {
    const rows = (sharesQ.data ?? []).filter((r) => r.co2 != null && r.co2 > 0);
    const sorted = [...rows].sort((a, b) => b.co2 - a.co2);
    const top = sorted.slice(0, TOP_N);
    const rest = sorted.slice(TOP_N);
    const restTotal = rest.reduce((s, r) => s + r.co2, 0);
    const total = sorted.reduce((s, r) => s + r.co2, 0);

    const items: DonutItem[] = top.map((r, i) => ({ key: r.iso_code, label: r.country, value: r.co2, color: SERIES[i] }));
    if (rest.length > 0) {
      items.push({ key: "other", label: `Autres (${rest.length} pays)`, value: restTotal, color: "var(--text-muted)" });
    }
    return { items, total };
  }, [sharesQ.data]);

  const tableColumns = [
    { key: "label", label: "Pays", render: (r: (typeof items)[number]) => r.label },
    {
      key: "value",
      label: "CO2",
      align: "right" as const,
      render: (r: (typeof items)[number]) => `${formatPrecise(r.value, 1)} Mt`,
    },
    {
      key: "pct",
      label: "Part",
      align: "right" as const,
      render: (r: (typeof items)[number]) => `${formatPrecise(total > 0 ? (r.value / total) * 100 : 0, 1)} %`,
    },
  ];

  return (
    <ChartCard
      eyebrow="Répartition — pays"
      title="Part de chaque pays"
      description="Les 7 plus gros émetteurs, et le reste du monde."
      isFetching={sharesQ.isFetching}
      error={sharesQ.error}
      tableData={items}
      tableColumns={tableColumns}
      controls={<YearSlider min={minYear} max={maxYear} value={year} onChange={onYearChange} label="Année" />}
      footnote="Écart avec le total mondial officiel : le transport aérien et maritime international n'est attribué à aucun pays."
      id="fig-country-share"
    >
      <DonutChart items={items} centerLabel={`Total ${year}`} centerValue={formatCompact(total)} />
    </ChartCard>
  );
}
