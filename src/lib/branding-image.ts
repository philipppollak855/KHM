export type BrandingImageFormat = "PNG" | "JPEG" | "WEBP";

export interface BrandingImageData {
  dataUrl: string;
  format: BrandingImageFormat;
}

function formatFromMime(mime: string): BrandingImageFormat {
  if (mime.includes("png")) return "PNG";
  if (mime.includes("webp")) return "WEBP";
  return "JPEG";
}

export async function fetchBrandingImageData(
  url?: string
): Promise<BrandingImageData | null> {
  if (!url) return null;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const format = formatFromMime(blob.type);

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          format,
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export function getPwaShortName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "KHM";
  const words = trimmed.split(/\s+/);
  if (words.length === 1) return trimmed.slice(0, 12);
  const acronym = words
    .map((word) => word.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, "").charAt(0))
    .join("")
    .toUpperCase();
  return acronym.slice(0, 12) || trimmed.slice(0, 12);
}
