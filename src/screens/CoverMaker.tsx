import { useEffect, useState } from "react";
import { Download } from "@phosphor-icons/react";
import { Card, Button, TextField, Select } from "../components/ui";
import { DropZone } from "../components/DropZone";
import { fitToCanvas, loadImageBitmap, type FitMode } from "../xtImage/imageOps";
import { stripExtension } from "../xtImage/download";
import "./CoverMaker.css";

const FIT_OPTIONS = [
  { value: "fit", label: "Fit — scale down, pad with white" },
  { value: "crop", label: "Crop — scale up and fill, cropping edges" },
  { value: "stretch", label: "Stretch — fill exactly, may distort" },
];

export function CoverMaker() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState("600");
  const [height, setHeight] = useState("800");
  const [fitMode, setFitMode] = useState<FitMode>("fit");
  const [previewUrl, setPreviewUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const w = Math.max(1, Math.round(Number(width) || 0));
  const h = Math.max(1, Math.round(Number(height) || 0));

  useEffect(() => {
    let cancelled = false;
    setError("");
    if (!file) {
      setPreviewUrl("");
      return;
    }
    setBusy(true);
    (async () => {
      try {
        const bitmap = await loadImageBitmap(file);
        const canvas = fitToCanvas(bitmap, w, h, fitMode);
        if (cancelled) return;
        setPreviewUrl(canvas.toDataURL("image/png"));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not read this image.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, w, h, fitMode]);

  function download() {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `${file ? stripExtension(file.name) : "cover"}.png`;
    a.click();
  }

  return (
    <div>
      <h1 className="page-title">Cover Maker</h1>

      <Card className="maker-card">
        <p className="maker-intro">Resize or crop an image to an exact target size, for use as an EPUB cover.</p>

        {!file ? (
          <DropZone accept="image/*" label="Drop an image here, or click to browse" onFiles={(f) => setFile(f[0])} />
        ) : (
          <>
            <div className="maker-fields">
              <TextField label="Width (px)" type="number" value={width} onChange={setWidth} />
              <TextField label="Height (px)" type="number" value={height} onChange={setHeight} />
              <Select label="Fit" value={fitMode} onChange={(v) => setFitMode(v as FitMode)} options={FIT_OPTIONS} />
            </div>

            {previewUrl && (
              <div className="maker-preview">
                <img src={previewUrl} alt="Preview" />
              </div>
            )}
            {error && <p className="maker-error">{error}</p>}

            <div className="maker-actions">
              <Button variant="ghost" onClick={() => setFile(null)}>
                Choose a different image
              </Button>
              <Button variant="primary" disabled={busy || !previewUrl} onClick={download}>
                <Download size={16} weight="bold" /> Download PNG
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

