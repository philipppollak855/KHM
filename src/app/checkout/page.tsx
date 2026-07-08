"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createOrder, formatPrice } from "@/lib/firestore";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const shipping = totalPrice > 50 ? 0 : 4.9;
  const total = totalPrice + shipping;

  const [form, setForm] = useState({
    name: "",
    street: "",
    zip: "",
    city: "",
    notes: "",
  });

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.displayName || "",
        street: user.address?.street || "",
        zip: user.address?.zip || "",
        city: user.address?.city || "",
      }));
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-wood/60">Laden...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-wood-dark mb-4">
          Anmeldung erforderlich
        </h1>
        <p className="text-wood/60 mb-8">
          Bitte melden Sie sich an, um Ihre Bestellung abzuschließen.
        </p>
        <Link href="/login?redirect=/checkout">
          <Button>Anmelden</Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    router.push("/warenkorb");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createOrder({
        userId: user.id,
        customerName: form.name,
        customerEmail: user.email,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        subtotal: totalPrice,
        shipping,
        total,
        shippingAddress: {
          street: form.street,
          city: form.city,
          zip: form.zip,
          country: "Österreich",
        },
        notes: form.notes || undefined,
      });
      clearCart();
      router.push("/konto/bestellungen?success=1");
    } catch {
      setError("Bestellung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl font-bold text-wood-dark mb-8">
        Kasse
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-wood-dark mb-4">
            Lieferadresse
          </h2>
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Straße & Hausnummer"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="PLZ"
              value={form.zip}
              onChange={(e) => setForm({ ...form, zip: e.target.value })}
              required
            />
            <Input
              label="Ort"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
          </div>
          <Textarea
            label="Anmerkungen (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Wird bestellt..." : `Bestellen · ${formatPrice(total)}`}
          </Button>
        </form>

        <div className="bg-cream-dark/50 rounded-xl p-6 border border-wood/10 h-fit">
          <h2 className="font-display text-xl font-semibold text-wood-dark mb-4">
            Bestellübersicht
          </h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-wood/70">
                  {item.quantity}× {item.name}
                </span>
                <span className="font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-wood/10 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-wood/70">
              <span>Zwischensumme</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm text-wood/70">
              <span>Versand</span>
              <span>{shipping === 0 ? "Kostenlos" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-wood-dark pt-2">
              <span>Gesamt</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
