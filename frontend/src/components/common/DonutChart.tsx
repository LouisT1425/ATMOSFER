import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { Legend } from "./Legend";
import { formatPrecise } from "../../utils/format";
import "./DonutChart.css";

export interface DonutItem {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  items: DonutItem[];
  centerLabel: string;
  centerValue: string;
  unitSuffix?: string;
}

export function DonutChart({ items, centerLabel, centerValue, unitSuffix = " Mt" }: DonutChartProps) {
  const total = items.reduce((s, it) => s + it.value, 0);

  return (
    <div className="donut-chart">
      <div className="donut-chart__plot">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={items}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="var(--surface-1)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {items.map((item) => (
                <Cell key={item.key} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0];
                const item = p.payload as DonutItem;
                const pct = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <ChartTooltip
                    rows={[
                      {
                        key: item.key,
                        label: item.label,
                        value: `${formatPrecise(item.value, 1)}${unitSuffix} · ${formatPrecise(pct, 1)}%`,
                        color: item.color,
                      },
                    ]}
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-chart__center">
          <span className="donut-chart__center-label eyebrow">{centerLabel}</span>
          <span className="donut-chart__center-value">{centerValue}</span>
        </div>
      </div>
      <Legend
        items={items.map((it) => ({
          key: it.key,
          color: it.color,
          label: `${it.label} · ${total > 0 ? formatPrecise((it.value / total) * 100, 1) : "0"}%`,
        }))}
      />
    </div>
  );
}
