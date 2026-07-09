"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, Leaf } from "lucide-react";
import Image from "next/image";
import { useCart, getCartItemLineKey } from "@/context/CartContext";
import { useOrderCalculation } from "@/hooks/useOrderCalculation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/layout/PageHeader";
import OrderSummary from "@/components/shop/OrderSummary";
import { formatPrice } from "@/lib/firestore";
import { COUNTRIES } from "@/lib/shipping";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const [country, setCountry] = useState("Österreich");
  const [zip, setZip] = useState("");

  const { totals, loading } = useOrderCalculation(items, country, zip);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <PageHeader title="Ihr Warenkorb ist leer" description="Entdecken Sie unsere handgemachte Kollektion." />
        <Link href="/shop">
          <Button>Zur Kollektion</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader label="Shop" title="Warenkorb" />

      <div className="space-y-4 mb-10">
        {items.map((item) => {
          const lineKey = getCartItemLineKey(item);
          const displayName = item.variantName
            ? `${item.name} – ${item.variantName}`
            : item.name;

          return (
          <div
            key={lineKey}
            className="flex items-center gap-4 p-5 bg-linen border border-wood/10"
          >
            <div className="relative w-16 h-16 bg-linen-dark flex items-center justify-center shrink-0 overflow-hidden">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                  unoptimized={item.imageUrl.includes("firebasestorage")}
                />
              ) : (
                <Leaf className="w-6 h-6 text-forest/40" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg font-light text-wood-dark truncate">
                {displayName}
              </h3>
              <p className="text-sm text-stone">
                {formatPrice(item.price)} · inkl. {item.taxRate ?? 20} % USt.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(lineKey, item.quantity - 1)} className="p-1 hover:bg-wood/10">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(lineKey, item.quantity + 1)} className="p-1 hover:bg-wood/10">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="font-medium text-wood-dark w-20 text-right">
              {formatPrice(item.price * item.quantity)}
            </p>
            <button onClick={() => removeItem(lineKey)} className="p-2 text-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )})}
      </div>

      <div className="bg-linen-dark/40 border border-wood/10 p-6">
        <p className="text-sm font-medium text-wood-dark mb-3">Versandvorschau</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input label="PLZ" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="z. B. 2734" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-wood-dark">Land</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-lg border-2 border-wood/20 bg-linen px-4 py-2.5"
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
        {!loading && <OrderSummary totals={totals} showFreeShippingHint freeFrom={50} />}
        <p className="text-xs text-stone mt-4 mb-6">
          Endgültiger Versand wird an der Kasse nach PLZ und Region berechnet.
        </p>
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
