"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
  aspectClassName?: string;
  showDots?: boolean;
  priority?: boolean;
}

export default function ProductImageGallery({
  images,
  alt,
  aspectClassName = "aspect-square",
  showDots = true,
  priority = false,
}: ProductImageGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const galleryImages = images.length > 0 ? images : [];

  useEffect(() => {
    setActiveIndex(0);
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [images.join("|")]);

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current;
    if (!container || galleryImages.length === 0) return;
    const width = container.clientWidth;
    container.scrollTo({ left: width * index, behavior: "smooth" });
    setActiveIndex(index);
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container || galleryImages.length === 0) return;
    const width = container.clientWidth || 1;
    const index = Math.round(container.scrollLeft / width);
    setActiveIndex(Math.max(0, Math.min(index, galleryImages.length - 1)));
  };

  if (galleryImages.length === 0) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-linen-dark to-cream-dark ${aspectClassName}`}
      />
    );
  }

  return (
    <div className={`relative overflow-hidden group ${aspectClassName}`}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth scrollbar-none touch-pan-x"
      >
        {galleryImages.map((src, index) => (
          <div key={`${src}-${index}`} className="relative h-full w-full shrink-0 snap-center">
            <Image
              src={src}
              alt={`${alt} – Bild ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={priority && index === 0}
              unoptimized={src.includes("firebasestorage")}
            />
          </div>
        ))}
      </div>

      {galleryImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-wood-dark/45 p-2 text-linen opacity-0 transition-opacity group-hover:opacity-100 hover:bg-wood-dark/65"
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              scrollToIndex(Math.min(galleryImages.length - 1, activeIndex + 1))
            }
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-wood-dark/45 p-2 text-linen opacity-0 transition-opacity group-hover:opacity-100 hover:bg-wood-dark/65"
            aria-label="Nächstes Bild"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {showDots && (
            <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
              {galleryImages.map((src, index) => (
                <button
                  key={`dot-${src}-${index}`}
                  type="button"
                  onClick={() => scrollToIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeIndex
                      ? "w-5 bg-linen"
                      : "w-1.5 bg-linen/50 hover:bg-linen/80"
                  }`}
                  aria-label={`Bild ${index + 1}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
