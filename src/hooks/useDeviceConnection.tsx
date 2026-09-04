// Tracks which device this app is currently pointed at, plus a small
// remembered-devices list, both in localStorage - there's no server side
// to persist this, and it's genuinely per-browser/per-viewer state (see
// Connect.tsx).
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { makeDeviceApi, type DeviceApi } from "../api/client";

const ACTIVE_KEY = "proink-companion:active-device";
const RECENT_KEY = "proink-companion:recent-devices";
const MAX_RECENT = 6;

export interface RememberedDevice {
  base: string; // e.g. "http://192.168.1.42"
  name: string; // last-known deviceName, falls back to the host
}

function readRecent(): RememberedDevice[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as RememberedDevice[]) : [];
  } catch {
    return [];
  }
}

function writeRecent(devices: RememberedDevice[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(devices.slice(0, MAX_RECENT)));
  } catch {
    // localStorage can throw (private mode, quota) - losing the recents
    // list isn't worth failing the connection over.
  }
}

interface DeviceConnectionValue {
  api: DeviceApi | null;
  base: string | null;
  recent: RememberedDevice[];
  connect: (base: string) => void;
  disconnect: () => void;
  rememberName: (base: string, name: string) => void;
  forget: (base: string) => void;
}

const DeviceConnectionContext = createContext<DeviceConnectionValue | null>(null);

function normalizeBase(input: string): string {
  let value = input.trim();
  if (!/^https?:\/\//i.test(value)) value = `http://${value}`;
  return value.replace(/\/+$/, "");
}

export function DeviceConnectionProvider({ children }: { children: ReactNode }) {
  const [base, setBase] = useState<string | null>(() => localStorage.getItem(ACTIVE_KEY));
  const [recent, setRecent] = useState<RememberedDevice[]>(readRecent);

  const connect = useCallback((input: string) => {
    const normalized = normalizeBase(input);
    setBase(normalized);
    try {
      localStorage.setItem(ACTIVE_KEY, normalized);
    } catch {
      // best-effort - see writeRecent()
    }
    setRecent((prev) => {
      const withoutDup = prev.filter((d) => d.base !== normalized);
      const next = [{ base: normalized, name: normalized.replace(/^https?:\/\//, "") }, ...withoutDup];
      writeRecent(next);
      return next;
    });
  }, []);

  const disconnect = useCallback(() => {
    setBase(null);
    try {
      localStorage.removeItem(ACTIVE_KEY);
    } catch {
      // best-effort
    }
  }, []);

  const rememberName = useCallback((forBase: string, name: string) => {
    setRecent((prev) => {
      const next = prev.map((d) => (d.base === forBase ? { ...d, name } : d));
      writeRecent(next);
      return next;
    });
  }, []);

  const forget = useCallback((forBase: string) => {
    setRecent((prev) => {
      const next = prev.filter((d) => d.base !== forBase);
      writeRecent(next);
      return next;
    });
  }, []);

  const api = useMemo(() => (base ? makeDeviceApi(base) : null), [base]);

  const value = useMemo(
    () => ({ api, base, recent, connect, disconnect, rememberName, forget }),
    [api, base, recent, connect, disconnect, rememberName, forget],
  );

  return <DeviceConnectionContext.Provider value={value}>{children}</DeviceConnectionContext.Provider>;
}

export function useDeviceConnection(): DeviceConnectionValue {
  const ctx = useContext(DeviceConnectionContext);
  if (!ctx) throw new Error("useDeviceConnection must be used within DeviceConnectionProvider");
  return ctx;
}
