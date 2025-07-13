"use client";

import {
	AlertCircleIcon,
	ImageIcon,
	UploadIcon,
	XIcon,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/hooks/use-file-upload";

export default function BrandingFileUpload() {
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
			removeFile,
			getInputProps,
		},
	] = useFileUpload({
		accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
		maxSize,
	});

	const previewUrl = files[0]?.preview || null;
	const fileName = files[0]?.file.name || null;

	return (
		<div className="flex flex-col gap-2">
			<div className="relative">
				<div
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					data-dragging={isDragging || undefined}
					className="relative flex flex-col justify-center items-center data-[dragging=true]:bg-accent/50 p-4 border border-input has-[input:focus]:border-ring border-dashed rounded-xl has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 min-h-52 overflow-hidden transition-colors"
				>
					<input
						{...getInputProps()}
						className="sr-only"
						aria-label="Upload image file"
					/>
					{previewUrl ? (
						<div className="absolute inset-0 flex justify-center items-center p-4">
							<Image
								src={previewUrl}
								alt={fileName || "Uploaded image"}
								className="mx-auto rounded max-h-full object-contain"
							/>
						</div>
					) : (
						<div className="flex flex-col justify-center items-center px-4 py-3 text-center">
							<div
								className="flex justify-center items-center bg-background mb-2 border rounded-full size-11 shrink-0"
								aria-hidden="true"
							>
								<ImageIcon className="opacity-60 size-4" />
							</div>
							<p className="mb-1.5 font-medium text-sm">
								Drop your image here
							</p>
							<p className="text-muted-foreground text-xs">
								SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)
							</p>
							<Button
								variant="ghost"
								className="mt-4 text-primary"
								onClick={(e) => {
									e.preventDefault();
									openFileDialog();
								}}
							>
								<UploadIcon
									className="opacity-60 -ms-1 size-4"
									aria-hidden="true"
								/>
								Select image
							</Button>
						</div>
					)}
				</div>

				{previewUrl && (
					<div className="top-4 right-4 absolute">
						<button
							type="button"
							className="z-50 flex justify-center items-center bg-black/60 hover:bg-black/80 focus-visible:border-ring rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 size-8 text-white transition-[color,box-shadow] cursor-pointer"
							onClick={() => removeFile(files[0]?.id)}
							aria-label="Remove image"
						>
							<XIcon className="size-4" aria-hidden="true" />
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
