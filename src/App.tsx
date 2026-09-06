import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DeviceConnectionProvider } from "./hooks/useDeviceConnection";
import { useThemePreference } from "./hooks/useThemePreference";
import { AppShell } from "./components/AppShell";
import { Skeleton } from "./components/ui";
import { Connect } from "./screens/Connect";
import { Dashboard } from "./screens/Dashboard";
import { Files } from "./screens/Files";
import { Settings } from "./screens/Settings";
import { Stats } from "./screens/Stats";
import { About } from "./screens/About";
import { Flash } from "./screens/Flash";
import { Tools } from "./screens/Tools";
import { CoverMaker } from "./screens/CoverMaker";
import { ImageMaker } from "./screens/ImageMaker";
import { BookMaker } from "./screens/BookMaker";
import { UiLab } from "./screens/UiLab";

// epub.js pulls in jszip/lodash/xmldom and roughly doubles the main bundle
// - lazy-load it so that weight only loads for someone actually visiting
// /read, not on every page of the app.
const Read = lazy(() => import("./screens/Read").then((m) => ({ default: m.Read })));

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
            <Route element={<AppShell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/connect" element={<Connect />} />
              <Route path="/files" element={<Files />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/about" element={<About />} />
              <Route path="/flash" element={<Flash />} />
              <Route path="/tools" element={<Tools />} />
              <Route
                path="/read"
                element={
                  <Suspense fallback={<Skeleton height={500} />}>
                    <Read />
                  </Suspense>
                }
              />
              <Route path="/cover-maker" element={<CoverMaker />} />
              <Route path="/image-maker" element={<ImageMaker />} />
              <Route path="/book-maker" element={<BookMaker />} />
              <Route path="/ui-lab" element={<UiLab />} />
            </Route>
          </Routes>
        </HashRouter>
      </DeviceConnectionProvider>
    </QueryClientProvider>
  );
}
