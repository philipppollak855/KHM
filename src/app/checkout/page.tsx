"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createOrder, formatPrice } from "@/lib/firestore";
import { useOrderCalculation } from "@/hooks/useOrderCalculation";
import { COUNTRIES } from "@/lib/shipping";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/layout/PageHeader";
import OrderSummary from "@/components/shop/OrderSummary";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    street: "",
    zip: "",
    city: "",
    country: "Österreich",
    distanceKm: "",
    notes: "",
  });

  const distanceKm = parseFloat(form.distanceKm) || 0;
  const { totals, loading: calcLoading } = useOrderCalculation(
    items,
    form.country,
    form.zip,
    distanceKm
  );

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.displayName || f.name,
        street: user.address?.street || f.street,
        zip: user.address?.zip || f.zip,
        city: user.address?.city || f.city,
        country: user.address?.country || f.country || "Österreich",
      }));
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-stone">Laden...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <PageHeader title="Anmeldung erforderlich" description="Bitte melden Sie sich an, um Ihre Bestellung abzuschließen." />
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
      const result = await createOrder({
        userId: user.id,
        customerName: form.name,
        customerEmail: user.email,
        cartItems: items,
        shipping: totals.shipping,
        shippingAddress: {
          street: form.street,
          city: form.city,
          zip: form.zip,
          country: form.country,
        },
        notes: form.notes || undefined,
        distanceKm: distanceKm || undefined,
      });
      clearCart();
      router.push(
        `/konto/bestellungen?success=1&orderId=${result.orderId}&orderNumber=${result.orderNumber}`
      );
    } catch {
      setError("Bestellung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader label="Bestellung" title="Kasse" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="font-display text-xl font-light text-wood-dark mb-2">
            Lieferadresse
          </h2>
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Straße & Hausnummer" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="PLZ" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} required />
            <Input label="Ort" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-wood-dark">Land</label>
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full rounded-lg border-2 border-wood/20 bg-linen px-4 py-2.5"
              required
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <Input
            label="Entfernung (km, optional – für Zuschlag)"
            type="number"
            min="0"
            step="1"
            value={form.distanceKm}
            onChange={(e) => setForm({ ...form, distanceKm: e.target.value })}
            placeholder="z. B. 25"
          />
          <Textarea label="Anmerkungen (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={submitting || calcLoading}>
            {submitting ? "Wird bestellt..." : `Kostenpflichtig bestellen · ${formatPrice(totals.total)}`}
          </Button>
        </form>

        <div className="bg-linen-dark/40 border border-wood/10 p-6 h-fit">
          <h2 className="font-display text-xl font-light text-wood-dark mb-4">
            Bestellübersicht
          </h2>
          {!calcLoading && <OrderSummary totals={totals} />}
          {calcLoading && <p className="text-stone text-sm">Berechne Versand...</p>}
          <p className="text-xs text-stone mt-4">Alle Preise inkl. USt.</p>
        </div>
      </div>
    </div>
  );
}
