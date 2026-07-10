import Image from "next/image";
import type { ContentExtraBlock } from "@/lib/site-content";

export function AboutExtraBlocks({ blocks }: { blocks: ContentExtraBlock[] }) {
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-12 mb-16">
      {blocks.map((block) => {
        if (block.type === "text") {
          return (
            <div key={block.id} className="max-w-2xl mx-auto text-center">
              {block.title && (
                <h2 className="font-display text-2xl font-light text-wood-dark mb-4">
                  {block.title}
                </h2>
              )}
              {block.text && (
                <p className="text-stone leading-relaxed whitespace-pre-line">{block.text}</p>
              )}
            </div>
          );
        }

        if (block.type === "textImage") {
          return (
            <div
              key={block.id}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            >
              {block.imageUrl && (
                <div className="relative aspect-[4/3] overflow-hidden border border-wood/10">
                  <Image
                    src={block.imageUrl}
                    alt={block.imageAlt || block.title || "Bild"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                  />
                </div>
              )}
              <div>
                {block.title && (
                  <h2 className="font-display text-2xl font-light text-wood-dark mb-4">
                    {block.title}
                  </h2>
                )}
                {block.text && (
                  <p className="text-stone leading-relaxed whitespace-pre-line">{block.text}</p>
                )}
              </div>
            </div>
          );
        }

        if (block.type === "gallery" && block.images && block.images.length > 0) {
          return (
            <div key={block.id}>
              {block.title && (
                <h2 className="font-display text-2xl font-light text-wood-dark mb-6 text-center">
                  {block.title}
                </h2>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {block.images.map((url, i) => (
                  <div
                    key={`${block.id}-${i}`}
                    className="relative aspect-square overflow-hidden border border-wood/10"
                  >
                    <Image
                      src={url}
                      alt={`${block.title || "Galerie"} ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

export function AboutGallery({ images }: { images: string[] }) {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
      {images.map((url, i) => (
        <div
          key={`${url}-${i}`}
          className="relative aspect-square overflow-hidden border border-wood/10"
        >
          <Image
            src={url}
            alt={`Galeriebild ${i + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}
