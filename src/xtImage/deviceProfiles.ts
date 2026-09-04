// Target dimensions for Proink's native image formats. 480x800 for the X4
// Pro matches the device's LOGICAL (post-rotation) portrait frame - see
// FreeInkUIDisplayTarget.h's DisplayTarget: the panel is landscape-native
// (800x480) but the UI/XtcReader both render into a rotated 480x800
// portrait frame, so that's the size a device-native image must be
// authored at, not the raw panel size.
export interface DeviceProfile {
  label: string;
  width: number;
  height: number;
}

export const DEVICE_PROFILES: Record<string, DeviceProfile> = {
  "x4-pro": { label: "Xteink X4 Pro", width: 480, height: 800 },
};

export const DEFAULT_DEVICE = "x4-pro";
