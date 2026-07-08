"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadProductImage, uploadCategoryImage } from "@/lib/storage";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: "products" | "categories";
  label?: string;
}

export default function ImageUpload({
  value,
  onChange,
  folder = "products",
  label = "Produktbild",
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
          : await uploadProductImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-wood-dark">{label}</label>

      {value ? (
        <div className="relative w-full max-w-xs aspect-square rounded-xl overflow-hidden border-2 border-wood/20">
          <Image src={value} alt="Vorschau" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full max-w-xs aspect-square rounded-xl border-2 border-dashed border-wood/30 bg-cream-dark/30 flex flex-col items-center justify-center gap-2 hover:border-forest hover:bg-forest/5 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-forest animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-wood/40" />
              <span className="text-sm text-wood/60">Bild hochladen</span>
              <span className="text-xs text-wood/40">JPEG, PNG, WebP · max. 5 MB</span>
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

      <Input
        label="oder Bild-URL eingeben"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

// Inline Input to avoid circular import - use simple input here
function Input({
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
        className="w-full rounded-lg border-2 border-wood/20 bg-cream px-4 py-2.5 text-wood-dark placeholder:text-wood/40 focus:border-forest focus:outline-none text-sm"
      />
    </div>
  );
}
