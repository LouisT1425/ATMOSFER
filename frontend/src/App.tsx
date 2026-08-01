import { useMemo, useState } from "react";
import { ThemeProvider } from "./theme/ThemeContext";
import { Header } from "./components/layout/Header";
import { Panel } from "./components/common/Panel";
import { SpectralStrip } from "./components/common/SpectralStrip";
import { KpiRow } from "./components/dashboard/KpiRow";
import { SectorBreakdownChart } from "./components/dashboard/SectorBreakdownChart";
import { CompareChart } from "./components/dashboard/CompareChart";
import { CountrySharePanel } from "./components/dashboard/CountrySharePanel";
import { SectorSharePanel } from "./components/dashboard/SectorSharePanel";
import { TopEmittersChart } from "./components/dashboard/TopEmittersChart";
import { WorldMap } from "./components/dashboard/WorldMap";
import { api } from "./api/client";
import { useQuery } from "./api/useQuery";
import "./App.css";

const DEFAULT_COMPARE = ["France", "Germany", "China"];

function Dashboard() {
  const countriesQ = useQuery(() => api.countries(), []);
  const globalQ = useQuery(() => api.globalEmissions(), []);

  const countries = countriesQ.data ?? [];

  const { minYear, maxYear } = useMemo(() => {
    const rows = globalQ.data ?? [];
    const real = rows.filter((r) => r.year >= 1900);
    return {
      minYear: real.length ? real[0].year : 1900,
      maxYear: real.length ? real[real.length - 1].year : 2024,
    };
  }, [globalQ.data]);

  const [focusCountry, setFocusCountry] = useState("France");
  const [compareCountries, setCompareCountries] = useState<string[]>(DEFAULT_COMPARE);
  const [shareYear, setShareYear] = useState(maxYear);

  const effectiveShareYear = Math.min(Math.max(shareYear, minYear), maxYear) || maxYear;

  return (
    <div className="app-shell">
      <Header />
      <main>
        <section className="hero" id="top">
          <h1 className="hero__title">
            Les émissions de carbone <span className="hero__title-accent">du monde</span>, pays par pays.
          </h1>
          <p className="hero__subtitle">Par pays, par secteur, et par habitant.</p>
          <div className="hero-actions">
            <a href="#fig-sectors" className="btn btn-primary">
              Explorer les données
            </a>
            <a
              href="https://github.com/LouisT1425/ATMOSFER"
              className="btn-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Voir le code source ↗
            </a>
          </div>
        </section>

        <SpectralStrip />

        <section aria-label="Indicateurs clés" className="section">
          <KpiRow />
        </section>

        <div className="dashboard-stack">
          <Panel>
            <SectorBreakdownChart countries={countries} country={focusCountry} onCountryChange={setFocusCountry} />
            <CompareChart countries={countries} selected={compareCountries} onSelectedChange={setCompareCountries} />
          </Panel>

          <Panel>
            <CountrySharePanel year={effectiveShareYear} onYearChange={setShareYear} minYear={minYear} maxYear={maxYear} />
            <SectorSharePanel year={effectiveShareYear} onYearChange={setShareYear} minYear={minYear} maxYear={maxYear} />
          </Panel>

          <TopEmittersChart minYear={minYear} maxYear={maxYear} />

          <WorldMap
            year={effectiveShareYear}
            onYearChange={setShareYear}
            minYear={minYear}
            maxYear={maxYear}
            onCountrySelect={(country) => {
              setFocusCountry(country);
              document.getElementById("fig-sectors")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            selectedCountry={focusCountry}
          />
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <p>
            &copy; {new Date().getFullYear()} ATMOSFER — données{" "}
            <a href="https://ourworldindata.org/co2-and-greenhouse-gas-emissions" target="_blank" rel="noopener noreferrer">
              Our World in Data
            </a>
            , pipeline dbt + PostgreSQL + FastAPI.
          </p>
          <a href="#top" className="back-top">
            Retour en haut ↑
          </a>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;
