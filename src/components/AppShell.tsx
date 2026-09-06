import { NavLink, Outlet, Link } from "react-router-dom";
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
  Usb,
  Wrench,
  BookOpen,
  DeviceMobile,
} from "@phosphor-icons/react";
import { useDeviceConnection } from "../hooks/useDeviceConnection";
import { useDeviceStatus } from "../hooks/useDeviceQueries";
import { useThemePreference, type ThemePreference } from "../hooks/useThemePreference";
import "./AppShell.css";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: HouseSimple, end: true },
  { to: "/files", label: "Files", icon: FolderOpen },
  { to: "/read", label: "Read", icon: BookOpen },
  { to: "/settings", label: "Settings", icon: GearSix },
  { to: "/stats", label: "Stats", icon: ChartLineUp },
  { to: "/tools", label: "Tools", icon: Wrench },
  { to: "/flash", label: "Flash", icon: Usb },
  { to: "/ui-lab", label: "UI lab", icon: DeviceMobile },
  { to: "/inkmod-preview", label: "inkMOD preview", icon: DeviceMobile },
  { to: "/about", label: "About", icon: Info },
];

const THEME_CYCLE: ThemePreference[] = ["system", "light", "dark"];
const THEME_ICON = { system: CircleHalf, light: SunDim, dark: MoonStars };

// The shell itself never gates navigation on being connected - every tool
// is browsable (Flash needs no device at all; the rest just show their own
// "not connected" prompt via useDeviceConnection when there's nothing to
// fetch from). The "Not connected" pill is the way in: it doubles as a
// link to Connect instead of forcing a redirect the moment the app loads.
export function AppShell() {
  const { base, disconnect } = useDeviceConnection();
  const { data: status } = useDeviceStatus();
  const { preference, setPreference } = useThemePreference();
  const ThemeIcon = THEME_ICON[preference];

  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-header-inner">
          <div className="shell-brand">
            <img className="shell-logo" src="/proink-companion/logo.png" alt="Proink" height={26} />
            <span className="shell-brand-tagline">Companion</span>
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
            {base ? (
              <button className="shell-device-pill" onClick={disconnect} title="Disconnect and pick a different device">
                {status ? <PlugsConnected size={14} weight="bold" /> : <Plugs size={14} weight="bold" />}
                <span className="mono">{status?.deviceName ?? base.replace(/^https?:\/\//, "")}</span>
              </button>
            ) : (
              <Link to="/connect" className="shell-device-pill shell-device-pill-empty">
                <Plugs size={14} weight="bold" /> Not connected
              </Link>
            )}
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
