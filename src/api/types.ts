// Response/request shapes for proink-os's device API, catalogued from
// src/net/WebFileServer.cpp in the firmware repo. Field names/types here
// must stay in lockstep with that file - there's no shared schema, since
// the device speaks plain hand-built JSON, not an OpenAPI contract.

export interface DeviceStatus {
  deviceName: string;
  ip: string;
  mode: "ap" | "sta";
  freeHeap: number;
  uptimeMs: number;
  sdTotalBytes: number;
  lastResetReason: string;
  firmwareVersion: string;
}

export interface DeviceFileEntry {
  name: string;
  isDir: boolean;
  size: number;
}

export type ControlAction =
  | "toggleBookmark"
  | "toggleDarkMode"
  | "goHome"
  | "exitToBrowser"
  | "sleep"
  | "nextPage"
  | "prevPage"
  | "none";

export interface DeviceSettings {
  deviceName: string;
  language: string;
  wifi: { ssid: string };
  reader: {
    baseSizePx: number;
    lineSpacingPct: number;
    paragraphSpacingPct: number;
    marginPx: number;
    hyphenation: boolean;
    darkMode: boolean;
    bionicReading: boolean;
    fullRefreshInterval: number;
  };
  homeTheme: string;
  sleep: { mode: string; timeoutSec: number };
  koreader: { serverUrl: string; username: string; loggedIn: boolean };
  controls: {
    btnUp: ControlAction;
    btnDown: ControlAction;
    btnPower: ControlAction;
    btnPowerLong: ControlAction;
    touchLongPress: ControlAction;
  };
}

// A deep-partial mirror of DeviceSettings for POST /api/settings, plus the
// write-only wifi.password field the device never echoes back.
export type DeviceSettingsPatch = {
  deviceName?: string;
  language?: string;
  wifi?: { ssid?: string; password?: string };
  reader?: Partial<DeviceSettings["reader"]>;
  homeTheme?: string;
  sleep?: Partial<DeviceSettings["sleep"]>;
  koreader?: { serverUrl?: string };
  controls?: Partial<DeviceSettings["controls"]>;
};

export interface ReadingStats {
  totalSecondsRead: number;
  totalSessions: number;
  booksFinished: number;
  currentStreakDays: number;
  longestStreakDays: number;
}

export interface ReadingProgress {
  hasOpenBook: boolean;
  title?: string;
  livePage?: number;
  livePageCount?: number;
  referencePage?: number;
  referencePageCount?: number;
  progress?: number;
  timeLeftEstimateSeconds?: number;
}

export interface OtaCheckResult {
  ok: boolean;
  currentVersion: string;
  updateAvailable: boolean;
  latestVersion: string;
  releaseNotes: string;
}
