import "./Controls.css";

interface MetricOption {
  key: string;
  label: string;
}

interface MetricSelectProps {
  options: readonly MetricOption[];
  value: string;
  onChange: (key: string) => void;
  label: string;
}

export function MetricSelect({ options, value, onChange, label }: MetricSelectProps) {
  return (
    <div className="field-select">
      <span className="eyebrow">{label}</span>
      <div className="segmented" role="radiogroup" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            role="radio"
            aria-checked={value === opt.key}
            className={`segmented__btn${value === opt.key ? " is-active" : ""}`}
            onClick={() => onChange(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
