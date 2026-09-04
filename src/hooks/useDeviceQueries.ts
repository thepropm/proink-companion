// TanStack Query wrappers over DeviceApi. Every query is disabled when
// there's no active connection (api === null) rather than the caller
// checking that separately at every call site.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDeviceConnection } from "./useDeviceConnection";
import type { DeviceSettingsPatch } from "../api/types";

export function useDeviceStatus(pollMs = 15000) {
  const { api, base } = useDeviceConnection();
  return useQuery({
    queryKey: ["device-status", base],
    queryFn: () => api!.getStatus(),
    enabled: !!api,
    refetchInterval: pollMs,
    retry: 1,
  });
}

export function useReadingProgress(pollMs = 5000) {
  const { api, base } = useDeviceConnection();
  return useQuery({
    queryKey: ["reading-progress", base],
    queryFn: () => api!.getReadingProgress(),
    enabled: !!api,
    refetchInterval: pollMs,
    retry: 1,
  });
}

export function useOtaCheck() {
  const { api, base } = useDeviceConnection();
  return useQuery({
    queryKey: ["ota-check", base],
    queryFn: () => api!.checkOta(),
    enabled: !!api,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useApplyOta() {
  const { api } = useDeviceConnection();
  return useMutation({ mutationFn: () => api!.applyOta() });
}

export function useDeviceStats() {
  const { api, base } = useDeviceConnection();
  return useQuery({
    queryKey: ["device-stats", base],
    queryFn: () => api!.getStats(),
    enabled: !!api,
    retry: 1,
  });
}

export function useDeviceCrashes() {
  const { api, base } = useDeviceConnection();
  return useQuery({
    queryKey: ["device-crashes", base],
    queryFn: () => api!.getCrashes(),
    enabled: !!api,
    retry: 1,
  });
}

export function useDeviceSettings() {
  const { api, base } = useDeviceConnection();
  return useQuery({
    queryKey: ["device-settings", base],
    queryFn: () => api!.getSettings(),
    enabled: !!api,
    retry: 1,
  });
}

export function usePatchDeviceSettings() {
  const { api, base } = useDeviceConnection();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: DeviceSettingsPatch) => api!.patchSettings(patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["device-settings", base] }),
  });
}

export function useDirListing(dir: string) {
  const { api, base } = useDeviceConnection();
  return useQuery({
    queryKey: ["dir-listing", base, dir],
    queryFn: () => api!.listDir(dir),
    enabled: !!api,
    retry: 1,
  });
}

export function useFileOps(dir: string) {
  const { api, base } = useDeviceConnection();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["dir-listing", base, dir] });

  const upload = useMutation({
    mutationFn: (files: FileList | File[]) => api!.uploadFiles(dir, files),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (path: string) => api!.deletePath(path),
    onSuccess: invalidate,
  });
  const mkdir = useMutation({
    mutationFn: (path: string) => api!.mkdir(path),
    onSuccess: invalidate,
  });

  return { upload, remove, mkdir };
}
