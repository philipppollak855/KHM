"use client";

import Link from "next/link";
import { ShoppingBag, Leaf } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/firestore";
import { useCart } from "@/context/CartContext";
import {
  formatProductPriceRange,
  getProductListStock,
  productHasVariants,
} from "@/lib/product-variants";
import Button from "@/components/ui/Button";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const hasVariants = productHasVariants(product);
  const stock = getProductListStock(product);
  const priceRange = formatProductPriceRange(product);

  const handleAdd = () => {
    if (hasVariants) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      taxRate: product.taxRate ?? 20,
      imageUrl: product.imageUrl,
      maxStock: product.stock,
    });
  };

  return (
    <div className="group bg-linen overflow-hidden border border-wood/10 hover:border-forest/20 transition-all duration-300">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-square bg-wood/5 overflow-hidden">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-linen-dark to-cream-dark">
              <Leaf className="w-12 h-12 text-forest/30" strokeWidth={1} />
            </div>
          )}
          {product.featured && (
            <span className="absolute top-3 left-3 bg-wheat text-wood-dark text-xs font-bold px-3 py-1 rounded-full">
              Empfehlung
            </span>
          )}
          {hasVariants && (
            <span className="absolute top-3 right-3 bg-wood-dark/70 text-linen text-[10px] tracking-wider uppercase px-2.5 py-1">
              Varianten
            </span>
          )}
        </div>
      </Link>

      <div className="p-5">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-display text-lg font-light text-wood-dark mb-1 hover:text-forest transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-stone mb-1 line-clamp-2">{product.description}</p>
        <p className="text-xs text-stone/70 mb-3">inkl. {product.taxRate ?? 20} % USt.</p>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xl font-bold text-forest">
            {priceRange.hasRange
              ? `ab ${formatPrice(priceRange.min)}`
              : formatPrice(priceRange.min)}
          </span>
          {hasVariants ? (
            <Link href={`/shop/${product.slug}`}>
              <Button size="sm" variant="outline">
                Auswählen
              </Button>
            </Link>
          ) : (
            <Button size="sm" onClick={handleAdd} disabled={stock <= 0}>
              <ShoppingBag className="w-4 h-4" />
              {stock > 0 ? "Hinzufügen" : "Ausverkauft"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
