import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type ColorMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ColorMode;
  resolvedMode: "light" | "dark";
  dyslexicMode: boolean;
  setMode: (mode: ColorMode) => void;
  toggleDyslexicMode: () => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

const MODE_KEY = "atmosfer:color-mode";
const DYSLEXIC_KEY = "atmosfer:dyslexic-mode";

function getSystemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ColorMode>(
    () => (localStorage.getItem(MODE_KEY) as ColorMode) || "system",
  );
  const [dyslexicMode, setDyslexicMode] = useState<boolean>(
    () => localStorage.getItem(DYSLEXIC_KEY) === "1",
  );
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const resolvedMode: "light" | "dark" = mode === "system" ? (systemPrefersDark ? "dark" : "light") : mode;

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", mode);
    }
    root.setAttribute("data-dyslexic", dyslexicMode ? "true" : "false");
    localStorage.setItem(MODE_KEY, mode);
    localStorage.setItem(DYSLEXIC_KEY, dyslexicMode ? "1" : "0");
  }, [mode, dyslexicMode]);

  const value = useMemo<ThemeState>(
    () => ({
      mode,
      resolvedMode,
      dyslexicMode,
      setMode: setModeState,
      toggleDyslexicMode: () => setDyslexicMode((v) => !v),
    }),
    [mode, resolvedMode, dyslexicMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
