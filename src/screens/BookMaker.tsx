import { useState } from "react";
import { Download, Usb, Trash, ArrowUp, ArrowDown } from "@phosphor-icons/react";
import { Card, Button, Select, TextField, Toggle } from "../components/ui";
import { DropZone } from "../components/DropZone";
import { prepareImage, type FitMode } from "../xtImage/imageOps";
import { encodeXtg, encodeXth } from "../xtImage/xtgXth";
import { encodeXtcContainer, type XtcPage } from "../xtImage/xtc";
import { downloadBytes, bytesToFile } from "../xtImage/download";
import { DEVICE_PROFILES, DEFAULT_DEVICE } from "../xtImage/deviceProfiles";
import { useDeviceConnection } from "../hooks/useDeviceConnection";
import { useFileOps } from "../hooks/useDeviceQueries";
import "./CoverMaker.css";
import "./BookMaker.css";

type OutputFormat = "xtc" | "xtch";

const FORMAT_OPTIONS = [
  { value: "xtc", label: "XTC — 1-bit monochrome (sharp text, smaller file)" },
  { value: "xtch", label: "XTCH — 2-bit grayscale (softer photos)" },
];

const FIT_OPTIONS = [
  { value: "fit", label: "Fit — scale down, pad with white" },
  { value: "crop", label: "Crop — scale up and fill, cropping edges" },
  { value: "stretch", label: "Stretch — fill exactly, may distort" },
];

interface QueuedImage {
  id: string;
  file: File;
  previewUrl: string;
}

export function BookMaker() {
  const { base } = useDeviceConnection();
  const { upload } = useFileOps("/Books");
  const [images, setImages] = useState<QueuedImage[]>([]);
  const [title, setTitle] = useState("My Book");
  const [format, setFormat] = useState<OutputFormat>("xtc");
  const [fitMode, setFitMode] = useState<FitMode>("fit");
  const [dither, setDither] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pushed, setPushed] = useState(false);

  const { width, height } = DEVICE_PROFILES[DEFAULT_DEVICE];

  function addFiles(files: File[]) {
    const next = files.map((file) => ({ id: `${file.name}-${file.lastModified}-${Math.random()}`, file, previewUrl: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...next]);
    setPushed(false);
  }

  function removeImage(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setPushed(false);
  }

  function moveImage(id: string, dir: -1 | 1) {
    setImages((prev) => {
      const idx = prev.findIndex((img) => img.id === id);
      const swapWith = idx + dir;
      if (idx < 0 || swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return next;
    });
  }

  async function buildContainer(): Promise<Uint8Array> {
    const pages: XtcPage[] = [];
    for (const img of images) {
      const prepared = await prepareImage(img.file, width, height, { fitMode, brightness: 1, contrast: 1, invert: false });
      const block = format === "xtc" ? encodeXtg(prepared, dither) : encodeXth(prepared, dither);
      pages.push({ block, width, height });
    }
    return encodeXtcContainer(pages, format === "xtch");
  }

  async function handleDownload() {
    if (!images.length || busy) return;
    setBusy(true);
    setError("");
    try {
      const bytes = await buildContainer();
      downloadBytes(bytes, `${title.trim() || "book"}.${format}`, format === "xtc" ? "application/x-xtc" : "application/x-xtch");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build the book.");
    } finally {
      setBusy(false);
    }
  }

  async function handlePushToDevice() {
    if (!images.length || busy) return;
    setBusy(true);
    setError("");
    setPushed(false);
    try {
      const bytes = await buildContainer();
      const pushFile = bytesToFile(bytes, `${title.trim() || "book"}.${format}`, format === "xtc" ? "application/x-xtc" : "application/x-xtch");
      upload.mutate([pushFile], { onSuccess: () => setPushed(true) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build the book.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Book Maker</h1>

      <Card className="maker-card book-maker-card">
        <p className="maker-intro">
          Pack multiple images into one multi-page <code className="mono">.xtc</code>/<code className="mono">.xtch</code>{" "}
          book (a comic/scan-style format, not reflowable text) and push it to the device.
        </p>

        <DropZone accept="image/*" multiple label="Drop images here, or click to browse — order can be changed after" onFiles={addFiles} />

        {images.length > 0 && (
          <ul className="book-maker-list">
            {images.map((img, i) => (
              <li key={img.id} className="book-maker-row">
                <span className="book-maker-index">{i + 1}</span>
                <img className="book-maker-thumb" src={img.previewUrl} alt="" />
                <span className="book-maker-name">{img.file.name}</span>
                <div className="book-maker-row-actions">
                  <button aria-label="Move up" disabled={i === 0} onClick={() => moveImage(img.id, -1)}>
                    <ArrowUp size={14} />
                  </button>
                  <button aria-label="Move down" disabled={i === images.length - 1} onClick={() => moveImage(img.id, 1)}>
                    <ArrowDown size={14} />
                  </button>
                  <button aria-label="Remove" onClick={() => removeImage(img.id)}>
                    <Trash size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {images.length > 0 && (
          <>
            <div className="maker-fields">
              <TextField label="Book title (filename)" value={title} onChange={setTitle} />
              <Select label="Output" value={format} onChange={(v) => setFormat(v as OutputFormat)} options={FORMAT_OPTIONS} />
              <Select label="Fit" value={fitMode} onChange={(v) => setFitMode(v as FitMode)} options={FIT_OPTIONS} />
            </div>
            <Toggle label="Dithering" checked={dither} onChange={setDither} />

            {error && <p className="maker-error">{error}</p>}
            <p className="image-maker-size">
              {images.length} page{images.length === 1 ? "" : "s"} · {width}×{height} each
            </p>

            <div className="maker-actions">
              <span />
              <div className="image-maker-action-group">
                {base && (
                  <Button variant="default" disabled={busy || upload.isPending} onClick={handlePushToDevice}>
                    <Usb size={16} weight="bold" /> {upload.isPending ? "Sending…" : pushed ? "Sent ✓" : "Push to device"}
                  </Button>
                )}
                <Button variant="primary" disabled={busy} onClick={handleDownload}>
                  <Download size={16} weight="bold" /> {busy ? "Building…" : "Download"}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
