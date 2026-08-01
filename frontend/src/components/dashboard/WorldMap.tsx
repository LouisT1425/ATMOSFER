import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import countries from "i18n-iso-countries";
import { api } from "../../api/client";
import { useQuery } from "../../api/useQuery";
import { ChartCard } from "../common/ChartCard";
import { YearSlider } from "../controls/YearSlider";
import { MAP_BINS, MAP_BIN_LABELS } from "../../theme/palette";
import { formatPrecise } from "../../utils/format";
import "./WorldMap.css";

interface WorldMapProps {
  year: number;
  onYearChange: (year: number) => void;
  minYear: number;
  maxYear: number;
  onCountrySelect: (country: string) => void;
  selectedCountry: string;
}

const GEO_URL = `${import.meta.env.BASE_URL}countries-110m.json`;

// ratio-to-global-average upper bound for each of the 7 diverging bins
const BIN_CEILINGS = [0.2, 0.5, 0.85, 1.15, 2, 5, Infinity];

function binIndex(ratio: number): number {
  for (let i = 0; i < BIN_CEILINGS.length; i++) {
    if (ratio <= BIN_CEILINGS[i]) return i;
  }
  return BIN_CEILINGS.length - 1;
}

interface Tip {
  x: number;
  y: number;
  name: string;
  perCapita: number | null;
  ratio: number | null;
}

export function WorldMap({ year, onYearChange, minYear, maxYear, onCountrySelect, selectedCountry }: WorldMapProps) {
  const mapQ = useQuery(() => api.map(year), [year]);
  const [tip, setTip] = useState<Tip | null>(null);
  const [zoom, setZoom] = useState(1);

  const { byIso, globalAvg, ranked } = useMemo(() => {
    const rows = (mapQ.data ?? []).filter((r) => r.co2_per_capita != null && r.population);
    const totalPop = rows.reduce((s, r) => s + (r.population ?? 0), 0);
    const totalCo2 = rows.reduce((s, r) => s + (r.co2 ?? 0), 0);
    const globalAvg = totalPop > 0 ? (totalCo2 * 1_000_000) / totalPop : 0;
    const byIso = new Map(rows.map((r) => [r.iso_code, r]));
    const ranked = [...rows].sort((a, b) => (b.co2_per_capita ?? 0) - (a.co2_per_capita ?? 0));
    return { byIso, globalAvg, ranked };
  }, [mapQ.data]);

  const tableColumns = [
    { key: "rank", label: "#", render: (_r: (typeof ranked)[number], i?: number) => (i ?? 0) + 1 },
    { key: "country", label: "Pays", render: (r: (typeof ranked)[number]) => r.country },
    {
      key: "pc",
      label: "t CO2 / hab.",
      align: "right" as const,
      render: (r: (typeof ranked)[number]) => formatPrecise(r.co2_per_capita, 2),
    },
    {
      key: "ratio",
      label: "vs. moyenne",
      align: "right" as const,
      render: (r: (typeof ranked)[number]) =>
        globalAvg > 0 && r.co2_per_capita != null ? `${formatPrecise(r.co2_per_capita / globalAvg, 2)}×` : "—",
    },
  ];

  return (
    <ChartCard
      eyebrow="Carte du monde"
      title="CO2 par habitant"
      description="Cliquez un pays pour voir son détail par secteur. La couleur indique l'écart à la moyenne mondiale."
      isFetching={mapQ.isFetching}
      error={mapQ.error}
      tableData={ranked}
      tableColumns={tableColumns}
      footnote={`Moyenne mondiale pondérée par la population en ${year} : ${formatPrecise(globalAvg, 2)} t CO2 / habitant.`}
      controls={<YearSlider min={minYear} max={maxYear} value={year} onChange={onYearChange} label="Année" />}
      id="fig-map"
    >
      <div className="world-map">
        <div className="world-map__zoom-controls">
          <button type="button" onClick={() => setZoom((z) => Math.min(z * 1.5, 8))} aria-label="Zoomer">
            +
          </button>
          <button type="button" onClick={() => setZoom((z) => Math.max(z / 1.5, 1))} aria-label="Dézoomer">
            −
          </button>
        </div>
        <ComposableMap projection="geoEqualEarth" projectionConfig={{ scale: 148 }} width={860} height={430}>
          <ZoomableGroup zoom={zoom} onMoveEnd={({ zoom: z }) => setZoom(z)} minZoom={1} maxZoom={8}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const iso = countries.numericToAlpha3(String(geo.id)) ?? "";
                  const row = byIso.get(iso);
                  const ratio = row?.co2_per_capita != null && globalAvg > 0 ? row.co2_per_capita / globalAvg : null;
                  const fill = ratio !== null ? MAP_BINS[binIndex(ratio)] : "var(--surface-2)";
                  const isSelected = row?.country === selectedCountry;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke="var(--surface-1)"
                      strokeWidth={isSelected ? 1.5 : 0.5}
                      className="world-map__geo"
                      style={{
                        default: { outline: "none", stroke: isSelected ? "var(--series-1)" : "var(--surface-1)" },
                        hover: { outline: "none", filter: "brightness(1.12)", cursor: row ? "pointer" : "default" },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={(e) => {
                        setTip({
                          x: e.clientX,
                          y: e.clientY,
                          name: row?.country ?? String(geo.properties.name),
                          perCapita: row?.co2_per_capita ?? null,
                          ratio,
                        });
                      }}
                      onMouseMove={(e) => setTip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : t))}
                      onMouseLeave={() => setTip(null)}
                      onClick={() => row && onCountrySelect(row.country)}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {tip && (
          <div className="world-map__tooltip" style={{ left: tip.x + 14, top: tip.y + 14 }}>
            <strong>{tip.name}</strong>
            {tip.perCapita != null ? (
              <>
                <span className="tabular">{formatPrecise(tip.perCapita, 2)} t CO2 / hab.</span>
                {tip.ratio != null && (
                  <span className="tabular">
                    {tip.ratio >= 1 ? "+" : ""}
                    {formatPrecise((tip.ratio - 1) * 100, 0)}% vs moyenne
                  </span>
                )}
              </>
            ) : (
              <span>Pas de données</span>
            )}
          </div>
        )}
      </div>

      <ul className="map-legend" aria-label="Légende : rapport à la moyenne mondiale par habitant">
        {MAP_BINS.map((color, i) => (
          <li key={color}>
            <span className="map-legend__swatch" style={{ backgroundColor: color }} aria-hidden="true" />
            {MAP_BIN_LABELS[i]}
          </li>
        ))}
        <li>
          <span className="map-legend__swatch" style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }} aria-hidden="true" />
          Pas de données
        </li>
      </ul>
    </ChartCard>
  );
}
