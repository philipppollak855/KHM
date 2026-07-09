"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, RefreshCw } from "lucide-react";
import { uploadProductImage, uploadCategoryImage, uploadBrandingImage } from "@/lib/storage";

type UploadFolder = "products" | "categories" | "branding";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: UploadFolder;
  label?: string;
  hint?: string;
  previewAspect?: "square" | "wide";
}

export default function ImageUpload({
  value,
  onChange,
  folder = "products",
  label = "Produktbild",
  hint,
  previewAspect = "square",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const url =
        folder === "categories"
          ? await uploadCategoryImage(file)
          : folder === "branding"
            ? await uploadBrandingImage(file)
            : await uploadProductImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  };

  const previewClass =
    previewAspect === "wide"
      ? "relative w-full max-w-sm aspect-[3/1] rounded-xl overflow-hidden border-2 border-wood/20 bg-linen"
      : "relative w-full max-w-xs aspect-square rounded-xl overflow-hidden border-2 border-wood/20";

  const emptyClass =
    previewAspect === "wide"
      ? "w-full max-w-sm aspect-[3/1] rounded-xl border-2 border-dashed border-wood/30 bg-linen flex flex-col items-center justify-center gap-2 hover:border-forest hover:bg-forest/5 transition-colors disabled:opacity-50"
      : "w-full max-w-xs aspect-square rounded-xl border-2 border-dashed border-wood/30 bg-linen flex flex-col items-center justify-center gap-2 hover:border-forest hover:bg-forest/5 transition-colors disabled:opacity-50";

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-wood-dark">{label}</label>
      {hint && <p className="text-xs text-stone -mt-1">{hint}</p>}

      {value ? (
        <div className="space-y-3">
          <div className={previewClass}>
            <Image
              src={value}
              alt="Vorschau"
              fill
              className={previewAspect === "wide" ? "object-contain p-2" : "object-cover"}
              unoptimized={value.includes("firebasestorage")}
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              title="Bild entfernen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 text-sm text-forest hover:underline disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Bild ersetzen
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={emptyClass}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-forest animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-wood/40" />
              <span className="text-sm text-wood-dark font-medium">Bild hochladen</span>
              <span className="text-xs text-stone">JPEG, PNG, WebP · max. 5 MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <UrlInput
        label="oder Bild-URL eingeben"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function UrlInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-wood-dark">{label}</label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border-2 border-wood/20 bg-linen px-4 py-2.5 text-wood-dark placeholder:text-wood/40 focus:border-forest focus:outline-none text-sm"
      />
    </div>
  );
}
