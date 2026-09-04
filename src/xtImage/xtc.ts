// Packs multiple already-encoded .xtg/.xth page blocks (from xtgXth.ts -
// each already a complete 22-byte-header + body block, exactly what a
// page's own sub-header format is) into one indexed .xtc/.xtch container.
// Format per src/formats/XtcReader.h in the proink-os firmware repo:
//
// 56-byte file header: mark(u32 LE) version(u16) pageCount(u16)
// readDirection(u8) hasMetadata(u8) hasThumbnails(u8) hasChapters(u8)
// currentPage(u32) metadataOffset(u64) indexOffset(u64) dataOffset(u64)
// thumbOffset(u64) chapterOffset(u64).
// 16-byte page index entry (one per page, at indexOffset): offset(u64)
// size(u32) width(u16) height(u16).
// Page data itself is exactly the encodeXtg/encodeXth output, back to back,
// starting at dataOffset.
//
// This writer only ever produces the minimal valid shape the reader
// actually uses: no metadata/thumbnails/chapters (all those "has*" flags
// stay 0 and their offsets stay 0 - XtcReader.cpp only touches
// metadataOffset when hasMetadata is set).

const XTC_MARK = 0x00435458; // "XTC\0"
const XTCH_MARK = 0x48435458; // "XTCH"

export interface XtcPage {
  block: Uint8Array; // full encodeXtg()/encodeXth() output (header+body)
  width: number;
  height: number;
}

export function encodeXtcContainer(pages: XtcPage[], isXtch: boolean): Uint8Array {
  const pageCount = pages.length;
  const headerSize = 56;
  const indexEntrySize = 16;
  const indexSize = indexEntrySize * pageCount;
  const dataOffset = headerSize + indexSize;

  let totalDataSize = 0;
  for (const p of pages) totalDataSize += p.block.length;

  const out = new Uint8Array(dataOffset + totalDataSize);
  const view = new DataView(out.buffer);

  // File header.
  view.setUint32(0, isXtch ? XTCH_MARK : XTC_MARK, true);
  view.setUint16(4, 1, true); // version
  view.setUint16(6, pageCount, true);
  out[8] = 0; // readDirection
  out[9] = 0; // hasMetadata
  out[10] = 0; // hasThumbnails
  out[11] = 0; // hasChapters
  view.setUint32(12, 0, true); // currentPage
  view.setBigUint64(16, 0n, true); // metadataOffset
  view.setBigUint64(24, BigInt(headerSize), true); // indexOffset
  view.setBigUint64(32, BigInt(dataOffset), true); // dataOffset
  view.setBigUint64(40, 0n, true); // thumbOffset
  view.setBigUint64(48, 0n, true); // chapterOffset

  // Page index + data.
  let cursor = dataOffset;
  for (let i = 0; i < pageCount; i++) {
    const page = pages[i];
    const entryOffset = headerSize + i * indexEntrySize;
    view.setBigUint64(entryOffset, BigInt(cursor), true);
    view.setUint32(entryOffset + 8, page.block.length, true);
    view.setUint16(entryOffset + 12, page.width, true);
    view.setUint16(entryOffset + 14, page.height, true);

    out.set(page.block, cursor);
    cursor += page.block.length;
  }

  return out;
}
