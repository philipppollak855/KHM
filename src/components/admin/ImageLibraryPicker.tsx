"use client";

import { useCallback, useEffect, useState } from "react";
import { ImageIcon, Loader2, Search } from "lucide-react";
import { auth } from "@/lib/firebase";
import type { ImageLibraryResult } from "@/lib/image-library";
import { buildImageSearchQuery } from "@/lib/image-library";

interface ImageLibraryPickerProps {
  initialQuery: string;
  onSelect: (url: string) => void;
}

export default function ImageLibraryPicker({
  initialQuery,
  onSelect,
}: ImageLibraryPickerProps) {
  const [query, setQuery] = useState(buildImageSearchQuery(initialQuery));
  const [results, setResults] = useState<ImageLibraryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setError("Bitte einen Suchbegriff eingeben.");
      setResults([]);
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Nicht angemeldet.");

      const params = new URLSearchParams({ q: trimmed });
      const res = await fetch(`/api/admin/image-search?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || "Bildersuche fehlgeschlagen.");
      }

      setResults((payload.results as ImageLibraryResult[]) || []);
      if (payload.query) setQuery(payload.query);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bildersuche fehlgeschlagen.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const nextQuery = buildImageSearchQuery(initialQuery);
    setQuery(nextQuery);
    if (nextQuery.trim()) {
      void search(nextQuery);
    }
  }, [initialQuery, search]);

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void search(query);
  };

  return (
    <div className="rounded-xl border border-wood/15 bg-linen/50 p-3 sm:p-4 space-y-3">
      <div className="flex items-start gap-2">
        <ImageIcon className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-wood-dark">Internet-Bibliothek</p>
          <p className="text-xs text-stone mt-0.5">
            Lizenzfreie Bilder von Openverse, Wikimedia &amp; Unsplash – per Link eingefügt.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              void search(query);
            }
          }}
          placeholder="Suchbegriff…"
          className="min-w-0 flex-1 rounded-lg border-2 border-wood/20 bg-cream px-3 py-2 text-sm text-wood-dark"
        />
        <button
          type="button"
          disabled={loading}
          onClick={handleSearchClick}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-forest px-3 py-2 text-sm text-cream disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Suchen
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {searched && !loading && !error && results.length === 0 && (
        <p className="text-sm text-stone">Keine passenden Bilder gefunden.</p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect(item.url);
              }}
              className="group overflow-hidden rounded-lg border border-wood/15 bg-cream text-left hover:border-forest hover:ring-2 hover:ring-forest/20"
            >
              <div className="relative aspect-square overflow-hidden bg-wood/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnail}
                  alt={item.alt}
                  className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>
              <p className="line-clamp-2 px-2 py-1.5 text-[10px] text-stone">
                {item.attribution}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
