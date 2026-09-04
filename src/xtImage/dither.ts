// Floyd-Steinberg error-diffusion dithering, matching PIL's default
// dithering behavior for both 1-bit ("1") and our own 4-level quantization
// (see image_maker.py's _make_xtg/_quantize_4_level_indices). Standard FS
// kernel: right 7/16, below-left 3/16, below 5/16, below-right 1/16.

function nearestLevelIndex(value: number, levels: readonly number[]): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < levels.length; i++) {
    const d = Math.abs(value - levels[i]);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

// Quantizes `gray` (row-major, 0..255) to indices into `levels` (ascending
// brightness values, e.g. [0,255] for 1-bit or [0,85,170,255] for 4-level),
// diffusing quantization error when `dither` is true. Returns a row-major
// Uint8Array of level INDICES (not the raw brightness values).
export function quantize(
  gray: Float32Array,
  width: number,
  height: number,
  levels: readonly number[],
  dither: boolean,
): Uint8Array {
  const work = Float32Array.from(gray);
  const out = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const idx = nearestLevelIndex(work[i], levels);
      out[i] = idx;
      if (!dither) continue;

      const error = work[i] - levels[idx];
      if (error === 0) continue;

      if (x + 1 < width) work[i + 1] += (error * 7) / 16;
      if (y + 1 < height) {
        if (x - 1 >= 0) work[i + width - 1] += (error * 3) / 16;
        work[i + width] += (error * 5) / 16;
        if (x + 1 < width) work[i + width + 1] += (error * 1) / 16;
      }
    }
  }

  return out;
}
