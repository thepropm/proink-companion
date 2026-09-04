import { HashRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DeviceConnectionProvider } from "./hooks/useDeviceConnection";
import { useThemePreference } from "./hooks/useThemePreference";
import { AppShell } from "./components/AppShell";
import { Connect } from "./screens/Connect";
import { Dashboard } from "./screens/Dashboard";
import { Files } from "./screens/Files";
import { Settings } from "./screens/Settings";
import { Stats } from "./screens/Stats";
import { About } from "./screens/About";
import { Flash } from "./screens/Flash";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

export function App() {
  // Applies the saved theme preference to <html> on every route, not just
  // while AppShell is mounted - otherwise a returning user with "dark"
  // saved would see the wrong theme on the pre-connection Connect screen.
  // AppShell's own instance of this hook (for its toggle button) reads the
  // same localStorage key and stays in sync independently.
  useThemePreference();

  return (
    <QueryClientProvider client={queryClient}>
      <DeviceConnectionProvider>
        {/* HashRouter: this is a static GH Pages deploy with no server-side
            rewrite, so a path-based route on refresh/direct-link would 404. */}
        <HashRouter>
          <Routes>
            <Route path="/connect" element={<Connect />} />
            <Route element={<AppShell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/files" element={<Files />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/about" element={<About />} />
              <Route path="/flash" element={<Flash />} />
            </Route>
          </Routes>
        </HashRouter>
      </DeviceConnectionProvider>
    </QueryClientProvider>
  );
}
