export type ImageLibraryResult = {
  id: string;
  url: string;
  thumbnail: string;
  alt: string;
  attribution: string;
  source: "unsplash" | "openverse" | "wikimedia";
};

const FETCH_OPTS: RequestInit = {
  cache: "no-store",
  headers: {
    "User-Agent": "KHM-Handmade/1.0 (admin-image-search)",
    Accept: "application/json",
  },
};

export function buildImageSearchQuery(title: string): string {
  const cleaned = title.trim().replace(/\s+/g, " ");
  if (!cleaned) return "handmade craft wood";
  return cleaned;
}

export function buildImageSearchFallbackQuery(title: string): string {
  const cleaned = title.trim().replace(/\s+/g, " ");
  if (!cleaned) return "handmade wood workshop";
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
    ...FETCH_OPTS,
    headers: {
      ...FETCH_OPTS.headers,
      Authorization: `Client-ID ${accessKey}`,
    },
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

  const res = await fetch(url, FETCH_OPTS);
  if (!res.ok) return [];

  const data = (await res.json()) as {
    results?: Array<{
      id: string;
      title?: string | null;
      url?: string;
      thumbnail?: string | null;
      creator?: string | null;
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

async function searchWikimedia(
  query: string,
  limit: number
): Promise<ImageLibraryResult[]> {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime|thumburl");
  url.searchParams.set("iiurlwidth", "400");
  url.searchParams.set("format", "json");
  url.searchParams.set("gsrlimit", String(Math.min(limit, 12)));

  const res = await fetch(url, FETCH_OPTS);
  if (!res.ok) return [];

  const data = (await res.json()) as {
    query?: {
      pages?: Record<
        string,
        {
          pageid: number;
          title?: string;
          imageinfo?: Array<{
            url?: string;
            thumburl?: string;
            mime?: string;
          }>;
        }
      >;
    };
  };

  const pages = data.query?.pages;
  if (!pages) return [];

  const results: ImageLibraryResult[] = [];
  for (const page of Object.values(pages)) {
    const info = page.imageinfo?.[0];
    if (!info?.url || !info.mime?.startsWith("image/")) continue;
    results.push({
      id: `wikimedia-${page.pageid}`,
      url: info.url,
      thumbnail: info.thumburl || info.url,
      alt: (page.title || query).replace(/^File:/, "").replace(/\.[^.]+$/, ""),
      attribution: "Wikimedia Commons",
      source: "wikimedia" as const,
    });
    if (results.length >= limit) break;
  }

  return results;
}

async function searchAllSources(query: string, limit: number): Promise<ImageLibraryResult[]> {
  const perSource = Math.max(4, Math.ceil(limit / 3));

  const [unsplash, openverse, wikimedia] = await Promise.all([
    searchUnsplash(query, perSource),
    searchOpenverse(query, perSource),
    searchWikimedia(query, perSource),
  ]);

  const seen = new Set<string>();
  const merged: ImageLibraryResult[] = [];

  for (const item of [...openverse, ...wikimedia, ...unsplash]) {
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    merged.push(item);
    if (merged.length >= limit) break;
  }

  return merged;
}

export async function searchImageLibrary(
  query: string,
  limit = 12
): Promise<ImageLibraryResult[]> {
  const primary = buildImageSearchQuery(query);
  let results = await searchAllSources(primary, limit);

  if (results.length === 0) {
    const fallback = buildImageSearchFallbackQuery(query);
    if (fallback !== primary) {
      results = await searchAllSources(fallback, limit);
    }
  }

  return results;
}
