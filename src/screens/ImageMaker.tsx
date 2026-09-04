import { useEffect, useState } from "react";
import { Download, Usb } from "@phosphor-icons/react";
import { Card, Button, Select, Toggle } from "../components/ui";
import { DropZone } from "../components/DropZone";
import { prepareImage, type FitMode, type PreparedImage } from "../xtImage/imageOps";
import { encodeXtg, encodeXth } from "../xtImage/xtgXth";
import { encodeSleepBmp } from "../xtImage/bmp";
import { downloadBytes, bytesToFile, stripExtension } from "../xtImage/download";
import { DEVICE_PROFILES, DEFAULT_DEVICE } from "../xtImage/deviceProfiles";
import { useDeviceConnection } from "../hooks/useDeviceConnection";
import { useFileOps } from "../hooks/useDeviceQueries";
import "./CoverMaker.css";
import "./ImageMaker.css";

type OutputFormat = "xtg" | "xth" | "bmp-sleep";

const FORMAT_OPTIONS = [
  { value: "xtg", label: "XTG — 1-bit monochrome (book page, sharp text)" },
  { value: "xth", label: "XTH — 2-bit grayscale (book page, softer photos)" },
  { value: "bmp-sleep", label: "BMP — custom sleep screen (800×480)" },
];

const FIT_OPTIONS = [
  { value: "fit", label: "Fit — scale down, pad with white" },
  { value: "crop", label: "Crop — scale up and fill, cropping edges" },
  { value: "stretch", label: "Stretch — fill exactly, may distort" },
];

function targetSize(format: OutputFormat): { width: number; height: number } {
  if (format === "bmp-sleep") return { width: 800, height: 480 };
  const profile = DEVICE_PROFILES[DEFAULT_DEVICE];
  return { width: profile.width, height: profile.height };
}

export function ImageMaker() {
  const { base } = useDeviceConnection();
  const { upload } = useFileOps("/.sleep");
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<OutputFormat>("xtg");
  const [fitMode, setFitMode] = useState<FitMode>("fit");
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [invert, setInvert] = useState(false);
  const [dither, setDither] = useState(true);
  const [prepared, setPrepared] = useState<PreparedImage | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pushed, setPushed] = useState(false);

  const { width, height } = targetSize(format);

  useEffect(() => {
    let cancelled = false;
    setError("");
    setPushed(false);
    if (!file) {
      setPrepared(null);
      setPreviewUrl("");
      return;
    }
    setBusy(true);
    (async () => {
      try {
        const img = await prepareImage(file, width, height, { fitMode, brightness, contrast, invert });
        if (cancelled) return;
        setPrepared(img);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        const imgData = ctx.createImageData(width, height);
        for (let i = 0, p = 0; i < img.gray.length; i++, p += 4) {
          const v = Math.round(img.gray[i]);
          imgData.data[p] = v;
          imgData.data[p + 1] = v;
          imgData.data[p + 2] = v;
          imgData.data[p + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
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
  }, [file, format, fitMode, brightness, contrast, invert, width, height]);

  function encode(): { bytes: Uint8Array; ext: string; mime: string } | null {
    if (!prepared) return null;
    if (format === "xtg") return { bytes: encodeXtg(prepared, dither), ext: "xtg", mime: "application/x-xtg" };
    if (format === "xth") return { bytes: encodeXth(prepared, dither), ext: "xth", mime: "application/x-xth" };
    return { bytes: encodeSleepBmp(prepared), ext: "bmp", mime: "image/bmp" };
  }

  function handleDownload() {
    const result = encode();
    if (!result || !file) return;
    downloadBytes(result.bytes, `${stripExtension(file.name)}.${result.ext}`, result.mime);
  }

  function handlePushToDevice() {
    const result = encode();
    if (!result || !file || format !== "bmp-sleep") return;
    const pushFile = bytesToFile(result.bytes, "sleep.bmp", result.mime);
    upload.mutate([pushFile], { onSuccess: () => setPushed(true) });
  }

  return (
    <div>
      <h1 className="page-title">Image Maker</h1>

      <Card className="maker-card">
        <p className="maker-intro">
          Turn any picture into a device-native <code className="mono">.xtg</code>/<code className="mono">.xth</code> book
          page, or a <code className="mono">.bmp</code> custom sleep screen — dithered and sized for the panel.
        </p>

        {!file ? (
          <DropZone accept="image/*" label="Drop an image here, or click to browse" onFiles={(f) => setFile(f[0])} />
        ) : (
          <>
            <div className="maker-fields">
              <Select label="Output" value={format} onChange={(v) => setFormat(v as OutputFormat)} options={FORMAT_OPTIONS} />
              <Select label="Fit" value={fitMode} onChange={(v) => setFitMode(v as FitMode)} options={FIT_OPTIONS} />
            </div>

            <div className="image-maker-sliders">
              <label className="image-maker-slider">
                <span>Brightness ({brightness.toFixed(2)}×)</span>
                <input type="range" min={0.5} max={1.5} step={0.05} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} />
              </label>
              <label className="image-maker-slider">
                <span>Contrast ({contrast.toFixed(2)}×)</span>
                <input type="range" min={0.5} max={2} step={0.05} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} />
              </label>
            </div>

            {format !== "bmp-sleep" && <Toggle label="Dithering" checked={dither} onChange={setDither} />}
            <Toggle label="Invert" checked={invert} onChange={setInvert} />

            {previewUrl && (
              <div className="maker-preview">
                <img src={previewUrl} alt="Preview" />
              </div>
            )}
            {error && <p className="maker-error">{error}</p>}
            <p className="image-maker-size">
              {width}×{height}
            </p>

            <div className="maker-actions">
              <Button variant="ghost" onClick={() => setFile(null)}>
                Choose a different image
              </Button>
              <div className="image-maker-action-group">
                {format === "bmp-sleep" && base && (
                  <Button variant="default" disabled={busy || !prepared || upload.isPending} onClick={handlePushToDevice}>
                    <Usb size={16} weight="bold" /> {upload.isPending ? "Sending…" : pushed ? "Sent ✓" : "Push to device"}
                  </Button>
                )}
                <Button variant="primary" disabled={busy || !prepared} onClick={handleDownload}>
                  <Download size={16} weight="bold" /> Download
                </Button>
              </div>
            </div>
            {format === "bmp-sleep" && !base && (
              <p className="image-maker-hint">Connect a device to push this straight to /.sleep instead of downloading.</p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
