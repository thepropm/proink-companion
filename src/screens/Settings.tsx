import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plugs } from "@phosphor-icons/react";
import { useDeviceSettings, usePatchDeviceSettings } from "../hooks/useDeviceQueries";
import { useDeviceConnection } from "../hooks/useDeviceConnection";
import { Button, Select, TextField, Toggle, Skeleton, ErrorState, EmptyState } from "../components/ui";
import type { ControlAction, DeviceSettings } from "../api/types";
import "./Settings.css";

const HOME_THEMES = [
  { value: "classic", label: "Classic" },
  { value: "minimal", label: "Minimal" },
  { value: "dashboard", label: "Dashboard" },
  { value: "lyra", label: "Lyra" },
  { value: "lyraExtended", label: "Lyra Extended" },
  { value: "roundedRaff", label: "Rounded Raff" },
];

const SLEEP_MODES = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "custom", label: "Custom image" },
  { value: "stats", label: "Stats" },
  { value: "minimal", label: "Minimal" },
  { value: "dashboard", label: "Dashboard" },
  { value: "cover", label: "Book cover" },
];

const CONTROL_ACTIONS: { value: ControlAction; label: string }[] = [
  { value: "none", label: "None" },
  { value: "toggleBookmark", label: "Toggle bookmark" },
  { value: "toggleDarkMode", label: "Toggle dark mode" },
  { value: "goHome", label: "Go home" },
  { value: "exitToBrowser", label: "Exit to browser" },
  { value: "sleep", label: "Sleep" },
  { value: "nextPage", label: "Next page" },
  { value: "prevPage", label: "Previous page" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="settings-section">
      <h2 className="settings-section-title">{title}</h2>
      {children}
    </section>
  );
}

