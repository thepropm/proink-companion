import { NavLink, Outlet, Navigate } from "react-router-dom";
import {
  HouseSimple,
  FolderOpen,
  GearSix,
  ChartLineUp,
  Info,
  Plugs,
  PlugsConnected,
  SunDim,
  MoonStars,
  CircleHalf,
} from "@phosphor-icons/react";
import { useDeviceConnection } from "../hooks/useDeviceConnection";
import { useDeviceStatus } from "../hooks/useDeviceQueries";
import { useThemePreference, type ThemePreference } from "../hooks/useThemePreference";
import "./AppShell.css";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: HouseSimple, end: true },
  { to: "/files", label: "Files", icon: FolderOpen },
  { to: "/settings", label: "Settings", icon: GearSix },
  { to: "/stats", label: "Stats", icon: ChartLineUp },
  { to: "/about", label: "About", icon: Info },
];

const THEME_CYCLE: ThemePreference[] = ["system", "light", "dark"];
const THEME_ICON = { system: CircleHalf, light: SunDim, dark: MoonStars };

export function AppShell() {
  const { base, disconnect } = useDeviceConnection();
  const { data: status } = useDeviceStatus();
  const { preference, setPreference } = useThemePreference();
  const ThemeIcon = THEME_ICON[preference];

  if (!base) return <Navigate to="/connect" replace />;

  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-header-inner">
          <div className="shell-brand">
            <img className="shell-logo" src="/proink-companion/icons/icon.svg" alt="" width={36} height={36} />
            <div>
              <div className="shell-brand-name">Proink</div>
              <div className="shell-brand-tagline">Companion</div>
            </div>
          </div>

          <nav className="shell-nav">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `shell-nav-link ${isActive ? "active" : ""}`}>
                <Icon size={16} weight="bold" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="shell-actions">
            <button
              className="shell-theme-toggle"
              title={`Theme: ${preference} (click to change)`}
              onClick={() => setPreference(THEME_CYCLE[(THEME_CYCLE.indexOf(preference) + 1) % THEME_CYCLE.length])}
            >
              <ThemeIcon size={16} weight="bold" />
            </button>
            <button className="shell-device-pill" onClick={disconnect} title="Disconnect and pick a different device">
              {status ? <PlugsConnected size={14} weight="bold" /> : <Plugs size={14} weight="bold" />}
              <span className="mono">{status?.deviceName ?? base.replace(/^https?:\/\//, "")}</span>
            </button>
          </div>
        </div>
      </header>
      <main className="shell-main">
        <div className="shell-main-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
