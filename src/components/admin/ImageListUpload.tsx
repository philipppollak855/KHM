"use client";

import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";

interface ImageListUploadProps {
  label: string;
  hint?: string;
  images: string[];
  onChange: (images: string[]) => void;
  folder?: "products" | "marketing";
  libraryQuery?: string;
}

export default function ImageListUpload({
  label,
  hint,
  images,
  onChange,
  folder = "products",
  libraryQuery,
}: ImageListUploadProps) {
  const addImage = (url: string) => {
    if (!url || images.includes(url)) return;
    onChange([...images, url]);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-wood-dark">{label}</p>
        {hint && <p className="text-xs text-stone mt-1">{hint}</p>}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative aspect-square rounded-xl overflow-hidden border border-wood/15 bg-linen"
            >
              <Image
                src={url}
                alt={`Galeriebild ${index + 1}`}
                fill
                className="object-cover"
                unoptimized={url.includes("firebasestorage")}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700"
                aria-label="Bild entfernen"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-dashed border-wood/25 p-4 bg-linen/40">
        <div className="flex items-center gap-2 text-sm text-wood-dark mb-3">
          <Plus className="h-4 w-4" />
          Weiteres Bild hinzufügen
        </div>
        <ImageUpload
          value=""
          onChange={addImage}
          folder={folder}
          label=""
          hint="Wird zur Galerie hinzugefügt"
          libraryQuery={libraryQuery}
        />
      </div>
    </div>
  );
}
