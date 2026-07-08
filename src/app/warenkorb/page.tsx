"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/firestore";
import Button from "@/components/ui/Button";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const shipping = totalPrice > 50 ? 0 : 4.9;
  const total = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl mb-4 block">🛒</span>
        <h1 className="font-display text-3xl font-bold text-wood-dark mb-4">
          Ihr Warenkorb ist leer
        </h1>
        <p className="text-wood/60 mb-8">
          Entdecken Sie unsere handgemachten Produkte im Shop.
        </p>
        <Link href="/shop">
          <Button>Zum Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl font-bold text-wood-dark mb-8">
        Warenkorb
      </h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 p-4 bg-cream rounded-xl border border-wood/10 shadow-sm"
          >
            <div className="w-16 h-16 rounded-lg bg-wood/10 flex items-center justify-center text-2xl shrink-0">
              {item.imageUrl ? "🖼️" : "🌲"}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-wood-dark truncate">
                {item.name}
              </h3>
              <p className="text-forest font-medium">
                {formatPrice(item.price)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateQuantity(item.productId, item.quantity - 1)
                }
                className="p-1 rounded hover:bg-wood/10"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  updateQuantity(item.productId, item.quantity + 1)
                }
                className="p-1 rounded hover:bg-wood/10"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="font-bold text-wood-dark w-20 text-right">
              {formatPrice(item.price * item.quantity)}
            </p>
            <button
              onClick={() => removeItem(item.productId)}
              className="p-2 rounded hover:bg-red-50 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-cream-dark/50 rounded-xl p-6 border border-wood/10">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-wood/70">
            <span>Zwischensumme</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-wood/70">
            <span>Versand</span>
            <span>
              {shipping === 0 ? "Kostenlos" : formatPrice(shipping)}
            </span>
          </div>
          {totalPrice < 50 && (
            <p className="text-xs text-moss">
              Noch {formatPrice(50 - totalPrice)} bis zum kostenlosen Versand
            </p>
          )}
          <div className="flex justify-between text-xl font-bold text-wood-dark pt-2 border-t border-wood/10">
            <span>Gesamt</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
        <Link href="/checkout">
          <Button size="lg" className="w-full">
            Zur Kasse
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
