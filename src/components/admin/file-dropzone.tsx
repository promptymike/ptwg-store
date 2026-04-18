"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { FileUp, Image as ImageIcon, File as FileIcon, X } from "lucide-react";

type FileDropzoneProps = {
  name: string;
  accept?: string;
  multiple?: boolean;
  label?: string;
  hint?: string;
  maxSizeMb?: number;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

export function FileDropzone({
  name,
  accept,
  multiple = false,
  label = "Upuść plik tutaj",
  hint,
  maxSizeMb,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function applyFiles(incoming: FileList | null) {
    if (!incoming || incoming.length === 0) {
      setFiles([]);
      setPreviews((current) => {
        current.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
      return;
    }

    const list = Array.from(incoming);

    if (maxSizeMb) {
      const tooBig = list.find((file) => file.size > maxSizeMb * 1024 * 1024);
      if (tooBig) {
        setError(`Plik "${tooBig.name}" przekracza limit ${maxSizeMb} MB.`);
        return;
      }
    }

    setError(null);
    setFiles(list);
    setPreviews((current) => {
      current.forEach((url) => URL.revokeObjectURL(url));
      return list.filter(isImageFile).map((file) => URL.createObjectURL(file));
    });
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    applyFiles(event.target.files);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragOver(false);

    if (!inputRef.current) return;
    const dropped = event.dataTransfer.files;
    if (!dropped || dropped.length === 0) return;

    const dataTransfer = new DataTransfer();
    Array.from(dropped).forEach((file) => dataTransfer.items.add(file));
    inputRef.current.files = dataTransfer.files;
    applyFiles(dataTransfer.files);
  }

  function clearSelection() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    applyFiles(null);
  }

  return (
    <div className="space-y-2">
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center transition ${
          isDragOver
            ? "border-primary bg-primary/10"
            : "border-border/80 bg-background/60 hover:border-primary/60 hover:bg-primary/5"
        }`}
      >
        <input
          ref={inputRef}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="sr-only"
        />

        <div className="flex items-center gap-2 text-sm text-foreground">
          <FileUp className="size-4 text-primary" />
          <span className="font-medium">{label}</span>
          <span className="text-muted-foreground">lub kliknij</span>
        </div>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </label>

      {error ? (
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
      ) : null}

      {files.length > 0 ? (
        <div className="space-y-2 rounded-2xl border border-border/70 bg-background/50 p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{files.length === 1 ? "Wybrany plik" : `${files.length} plików`}</span>
            <button
              type="button"
              onClick={clearSelection}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <X className="size-3" />
              Wyczyść
            </button>
          </div>

          <div className="grid gap-2">
            {files.map((file, index) => {
              const previewUrl = isImageFile(file) ? previews[index] : null;
              return (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 rounded-xl bg-card/70 p-2"
                >
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not a remote asset
                    <img
                      src={previewUrl}
                      alt=""
                      className="size-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {isImageFile(file) ? (
                        <ImageIcon className="size-5" />
                      ) : (
                        <FileIcon className="size-5" />
                      )}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
