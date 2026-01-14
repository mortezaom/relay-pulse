/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: DND */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: DND */
"use client";

import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/hooks/use-file-upload";

export default function BrandingFileUpload({
  currentImage,
  onFileChangeAction,
}: {
  currentImage: string | null;
  onFileChangeAction?: (
    file: File | "removed" | null,
    previewUrl: string | null
  ) => void;
}) {
  const maxSizeMB = 0.5;
  const maxSize = maxSizeMB * 1024 * 1024;

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile: removeUploadedFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
    maxSize,
  });

  const [current, setCurrent] = useState(currentImage);
  const previewUrl = files[0]?.preview || null;
  const fileName = files[0]?.file.name || null;

  // Notify parent when a new file is selected or removed
  useEffect(() => {
    if (onFileChangeAction) {
      const candidate = files[0]?.file;
      const actualFile = candidate instanceof File ? candidate : null;
      onFileChangeAction(actualFile, files[0]?.preview || null);
    }
  }, [files, onFileChangeAction]);

  const handleRemove = () => {
    if (files[0]?.id) {
      removeUploadedFile(files[0].id);
    }
    // Explicitly clear in parent
    onFileChangeAction?.("removed", null);
    if (current) {
      setCurrent(null);
    }
  };

  const preview = previewUrl || current || null;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <div
          className="relative flex h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-input border-dashed p-4 transition-colors has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
          data-dragging={isDragging || undefined}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            {...getInputProps({
              onChange: () => {
                // Hook handles state update; effect above notifies parent.
              },
            })}
            aria-label="Upload image file"
            className="sr-only"
          />
          {preview ? (
            <div className="absolute inset-0 flex h-full items-center justify-center p-4">
              {/** biome-ignore lint/performance/noImgElement: client side image */}
              {/** biome-ignore lint/correctness/useImageSize: Not-Needed */}
              <img
                alt={fileName || "Uploaded image"}
                className="mx-auto max-h-full rounded object-contain"
                src={preview}
              />
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center px-4 py-3 text-center">
              <div
                aria-hidden="true"
                className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
              >
                <ImageIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-3.5 font-medium text-sm">Upload your Logo</p>
              <p className="flex flex-col items-center gap-1 text-muted-foreground text-xs">
                <span>SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)</span>
                <b>Prefered size: 200x200px</b>
              </p>
              <Button
                className="mt-4 text-primary"
                onClick={() => {
                  openFileDialog();
                }}
                type="button"
                variant="ghost"
              >
                <UploadIcon
                  aria-hidden="true"
                  className="-ms-1 size-4 opacity-60"
                />
                Select image
              </Button>
            </div>
          )}
        </div>

        {preview && (
          <div className="absolute top-4 right-4">
            <button
              aria-label="Remove image"
              className="z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-none transition-[color,box-shadow] hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onClick={handleRemove}
              type="button"
            >
              <XIcon aria-hidden="true" className="size-4" />
            </button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className="flex items-center gap-1 text-destructive text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  );
}
