"use client";

import Image from "next/image";
import { ShoppingBag, Leaf } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/firestore";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      taxRate: product.taxRate ?? 20,
      imageUrl: product.imageUrl,
    });
  };

  return (
    <div className="group bg-linen overflow-hidden border border-wood/10 hover:border-forest/20 transition-all duration-300">
      <div className="relative aspect-square bg-wood/5 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
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
      </div>

      <div className="p-5">
        <h3 className="font-display text-lg font-light text-wood-dark mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-stone mb-1 line-clamp-2">{product.description}</p>
        <p className="text-xs text-stone/70 mb-3">inkl. {product.taxRate ?? 20} % USt.</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-forest">
            {formatPrice(product.price)}
          </span>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={product.stock <= 0}
          >
            <ShoppingBag className="w-4 h-4" />
            {product.stock > 0 ? "Hinzufügen" : "Ausverkauft"}
          </Button>
        </div>
      </div>
    </div>
  );
}
