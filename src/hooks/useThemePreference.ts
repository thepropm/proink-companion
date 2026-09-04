import { useEffect, useState } from "react";

export type ThemePreference = "system" | "light" | "dark";
const KEY = "proink-companion:theme";

export function useThemePreference() {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    try {
      return (localStorage.getItem(KEY) as ThemePreference | null) ?? "system";
    } catch {
      return "system";
    }
  });

  useEffect(() => {
    if (preference === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", preference);
    }
    try {
      localStorage.setItem(KEY, preference);
    } catch {
      // best-effort
    }
  }, [preference]);

  return { preference, setPreference };
}
