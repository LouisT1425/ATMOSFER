import { useId, useState, type ReactNode } from "react";
import "./ChartCard.css";

interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right";
}

interface ChartCardProps<T> {
  eyebrow: string;
  title: string;
  description?: string;
  controls?: ReactNode;
  children: ReactNode;
  isFetching?: boolean;
  error?: string;
  tableData?: T[];
  tableColumns?: Column<T>[];
  footnote?: ReactNode;
  id?: string;
}

export function ChartCard<T>({
  eyebrow,
  title,
  description,
  controls,
  children,
  isFetching,
  error,
  tableData,
  tableColumns,
  footnote,
  id,
}: ChartCardProps<T>) {
  const [showTable, setShowTable] = useState(false);
  const tableId = useId();

  return (
    <section className="chart-card" id={id}>
      <header className="chart-card__head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3 className="chart-card__title">{title}</h3>
          {description && <p className="chart-card__desc">{description}</p>}
        </div>
        {tableData && tableColumns && (
          <button
            type="button"
            className="chart-card__table-toggle"
            aria-expanded={showTable}
            aria-controls={tableId}
            onClick={() => setShowTable((v) => !v)}
          >
            {showTable ? "Voir le graphique" : "Voir les données"}
          </button>
        )}
      </header>

      {controls && <div className="chart-card__controls">{controls}</div>}

      <div className={`chart-card__body${isFetching ? " is-fetching" : ""}`}>
        {error ? (
          <div className="chart-card__error">Erreur : {error}</div>
        ) : showTable && tableData && tableColumns ? (
          <div className="chart-card__table-wrap thin-scroll" id={tableId}>
            <table className="chart-card__table">
              <thead>
                <tr>
                  {tableColumns.map((col) => (
                    <th key={col.key} style={{ textAlign: col.align ?? "left" }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr key={i}>
                    {tableColumns.map((col) => (
                      <td key={col.key} style={{ textAlign: col.align ?? "left" }} className="tabular">
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>

      {footnote && <p className="chart-card__footnote">{footnote}</p>}
    </section>
  );
}
