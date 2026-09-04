// Canvas-based image prep, mirroring the semantics of the legacy companion
// app's Python/Pillow Image Maker backend (backend/app/image_maker.py in
// thepropm/proink-companion's predecessor) closely enough that output
// should be visually equivalent, even though this is an independent
// from-scratch port (browser Canvas instead of Pillow).

export type FitMode = "fit" | "crop" | "stretch";

// Loads a File into an ImageBitmap - works for any format the browser can
// decode (PNG/JPEG/WebP/GIF/BMP), unlike the device itself which only
// decodes PNG/JPEG for book content.
export async function loadImageBitmap(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

// Fits `source` into exactly `width`x`height`, flattening any transparency
// onto white (matches _flatten_transparency's white-background composite -
// Canvas does this automatically as long as the canvas itself is filled
// white before drawing). Returns a canvas sized exactly width x height.
export function fitToCanvas(
  source: ImageBitmap,
  width: number,
  height: number,
  mode: FitMode,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const sw = source.width;
  const sh = source.height;

  if (mode === "stretch") {
    ctx.drawImage(source, 0, 0, width, height);
    return canvas;
  }

  const scaleContain = Math.min(width / sw, height / sh);
  const scaleCover = Math.max(width / sw, height / sh);
  const scale = mode === "crop" ? scaleCover : scaleContain;
  const drawW = sw * scale;
  const drawH = sh * scale;
  const dx = (width - drawW) / 2;
  const dy = (height - drawH) / 2;
  ctx.drawImage(source, dx, dy, drawW, drawH);
  return canvas;
}

// Grayscale via ITU-R BT.601 luma (matches PIL's default RGB -> "L" convert).
export function toGrayscale(canvas: HTMLCanvasElement): Float32Array {
  const ctx = canvas.getContext("2d")!;
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const out = new Float32Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    out[p] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  }
  return out;
}

function clamp255(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

// PIL's ImageEnhance.Brightness(factor): blend(black, original, factor) =
// original * factor (blending against an all-black image).
export function applyBrightness(gray: Float32Array, factor: number): Float32Array {
  if (factor === 1) return gray;
  const out = new Float32Array(gray.length);
  for (let i = 0; i < gray.length; i++) out[i] = clamp255(gray[i] * factor);
  return out;
}

// PIL's ImageEnhance.Contrast(factor): blend(mean-gray-image, original,
// factor) = mean + (original - mean) * factor, where mean is the average
// pixel value of the (already-brightness-adjusted) grayscale image.
export function applyContrast(gray: Float32Array, factor: number): Float32Array {
  if (factor === 1) return gray;
  let sum = 0;
  for (let i = 0; i < gray.length; i++) sum += gray[i];
  const mean = sum / gray.length;
  const out = new Float32Array(gray.length);
  for (let i = 0; i < gray.length; i++) out[i] = clamp255(mean + (gray[i] - mean) * factor);
  return out;
}

export function applyInvert(gray: Float32Array, invert: boolean): Float32Array {
  if (!invert) return gray;
  const out = new Float32Array(gray.length);
  for (let i = 0; i < gray.length; i++) out[i] = 255 - gray[i];
  return out;
}

export interface PreparedImage {
  width: number;
  height: number;
  gray: Float32Array; // row-major, 0..255
}

export async function prepareImage(
  file: File,
  width: number,
  height: number,
  opts: { fitMode: FitMode; brightness: number; contrast: number; invert: boolean },
): Promise<PreparedImage> {
  const bitmap = await loadImageBitmap(file);
  const canvas = fitToCanvas(bitmap, width, height, opts.fitMode);
  let gray = toGrayscale(canvas);
  gray = applyBrightness(gray, opts.brightness);
  gray = applyContrast(gray, opts.contrast);
  gray = applyInvert(gray, opts.invert);
  return { width, height, gray };
}
