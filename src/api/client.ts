// Thin fetch wrapper around a single proink-os device's HTTP API
// (src/net/WebFileServer.cpp in the firmware repo). No auth - the device
// API is intentionally open on the local network - so this only has to
// handle base-URL plumbing, JSON (de)serialization, and turning the
// device's plain-text "ok"/"failed" bodies into something the UI can
// branch on.

import type {
  DeviceFileEntry,
  DeviceSettings,
  DeviceSettingsPatch,
  DeviceStatus,
  OtaCheckResult,
  ReadingProgress,
  ReadingStats,
} from "./types";

export class DeviceApiError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "DeviceApiError";
  }
}

// A fetch() that never resolves (CORS block, wrong IP, device off) looks
// identical to the caller as "still loading" - without a timeout, a typo'd
// IP just spins forever instead of surfacing an error.
const REQUEST_TIMEOUT_MS = 8000;

async function request(base: string, path: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(new URL(path, base), { ...init, signal: controller.signal });
    return res;
  } catch (err) {
    // A CORS-blocked response and a dead host both throw a generic
    // "Failed to fetch" TypeError in-browser - there is no way to tell
    // them apart from script, so the message has to name both
    // possibilities rather than guessing.
    throw new DeviceApiError(
      "Could not reach the device. Check it's on the same WiFi network, the IP is correct, " +
        "and (if this app isn't running from its usual address) that the device allows this origin.",
      err,
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function requestJson<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  const res = await request(base, path, init);
  if (!res.ok) {
    throw new DeviceApiError(`Device returned ${res.status} for ${path}`);
  }
  return (await res.json()) as T;
}

async function requestText(base: string, path: string, init?: RequestInit): Promise<string> {
  const res = await request(base, path, init);
  const text = await res.text();
  if (!res.ok) {
    throw new DeviceApiError(text || `Device returned ${res.status} for ${path}`);
  }
  return text;
}

export function makeDeviceApi(base: string) {
  return {
    base,

    getStatus: () => requestJson<DeviceStatus>(base, "/api/status"),

    listDir: (dir: string) => requestJson<DeviceFileEntry[]>(base, `/api/list?dir=${encodeURIComponent(dir)}`),

    downloadUrl: (path: string) => new URL(`/download?path=${encodeURIComponent(path)}`, base).toString(),

    uploadFiles: async (dir: string, files: FileList | File[]) => {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        await requestText(base, `/upload?dir=${encodeURIComponent(dir)}`, { method: "POST", body: form });
      }
    },

    deletePath: (path: string) => requestText(base, `/delete?path=${encodeURIComponent(path)}`, { method: "POST" }),

    mkdir: (path: string) => requestText(base, `/mkdir?path=${encodeURIComponent(path)}`, { method: "POST" }),

    getSettings: () => requestJson<DeviceSettings>(base, "/api/settings"),

    patchSettings: (patch: DeviceSettingsPatch) =>
      requestText(base, "/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }),

    getStats: () => requestJson<ReadingStats>(base, "/api/stats"),

    getCrashes: () => requestText(base, "/api/crashes"),

    getReadingProgress: () => requestJson<ReadingProgress>(base, "/api/reading/progress"),

    checkOta: () => requestJson<OtaCheckResult>(base, "/api/ota/check"),

    applyOta: async () => {
      // The device reboots mid-response on success, so the connection
      // itself dropping (fetch throwing, not a completed error response)
      // is the expected happy path here, not a failure. A real completed
      // response - e.g. 409 "no update available" - is still a genuine
      // error and should surface normally.
      try {
        const res = await request(base, "/api/ota/apply", { method: "POST" });
        if (!res.ok) {
          const text = await res.text();
          throw new DeviceApiError(text || `Device returned ${res.status}`);
        }
      } catch (err) {
        if (err instanceof DeviceApiError && err.cause !== undefined) {
          return; // the connection drop itself - treat as a likely success
        }
        throw err;
      }
    },
  };
}

export type DeviceApi = ReturnType<typeof makeDeviceApi>;
