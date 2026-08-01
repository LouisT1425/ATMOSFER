import { useMemo } from "react";
import { api } from "../../api/client";
import { useQuery } from "../../api/useQuery";
import { ChartCard } from "../common/ChartCard";
import { DonutChart } from "../common/DonutChart";
import { YearSlider } from "../controls/YearSlider";
import { SECTOR_METRICS } from "../../api/types";
import { SERIES } from "../../theme/palette";
import { formatCompact, formatPrecise } from "../../utils/format";

interface SectorSharePanelProps {
  year: number;
  onYearChange: (year: number) => void;
  minYear: number;
  maxYear: number;
}

export function SectorSharePanel({ year, onYearChange, minYear, maxYear }: SectorSharePanelProps) {
  const sectorsQ = useQuery(() => api.globalSectors(year), [year]);

  const { items, total } = useMemo(() => {
    const data = sectorsQ.data;
    if (!data) return { items: [], total: 0 };
    const items = SECTOR_METRICS.map((s, i) => ({
      key: s.key,
      label: s.label,
      value: Math.max(data[s.key], 0),
      color: SERIES[i],
    }));
    const total = items.reduce((s, it) => s + it.value, 0);
    return { items, total };
  }, [sectorsQ.data]);

  const tableColumns = [
    { key: "label", label: "Secteur", render: (r: (typeof items)[number]) => r.label },
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
      eyebrow="Répartition — secteurs"
      title="Part de chaque secteur"
      isFetching={sectorsQ.isFetching}
      error={sectorsQ.error}
      tableData={items}
      tableColumns={tableColumns}
      controls={<YearSlider min={minYear} max={maxYear} value={year} onChange={onYearChange} label="Année" />}
      footnote="Inclut le changement d'usage des sols : le total diffère donc légèrement du CO2 « fossile » affiché ailleurs sur le site."
      id="fig-sector-share"
    >
      <DonutChart items={items} centerLabel={`Émissions ${year}`} centerValue={formatCompact(total)} />
    </ChartCard>
  );
}
