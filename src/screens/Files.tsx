import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { File, FolderPlus, FolderSimple, Trash, UploadSimple, CaretRight, Plugs } from "@phosphor-icons/react";
import { useDeviceConnection } from "../hooks/useDeviceConnection";
import { useDirListing, useFileOps } from "../hooks/useDeviceQueries";
import { Button, EmptyState, ErrorState, Skeleton } from "../components/ui";
import "./Files.css";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

function joinPath(dir: string, name: string): string {
  return dir === "/" ? `/${name}` : `${dir}/${name}`;
}

export function Files() {
  const { api } = useDeviceConnection();
  const [dir, setDir] = useState("/");
  const { data: entries, isLoading, error, refetch } = useDirListing(dir);
  const { upload, remove, mkdir } = useFileOps(dir);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const segments = dir === "/" ? [] : dir.split("/").filter(Boolean);

  function goTo(index: number) {
    setDir(index < 0 ? "/" : "/" + segments.slice(0, index + 1).join("/"));
  }

  if (!api) {
    return (
      <div>
        <h1 className="page-title">Files</h1>
        <EmptyState
          icon={<Plugs size={28} />}
          title="Not connected"
          hint="Connect to your Proink to browse, upload, and manage files on the SD card."
        />
        <Link to="/connect">
          <Button variant="primary">Connect a device</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Files</h1>

      <div className="files-toolbar">
        <nav className="breadcrumb">
          <button onClick={() => goTo(-1)}>SD card</button>
          {segments.map((seg, i) => (
            <span key={i}>
              <CaretRight size={12} />
              <button onClick={() => goTo(i)}>{seg}</button>
            </span>
          ))}
        </nav>
        <div className="files-actions">
          <Button
            variant="ghost"
            onClick={() => {
              const name = prompt("New folder name");
              if (name) mkdir.mutate(joinPath(dir, name));
            }}
          >
            <FolderPlus size={16} weight="bold" /> New folder
          </Button>
          <Button variant="primary" onClick={() => fileInputRef.current?.click()} disabled={upload.isPending}>
            <UploadSimple size={16} weight="bold" /> {upload.isPending ? "Uploading…" : "Upload"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files?.length) upload.mutate(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {isLoading && (
        <div className="file-list">
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
        </div>
      )}

      {error && <ErrorState message={(error as Error).message} onRetry={() => refetch()} />}

      {entries && entries.length === 0 && <EmptyState title="This folder is empty" hint="Upload a file to get started." />}

      {entries && entries.length > 0 && (
        <ul className="file-list">
          {entries.map((entry) => {
            const path = joinPath(dir, entry.name);
            return (
              <li key={entry.name} className="file-row">
                <button
                  className="file-row-main"
                  onClick={() => (entry.isDir ? setDir(path) : undefined)}
                  disabled={!entry.isDir}
                >
                  {entry.isDir ? <FolderSimple size={18} weight="fill" /> : <File size={18} />}
                  <span className="file-name">{entry.name}</span>
                  {!entry.isDir && <span className="file-size mono">{formatBytes(entry.size)}</span>}
                </button>
                <div className="file-row-actions">
                  {!entry.isDir && (
                    <a className="file-download" href={api!.downloadUrl(path)} download>
                      Download
                    </a>
                  )}
                  <button
                    className="file-delete"
                    aria-label={`Delete ${entry.name}`}
                    onClick={() => {
                      if (confirm(`Delete ${entry.name}? This can't be undone.`)) remove.mutate(path);
                    }}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
