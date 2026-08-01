import { useEffect, useState } from "react";
import { useTheme } from "../../theme/ThemeContext";
import "./Header.css";

const NAV_LINKS = [
  { id: "top", label: "Vue d'ensemble" },
  { id: "fig-sectors", label: "Par pays" },
  { id: "fig-country-share", label: "Répartition" },
  { id: "fig-top-emitters", label: "Classement" },
  { id: "fig-map", label: "Carte" },
];

const SunIcon = () => (
  <svg className="icon-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.4M12 19.1v2.4M4.9 4.9l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.9 19.4l1.7-1.7M17.7 6.3l1.7-1.7" strokeLinecap="round" />
  </svg>
);
const MoonIcon = () => (
  <svg className="icon-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.6 6.6 0 0 0 10.5 10.5Z" strokeLinejoin="round" />
  </svg>
);

export function Header() {
  const { resolvedMode, setMode, dyslexicMode, toggleDyslexicMode } = useTheme();
  const [navOpen, setNavOpen] = useState(false);
  const [activeId, setActiveId] = useState("top");

  useEffect(() => {
    const targets = NAV_LINKS.map((l) => document.getElementById(l.id)).filter((el): el is HTMLElement => !!el);
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="site-header">
      <nav className="nav">
        <a href="#top" className="logo">
          ATMOSFER
        </a>

        <button
          type="button"
          className={`nav-toggle${navOpen ? " open" : ""}`}
          aria-label="Basculer la navigation"
          aria-expanded={navOpen}
          onClick={() => setNavOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-links${navOpen ? " open" : ""}`}>
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className={`nav-link${activeId === link.id ? " active" : ""}`}
                onClick={() => setNavOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="toggle-group">
          <a className="credit-link" href="https://www.louisthin.dev" target="_blank" rel="noopener noreferrer">
            Louis Thin <span aria-hidden="true">↗</span>
          </a>

          <button
            type="button"
            className="dyslexia-toggle"
            aria-pressed={dyslexicMode}
            aria-label="Basculer le mode dyslexie"
            title="Activer un affichage plus lisible (police et espacement adaptés)"
            onClick={toggleDyslexicMode}
          >
            Aa
          </button>

          <button
            type="button"
            className="theme-toggle"
            aria-label="Basculer le mode sombre"
            onClick={() => setMode(resolvedMode === "dark" ? "light" : "dark")}
          >
            <SunIcon />
            <MoonIcon />
          </button>
        </div>
      </nav>
    </header>
  );
}
