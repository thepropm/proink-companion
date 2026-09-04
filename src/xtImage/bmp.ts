// Uncompressed 24bpp BMP encoder for the device's "custom" sleep screen
// (src/screens/SleepScreen.cpp's decodeBmpToFramebuffer): panel-NATIVE
// landscape 800x480 (not the rotated 480x800 portrait frame XTG/XTH/the
// reflowable UI use), 24 bits/pixel, uncompressed, row size padded to a
// multiple of 4 bytes per the BMP spec. Luma threshold for what counts as
// "white" on read-back is a plain >127 on (r*30+g*59+b*11)/100, so this
// writer's job is simply "encode the pixels correctly" - no dithering
// needed for a format the device re-thresholds on load anyway.

import type { PreparedImage } from "./imageOps";

export function encodeSleepBmp(img: PreparedImage): Uint8Array {
  const { width, height, gray } = img;
  const rowBytes = Math.ceil((width * 3) / 4) * 4;
  const pixelDataSize = rowBytes * height;
  const fileHeaderSize = 14;
  const infoHeaderSize = 40;
  const dataOffset = fileHeaderSize + infoHeaderSize;
  const fileSize = dataOffset + pixelDataSize;

  const out = new Uint8Array(fileSize);
  const view = new DataView(out.buffer);

  // BITMAPFILEHEADER
  out[0] = 0x42; // 'B'
  out[1] = 0x4d; // 'M'
  view.setUint32(2, fileSize, true);
  view.setUint32(6, 0, true); // reserved
  view.setUint32(10, dataOffset, true);

  // BITMAPINFOHEADER (BITMAPINFOHEADER, 40 bytes)
  view.setUint32(14, infoHeaderSize, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true); // positive = bottom-up row order
  view.setUint16(26, 1, true); // planes
  view.setUint16(28, 24, true); // bitsPerPixel
  view.setUint32(30, 0, true); // compression = BI_RGB
  view.setUint32(34, pixelDataSize, true);
  view.setInt32(38, 2835, true); // ~72 DPI
  view.setInt32(42, 2835, true);
  view.setUint32(46, 0, true); // colors used
  view.setUint32(50, 0, true); // important colors

  // Pixel data, bottom-up, BGR, rows padded to a multiple of 4 bytes.
  for (let y = 0; y < height; y++) {
    const srcRow = height - 1 - y; // bottom-up: last source row written first
    const rowOffset = dataOffset + y * rowBytes;
    for (let x = 0; x < width; x++) {
      const v = Math.round(gray[srcRow * width + x]);
      const p = rowOffset + x * 3;
      out[p] = v; // B
      out[p + 1] = v; // G
      out[p + 2] = v; // R
    }
  }

  return out;
}
