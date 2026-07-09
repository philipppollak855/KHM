export type ImageLibraryResult = {
  id: string;
  url: string;
  thumbnail: string;
  alt: string;
  attribution: string;
  source: "unsplash" | "openverse";
};

export function buildImageSearchQuery(title: string): string {
  const cleaned = title.trim().replace(/\s+/g, " ");
  if (!cleaned) return "handmade craft wood";
  return `${cleaned} handmade craft`;
}

async function searchUnsplash(
  query: string,
  limit: number
): Promise<ImageLibraryResult[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!accessKey) return [];

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(Math.min(limit, 12)));
  url.searchParams.set("orientation", "squarish");

  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${accessKey}` },
    next: { revalidate: 3600 },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as {
    results?: Array<{
      id: string;
      alt_description?: string | null;
      description?: string | null;
      urls?: { regular?: string; small?: string };
      user?: { name?: string };
    }>;
  };

  return (data.results || [])
    .filter((photo) => photo.urls?.regular)
    .map((photo) => ({
      id: `unsplash-${photo.id}`,
      url: `${photo.urls!.regular!}?w=900&q=80&auto=format&fit=crop`,
      thumbnail: photo.urls?.small || photo.urls!.regular!,
      alt: photo.alt_description || photo.description || query,
      attribution: photo.user?.name ? `Foto: ${photo.user.name} / Unsplash` : "Unsplash",
      source: "unsplash" as const,
    }));
}

async function searchOpenverse(
  query: string,
  limit: number
): Promise<ImageLibraryResult[]> {
  const url = new URL("https://api.openverse.org/v1/images/");
  url.searchParams.set("q", query);
  url.searchParams.set("page_size", String(Math.min(limit, 12)));
  url.searchParams.set("license_type", "commercial,modification");

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const data = (await res.json()) as {
    results?: Array<{
      id: string;
      title?: string | null;
      url?: string;
      thumbnail?: string | null;
      creator?: string | null;
      creator_url?: string | null;
    }>;
  };

  return (data.results || [])
    .filter((item) => item.url)
    .map((item) => ({
      id: `openverse-${item.id}`,
      url: item.url!,
      thumbnail: item.thumbnail || item.url!,
      alt: item.title || query,
      attribution: item.creator ? `Foto: ${item.creator} / Openverse` : "Openverse",
      source: "openverse" as const,
    }));
}

export async function searchImageLibrary(
  query: string,
  limit = 12
): Promise<ImageLibraryResult[]> {
  const normalized = buildImageSearchQuery(query);
  const perSource = Math.ceil(limit / 2);

  const [unsplash, openverse] = await Promise.all([
    searchUnsplash(normalized, perSource),
    searchOpenverse(normalized, perSource),
  ]);

  const seen = new Set<string>();
  const merged: ImageLibraryResult[] = [];

  for (const item of [...unsplash, ...openverse]) {
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    merged.push(item);
    if (merged.length >= limit) break;
  }

  return merged;
}
