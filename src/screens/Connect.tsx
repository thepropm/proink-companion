import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { WifiHigh, X, Usb } from "@phosphor-icons/react";
import { useDeviceConnection } from "../hooks/useDeviceConnection";
import { makeDeviceApi } from "../api/client";
import { Button, Card, TextField } from "../components/ui";
import "./Connect.css";

export function Connect() {
  const { connect, recent, forget, rememberName } = useDeviceConnection();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function tryConnect(target: string) {
    const value = target.trim();
    if (!value) return;
    setTesting(true);
    setError(null);
    const base = /^https?:\/\//i.test(value) ? value : `http://${value}`;
    try {
      const status = await makeDeviceApi(base).getStatus();
      connect(base);
      rememberName(base.replace(/\/+$/, ""), status.deviceName);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not reach the device. Check the IP and that you're on the same WiFi network.",
      );
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="connect-page">
      <Card className="connect-card">
        <h1 className="connect-title">Connect to your Proink</h1>
        <p className="connect-hint">
          Enter the device's IP address, shown on-device under Settings → WiFi. If the device is in setup mode
          (no WiFi configured yet), join its <span className="mono">Proink-…</span> hotspot and use{" "}
          <span className="mono">192.168.4.1</span>.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void tryConnect(input);
          }}
        >
          <TextField label="Device address" value={input} onChange={setInput} placeholder="192.168.1.42" mono />
          {error && <p className="connect-error">{error}</p>}
          <Button type="submit" variant="primary" disabled={testing}>
            {testing ? "Connecting…" : "Connect"}
          </Button>
        </form>

        {recent.length > 0 && (
          <div className="connect-recent">
            <p className="connect-recent-title">Recent devices</p>
            <ul>
              {recent.map((d) => (
                <li key={d.base}>
                  <button className="connect-recent-item" onClick={() => void tryConnect(d.base)}>
                    <WifiHigh size={16} weight="bold" />
                    <span>{d.name}</span>
                    <span className="mono connect-recent-addr">{d.base.replace(/^https?:\/\//, "")}</span>
                  </button>
                  <button
                    className="connect-recent-forget"
                    aria-label={`Forget ${d.name}`}
                    onClick={() => forget(d.base)}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link to="/flash" className="connect-flash-link">
          <Usb size={14} weight="bold" /> New device, or nothing installed yet? Flash it over USB
        </Link>
      </Card>
    </div>
  );
}
