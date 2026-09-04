import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ePub, { type Book, type Rendition } from "epubjs";
import { CaretLeft, CaretRight, BookOpen } from "@phosphor-icons/react";
import { Card, EmptyState, ErrorState, Skeleton } from "../components/ui";
import { DropZone } from "../components/DropZone";
import { useDeviceConnection } from "../hooks/useDeviceConnection";
import "./Read.css";

// Resume position is tracked purely client-side (epub.js's own CFI - an
// exact, browser-authoritative anchor) in localStorage, keyed by a stable
// identity for the book. This is deliberately NOT the same thing as the
// device's own (spineIndex, charStart) progress - that's a separate,
// approximate, cross-device-visible anchor that would need a new firmware
// endpoint to round-trip (see the plan) and isn't wired up yet. This
// screen's own resume-on-reopen works standalone regardless.
function storageKeyFor(identity: string): string {
  return `proink-companion:read-cfi:${identity}`;
}

function loadSavedCfi(identity: string): string | undefined {
  try {
    return localStorage.getItem(storageKeyFor(identity)) ?? undefined;
  } catch {
    return undefined;
  }
}

function saveCfi(identity: string, cfi: string) {
  try {
    localStorage.setItem(storageKeyFor(identity), cfi);
  } catch {
    // best-effort - losing the resume point isn't worth failing the read over
  }
}

// epub.js drives its internal render queue purely off requestAnimationFrame,
// which browsers can suspend indefinitely for a backgrounded/hidden tab - if
// that happens mid-load, rendition.display() never resolves and never
// rejects, so without this the loading skeleton would just spin forever with
// no way out. Race it against a generous timeout instead.
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

export function Read() {
  const { api, base } = useDeviceConnection();
  const [searchParams] = useSearchParams();
  const devicePath = searchParams.get("path");

  const [localFile, setLocalFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationLabel, setLocationLabel] = useState("");

  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const identityRef = useRef<string>("");

  const source: { kind: "device"; path: string } | { kind: "local"; file: File } | null = devicePath
    ? { kind: "device", path: devicePath }
    : localFile
      ? { kind: "local", file: localFile }
      : null;

  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setTitle("");

    (async () => {
      try {
        let data: ArrayBuffer;
        let identity: string;
        if (source.kind === "device") {
          if (!api) throw new Error("Connect to a device first, or open a local file instead.");
          const res = await fetch(api.downloadUrl(source.path));
          if (!res.ok) throw new Error(`Could not download this book (${res.status}).`);
          data = await res.arrayBuffer();
          identity = source.path;
        } else {
          data = await source.file.arrayBuffer();
          identity = `${source.file.name}:${source.file.size}`;
        }
        if (cancelled) return;

        identityRef.current = identity;
        const book = ePub(data);
        bookRef.current = book;
        await book.ready;
        if (cancelled) return;

        const meta = await book.loaded.metadata;
        if (!cancelled) setTitle(meta.title || (source.kind === "device" ? source.path : source.file.name));

        if (!viewerRef.current) return;
        const rendition = book.renderTo(viewerRef.current, {
          width: "100%",
          height: "100%",
          flow: "paginated",
          spread: "none",
        });
        renditionRef.current = rendition;

        rendition.on("relocated", (location: { start: { cfi: string; displayed: { page: number; total: number } } }) => {
          saveCfi(identity, location.start.cfi);
          setLocationLabel(`Page ${location.start.displayed.page} of ${location.start.displayed.total}`);
        });

        const savedCfi = loadSavedCfi(identity);
        await withTimeout(rendition.display(savedCfi), 20000, "This is taking too long to open - bring this tab into focus and try again.");
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not open this book.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      renditionRef.current?.destroy();
      bookRef.current?.destroy();
      renditionRef.current = null;
      bookRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devicePath, localFile]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") renditionRef.current?.prev();
      if (e.key === "ArrowRight") renditionRef.current?.next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!source) {
    return (
      <div>
        <h1 className="page-title">Read</h1>
        <Card className="read-picker-card">
          <EmptyState
            icon={<BookOpen size={28} />}
            title="Open a book"
            hint={base ? "Open an EPUB from Files, or drop one here to read it straight from this computer." : "Drop an EPUB here to read it - no device needed."}
          />
          <DropZone
            accept=".epub,application/epub+zip"
            label="Drop an EPUB here, or click to browse"
            onFiles={(files) => setLocalFile(files[0])}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="read-page">
      <div className="read-header">
        <h1 className="page-title read-title">{title || "Read"}</h1>
        {locationLabel && <span className="read-location">{locationLabel}</span>}
      </div>

      {error && <ErrorState message={error} />}

      {/* Always rendered (never display:none) so its ref has real, measurable
          dimensions by the time the load effect calls book.renderTo() -
          epub.js sizes its iframe off the container's actual layout box,
          and a hidden container measures as 0x0. The loading skeleton
          overlays on top instead of replacing this. */}
      <div className={`read-viewer-wrap ${error ? "read-viewer-hidden" : ""}`}>
        {loading && (
          <div className="read-loading-overlay">
            <Skeleton height={500} />
          </div>
        )}
        <button className="read-nav read-nav-prev" aria-label="Previous page" onClick={() => renditionRef.current?.prev()}>
          <CaretLeft size={20} weight="bold" />
        </button>
        <div ref={viewerRef} className="read-viewer" />
        <button className="read-nav read-nav-next" aria-label="Next page" onClick={() => renditionRef.current?.next()}>
          <CaretRight size={20} weight="bold" />
        </button>
      </div>
    </div>
  );
}
