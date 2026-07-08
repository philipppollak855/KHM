"use client";

import Image from "next/image";
import { ShoppingBag } from "lucide-react";
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
      imageUrl: product.imageUrl,
    });
  };

  return (
    <div className="group bg-cream rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-wood/10">
      <div className="relative aspect-square bg-wood/5 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-wood/10 to-forest/10">
            <span className="text-6xl">🌲</span>
          </div>
        )}
        {product.featured && (
          <span className="absolute top-3 left-3 bg-wheat text-wood-dark text-xs font-bold px-3 py-1 rounded-full">
            Empfehlung
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-wood-dark mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-wood/60 mb-3 line-clamp-2">
          {product.description}
        </p>
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