export function Settings() {
  const { base } = useDeviceConnection();
  const { data, isLoading, error, refetch } = useDeviceSettings();
  const patch = usePatchDeviceSettings();
  const [form, setForm] = useState<DeviceSettings | null>(null);
  const [wifiPassword, setWifiPassword] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (!base) {
    return (
      <div>
        <h1 className="page-title">Settings</h1>
        <EmptyState icon={<Plugs size={28} />} title="Not connected" hint="Connect to your Proink to change its settings." />
        <Link to="/connect">
          <Button variant="primary">Connect a device</Button>
        </Link>
      </div>
    );
  }
  if (isLoading || !form) return <Skeleton height={300} />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;

  function update<K extends keyof DeviceSettings>(key: K, value: DeviceSettings[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function save() {
    if (!form) return;
    patch.mutate(
      {
        deviceName: form.deviceName,
        language: form.language,
        wifi: wifiPassword ? { ssid: form.wifi.ssid, password: wifiPassword } : { ssid: form.wifi.ssid },
        reader: form.reader,
        homeTheme: form.homeTheme,
        sleep: form.sleep,
        koreader: { serverUrl: form.koreader.serverUrl },
        controls: form.controls,
      },
      {
        onSuccess: () => {
          setSavedAt(Date.now());
          setWifiPassword("");
        },
      },
    );
  }

  return (
    <div>
      <h1 className="page-title">Settings</h1>

      <Section title="Device">
        <TextField label="Device name" value={form.deviceName} onChange={(v) => update("deviceName", v)} />
        <TextField label="Language" value={form.language} onChange={(v) => update("language", v)} />
        <Select label="Home screen theme" value={form.homeTheme} onChange={(v) => update("homeTheme", v)} options={HOME_THEMES} />
      </Section>

      <Section title="WiFi">
        <TextField
          label="Network name (SSID)"
          value={form.wifi.ssid}
          onChange={(v) => update("wifi", { ...form.wifi, ssid: v })}
        />
        <TextField
          label="Password (leave blank to keep current)"
          value={wifiPassword}
          onChange={setWifiPassword}
          type="password"
        />
        <p className="settings-hint">Changing WiFi credentials makes the device reconnect - this app may briefly lose contact.</p>
      </Section>

      <Section title="Reading">
        <TextField
          label="Base font size (px)"
          type="number"
          value={String(form.reader.baseSizePx)}
          onChange={(v) => update("reader", { ...form.reader, baseSizePx: Number(v) || 0 })}
        />
        <TextField
          label="Line spacing (%)"
          type="number"
          value={String(form.reader.lineSpacingPct)}
          onChange={(v) => update("reader", { ...form.reader, lineSpacingPct: Number(v) || 0 })}
        />
        <TextField
          label="Paragraph spacing (%)"
          type="number"
          value={String(form.reader.paragraphSpacingPct)}
          onChange={(v) => update("reader", { ...form.reader, paragraphSpacingPct: Number(v) || 0 })}
        />
        <TextField
          label="Margin (px)"
          type="number"
          value={String(form.reader.marginPx)}
          onChange={(v) => update("reader", { ...form.reader, marginPx: Number(v) || 0 })}
        />
        <TextField
          label="Full refresh every N pages (0 = never)"
          type="number"
          value={String(form.reader.fullRefreshInterval)}
          onChange={(v) => update("reader", { ...form.reader, fullRefreshInterval: Number(v) || 0 })}
        />
        <Toggle label="Hyphenation" checked={form.reader.hyphenation} onChange={(v) => update("reader", { ...form.reader, hyphenation: v })} />
        <Toggle label="Dark mode" checked={form.reader.darkMode} onChange={(v) => update("reader", { ...form.reader, darkMode: v })} />
        <Toggle
          label="Bionic reading"
          checked={form.reader.bionicReading}
          onChange={(v) => update("reader", { ...form.reader, bionicReading: v })}
        />
      </Section>

      <Section title="Sleep screen">
        <Select
          label="Mode"
          value={form.sleep.mode}
          onChange={(v) => update("sleep", { ...form.sleep, mode: v })}
          options={SLEEP_MODES}
        />
        <TextField
          label="Timeout (seconds)"
          type="number"
          value={String(form.sleep.timeoutSec)}
          onChange={(v) => update("sleep", { ...form.sleep, timeoutSec: Number(v) || 0 })}
        />
      </Section>

      <Section title="KOReader sync">
        <TextField
          label="Sync server URL"
          value={form.koreader.serverUrl}
          onChange={(v) => update("koreader", { ...form.koreader, serverUrl: v })}
          mono
        />
        <p className="settings-hint">
          {form.koreader.loggedIn ? `Logged in as ${form.koreader.username}.` : "Not logged in - register or log in from the device."}
        </p>
      </Section>

      <Section title="Button controls">
        <Select
          label="Button up"
          value={form.controls.btnUp}
          onChange={(v) => update("controls", { ...form.controls, btnUp: v as ControlAction })}
          options={CONTROL_ACTIONS}
        />
        <Select
          label="Button down"
          value={form.controls.btnDown}
          onChange={(v) => update("controls", { ...form.controls, btnDown: v as ControlAction })}
          options={CONTROL_ACTIONS}
        />
        <Select
          label="Power button"
          value={form.controls.btnPower}
          onChange={(v) => update("controls", { ...form.controls, btnPower: v as ControlAction })}
          options={CONTROL_ACTIONS}
        />
        <Select
          label="Power button (long press)"
          value={form.controls.btnPowerLong}
          onChange={(v) => update("controls", { ...form.controls, btnPowerLong: v as ControlAction })}
          options={CONTROL_ACTIONS}
        />
        <Select
          label="Touch (long press)"
          value={form.controls.touchLongPress}
          onChange={(v) => update("controls", { ...form.controls, touchLongPress: v as ControlAction })}
          options={CONTROL_ACTIONS}
        />
      </Section>

      <div className="settings-save-bar">
        <Button variant="primary" onClick={save} disabled={patch.isPending}>
          {patch.isPending ? "Saving…" : "Save changes"}
        </Button>
        {savedAt && Date.now() - savedAt < 4000 && <span className="settings-saved">Saved</span>}
        {patch.isError && <span className="settings-error">{(patch.error as Error).message}</span>}
      </div>
    </div>
  );
}
