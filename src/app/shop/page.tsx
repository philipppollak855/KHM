"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/shop/ProductCard";
import type { Category, Product } from "@/lib/types";
import { getActiveCategories, getActiveProducts } from "@/lib/firestore";
import PageHeader from "@/components/layout/PageHeader";

export default function ShopPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cats, prods] = await Promise.all([
          getActiveCategories(),
          getActiveProducts(),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        console.error("Fehler beim Laden:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader label="Kollektion" title="Unser Shop" description="Handgemachte Unikate aus dem Schneebergland — alle Preise inkl. USt." />

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory
                ? "bg-forest text-cream"
                : "bg-wood/10 text-wood-dark hover:bg-wood/20"
            }`}
          >
            Alle
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? "bg-forest text-cream"
                  : "bg-wood/10 text-wood-dark hover:bg-wood/20"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-cream-dark/50 rounded-2xl aspect-square animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">🌲</span>
          <h2 className="font-display text-2xl font-semibold text-wood-dark mb-2">
            Noch keine Produkte
          </h2>
          <p className="text-wood/60">
            Bald finden Sie hier unsere handgemachten Schätze.
          </p>
        </div>
      )}
    </div>
  );
}
