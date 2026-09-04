import { useRef, useState, type DragEvent, type ChangeEvent, type ReactNode } from "react";
import { UploadSimple } from "@phosphor-icons/react";
import "./DropZone.css";

export function DropZone({
  accept,
  multiple = false,
  label,
  onFiles,
}: {
  accept: string;
  multiple?: boolean;
  label: ReactNode;
  onFiles: (files: File[]) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrag(e: DragEvent<HTMLButtonElement>) {
    if (!Array.from(e.dataTransfer.types).includes("Files")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOver(true);
  }

  function handleDragLeave(e: DragEvent<HTMLButtonElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragOver(false);
  }

  function handleDrop(e: DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(multiple ? files : [files[0]]);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onFiles(multiple ? files : [files[0]]);
    e.target.value = "";
  }

  return (
    <button
      type="button"
      className={`dropzone ${dragOver ? "dropzone-active" : ""}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <UploadSimple size={20} weight="bold" />
      <span>{label}</span>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} hidden onChange={handleChange} />
    </button>
  );
}
