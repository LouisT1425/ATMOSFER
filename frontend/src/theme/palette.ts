/**
 * Series colors are passed to charts as CSS custom-property references
 * (not resolved hex) so a light/dark toggle repaints them for free —
 * no re-render, no JS recomputation. See src/index.css for the values.
 */
export const SERIES = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
  "var(--series-8)",
] as const;

export const SEQUENTIAL_BLUE = [
  "var(--seq-100)",
  "var(--seq-200)",
  "var(--seq-300)",
  "var(--seq-400)",
  "var(--seq-500)",
  "var(--seq-600)",
  "var(--seq-700)",
] as const;

/** Diverging ramp for the per-capita choropleth: below avg (green) -> avg (gray) -> above avg (red/black). */
export const MAP_BINS = [
  "var(--map-1)",
  "var(--map-2)",
  "var(--map-3)",
  "var(--map-neutral)",
  "var(--map-5)",
  "var(--map-6)",
  "var(--map-7)",
] as const;

export const MAP_BIN_LABELS = [
  "< 0,2×",
  "0,2 – 0,5×",
  "0,5 – 0,85×",
  "0,85 – 1,15×",
  "1,15 – 2×",
  "2 – 5×",
  "> 5×",
] as const;

export function seriesColor(index: number): string {
  return SERIES[index % SERIES.length];
}
