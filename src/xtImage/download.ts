export function downloadBytes(bytes: Uint8Array, filename: string, mime = "application/octet-stream") {
  const blob = new Blob([bytes as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function bytesToFile(bytes: Uint8Array, filename: string, mime = "application/octet-stream"): File {
  return new File([bytes as BlobPart], filename, { type: mime });
}

export function stripExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx > 0 ? filename.slice(0, idx) : filename;
}
