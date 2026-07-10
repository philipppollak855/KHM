import type { Product } from "@/lib/types";
import type { HomePageContent } from "@/lib/site-content";
import ProductCardPremium from "@/components/shop/ProductCardPremium";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  products: Product[];
  content: HomePageContent["featured"];
}

export default function FeaturedSection({ products, content }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="py-28 md:py-36 bg-linen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <p className="section-label text-bark mb-4">{content.label}</p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-wood-dark">
              {content.title}
            </h2>
          </div>
          <Link
            href={content.cta.href}
            className="inline-flex items-center gap-2 text-sm tracking-wider uppercase text-forest hover:text-forest-light transition-colors border-b border-forest/20 pb-1 hover:border-forest/50"
          >
            {content.cta.label}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
          {products.map((product) => (
            <ProductCardPremium key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
