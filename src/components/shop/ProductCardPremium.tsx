"use client";

import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/firestore";
import { useCart } from "@/context/CartContext";

interface ProductCardPremiumProps {
  product: Product;
}

export default function ProductCardPremium({ product }: ProductCardPremiumProps) {
  const { addItem } = useCart();

  const handleAdd = () => {
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
    <article className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-linen-dark mb-5">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-linen-dark to-cream-dark" />
        )}
        <div className="absolute inset-0 bg-wood-dark/0 group-hover:bg-wood-dark/10 transition-colors duration-500" />
        {product.featured && (
          <span className="absolute top-4 left-4 text-[10px] tracking-[0.25em] uppercase text-linen bg-wood-dark/70 backdrop-blur-sm px-3 py-1.5">
            Empfehlung
          </span>
        )}
        <button
          onClick={handleAdd}
          disabled={product.stock <= 0}
          className="absolute bottom-4 right-4 w-11 h-11 bg-linen text-wood-dark flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-wheat hover:text-linen disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="In den Warenkorb"
        >
          <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-xl font-light text-wood-dark group-hover:text-forest transition-colors">
          {product.name}
        </h3>
        <p className="text-stone text-sm leading-relaxed line-clamp-2">
          {product.description}
        </p>
        <p className="font-display text-lg text-bark pt-1">
          {formatPrice(product.price)}
        </p>
      </div>
    </article>
  );
}
