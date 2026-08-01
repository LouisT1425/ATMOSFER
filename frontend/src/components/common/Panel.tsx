import type { ReactNode } from "react";
import "./Panel.css";

interface PanelProps {
  children: ReactNode;
}

/**
 * Groups two related readouts (ChartCards) under one instrument-panel
 * border instead of two floating cards — CSS-only grouping, the
 * ChartCards inside are unmodified, they just render flush via
 * descendant selectors in Panel.css.
 */
export function Panel({ children }: PanelProps) {
  return <div className="panel">{children}</div>;
}
