// Packs a prepared grayscale image into Proink's native .xtg (1-bit) or
// .xth (2-bit/4-level) page format. Format reverse-engineered by the
// CrossPoint/Proink community (see src/formats/XtcReader.h in the
// proink-os firmware repo, which this must byte-for-byte match):
//
// 22-byte header: mark(u32 LE) width(u16 LE) height(u16 LE) colorMode(u8=0)
// compression(u8=0) dataSize(u32 LE) md5(first 8 bytes of the full MD5 of
// the packed body).
//
// XTG body: row-major, MSB-first, 1 bit/pixel. 0=black, 1=white.
// XTH body: two bit planes back to back, each ((w*h+7)/8) bytes, packed
// COLUMN-MAJOR scanning columns right-to-left, 8 vertical pixels/byte
// (MSB=topmost pixel). Level code = bit0 | (bit1<<1); codes are
// 0=White 1=Dark grey 2=Light grey 3=Black - NOT a simple brightness ramp.

import { md5 } from "js-md5";
import { quantize } from "./dither";
import type { PreparedImage } from "./imageOps";

export const XTG_MARK = 0x00475458;
export const XTH_MARK = 0x00485458;

// Brightness-ascending order of the 4 XTH level codes: black, dark grey,
// light grey, white - mirrors image_maker.py's _XTH_LEVELS_BY_BRIGHTNESS.
const XTH_LEVELS_BY_BRIGHTNESS = [3, 1, 2, 0] as const;

function packHeader(mark: number, width: number, height: number, body: Uint8Array): Uint8Array {
  const header = new Uint8Array(22);
  const view = new DataView(header.buffer);
  view.setUint32(0, mark, true);
  view.setUint16(4, width, true);
  view.setUint16(6, height, true);
  header[8] = 0; // colorMode
  header[9] = 0; // compression
  view.setUint32(10, body.length, true);
  const digest = md5.arrayBuffer(body);
  header.set(new Uint8Array(digest, 0, 8), 14);
  return header;
}

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

export function encodeXtg(img: PreparedImage, dither: boolean): Uint8Array {
  const { width, height, gray } = img;
  const levels = quantize(gray, width, height, [0, 255], dither); // index 0=black,1=white
  const rowBytes = Math.ceil(width / 8);
  const body = new Uint8Array(rowBytes * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const white = levels[y * width + x] === 1;
      if (white) {
        const byteIndex = y * rowBytes + (x >> 3);
        body[byteIndex] |= 0x80 >> (x & 7);
      }
    }
  }
  return concat(packHeader(XTG_MARK, width, height, body), body);
}

export function encodeXth(img: PreparedImage, dither: boolean): Uint8Array {
  const { width, height, gray } = img;
  const brightnessLevels = quantize(gray, width, height, [0, 85, 170, 255], dither);

  const planeSize = Math.ceil((width * height) / 8);
  const plane0 = new Uint8Array(planeSize);
  const plane1 = new Uint8Array(planeSize);

  let out = 0;
  for (let col = width - 1; col >= 0; col--) {
    let bit0Byte = 0;
    let bit1Byte = 0;
    let shift = 7;
    for (let row = 0; row < height; row++) {
      const brightnessIndex = brightnessLevels[row * width + col];
      const code = XTH_LEVELS_BY_BRIGHTNESS[brightnessIndex];
      bit0Byte |= (code & 1) << shift;
      bit1Byte |= ((code >> 1) & 1) << shift;
      if (shift === 0) {
        plane0[out] = bit0Byte;
        plane1[out] = bit1Byte;
        out++;
        bit0Byte = 0;
        bit1Byte = 0;
        shift = 7;
      } else {
        shift--;
      }
    }
    if (shift !== 7) {
      plane0[out] = bit0Byte;
      plane1[out] = bit1Byte;
      out++;
    }
  }

  const body = concat(plane0, plane1);
  return concat(packHeader(XTH_MARK, width, height, body), body);
}
