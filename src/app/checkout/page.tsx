"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QrCode, Landmark } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createOrder, createGuestOrder, formatPrice } from "@/lib/firestore";
import { useOrderCalculation } from "@/hooks/useOrderCalculation";
import { COUNTRIES } from "@/lib/shipping";
import { saveGuestOrderConfirmation } from "@/lib/guest-order";
import type { PaymentMethod } from "@/lib/types";
import { useSiteContent } from "@/context/SiteContentContext";
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
  const [acceptedAgb, setAcceptedAgb] = useState(false);
  const [acceptedWithdrawal, setAcceptedWithdrawal] = useState(false);
  const { content } = useSiteContent();
  const { checkout: checkoutLegal } = content.legal;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qr_transfer");

  const [form, setForm] = useState({
    name: "",
    email: "",
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
      setPaymentMethod("bank_transfer");
      setForm((f) => ({
        ...f,
        name: user.displayName || f.name,
        email: user.email || f.email,
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

  if (items.length === 0) {
    router.push("/warenkorb");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedAgb || !acceptedWithdrawal) {
      setError(checkoutLegal.errorMessage);
      return;
    }
    setSubmitting(true);
    setError("");

    const shippingAddress = {
      street: form.street,
      city: form.city,
      zip: form.zip,
      country: form.country,
    };

    try {
      if (user) {
        const result = await createOrder({
          userId: user.id,
          customerName: form.name,
          customerEmail: user.email,
          cartItems: items,
          shipping: totals.shipping,
          shippingAddress,
          notes: form.notes || undefined,
          distanceKm: distanceKm || undefined,
          paymentMethod,
        });
        clearCart();
        if (paymentMethod === "qr_transfer") {
          saveGuestOrderConfirmation({
            orderNumber: result.orderNumber,
            invoiceNumber: result.invoiceNumber,
            total: result.total,
            email: user.email,
            customerName: form.name,
            paymentMethod: "qr_transfer",
          });
          router.push("/checkout/erfolg");
          return;
        }
        router.push(
          `/konto/bestellungen?success=1&orderId=${result.orderId}&orderNumber=${result.orderNumber}`
        );
        return;
      }

      const result = await createGuestOrder({
        customerName: form.name,
        customerEmail: form.email.trim(),
        cartItems: items,
        shipping: totals.shipping,
        shippingAddress,
        notes: form.notes || undefined,
        distanceKm: distanceKm || undefined,
        paymentMethod: "qr_transfer",
      });

      saveGuestOrderConfirmation({
        orderNumber: result.orderNumber,
        invoiceNumber: result.invoiceNumber,
        total: result.total,
        email: form.email.trim(),
        customerName: form.name,
        paymentMethod: "qr_transfer",
      });
      clearCart();
      router.push("/checkout/erfolg");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Bestellung fehlgeschlagen. Bitte versuchen Sie es erneut."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader
        label="Bestellung"
        title="Kasse"
        description={
          user
            ? "Wählen Sie Überweisung oder QR-Code zur Zahlung."
            : "Als Gast bestellen – Zahlung per QR-Code."
        }
      />

      {!user && (
        <div className="mb-8 rounded-xl border border-wood/15 bg-linen/60 p-4 text-sm text-wood-dark">
          <p>
            Sie können ohne Konto bestellen. Alternativ{" "}
            <Link href="/login?redirect=/checkout" className="text-forest hover:underline">
              anmelden
            </Link>{" "}
            oder{" "}
            <Link href="/register?redirect=/checkout" className="text-forest hover:underline">
              registrieren
            </Link>
            .
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="font-display text-xl font-light text-wood-dark mb-2">
            Lieferadresse
          </h2>
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="E-Mail"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            disabled={Boolean(user?.email)}
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
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-wood-dark">Land</label>
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full rounded-lg border-2 border-wood/20 bg-linen px-4 py-2.5"
              required
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
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
          <Textarea
            label="Anmerkungen (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <div className="space-y-3">
            <h2 className="font-display text-xl font-light text-wood-dark">
              Zahlungsart
            </h2>
            {user ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(
                  [
                    { id: "bank_transfer" as const, label: "Überweisung", icon: Landmark },
                    { id: "qr_transfer" as const, label: "QR-Code", icon: QrCode },
                  ] as const
                ).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition-colors ${
                      paymentMethod === id
                        ? "border-forest bg-forest/5 text-wood-dark"
                        : "border-wood/15 bg-white text-stone hover:border-wood/30"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0 text-forest" strokeWidth={1.5} />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-forest/20 bg-forest/5 px-4 py-3 text-sm text-wood-dark flex items-center gap-3">
                <QrCode className="h-5 w-5 text-forest shrink-0" strokeWidth={1.5} />
                <div>
                  <strong>QR-Code</strong>
                  <span className="block text-stone mt-0.5 text-xs">
                    Nach der Bestellung erhalten Sie einen SEPA-QR zum einfachen Bezahlen.
                  </span>
                </div>
              </div>
            )}
            {user && paymentMethod === "bank_transfer" && (
              <p className="text-xs text-stone">
                Rechnung per E-Mail – Zahlung per Überweisung mit Verwendungszweck.
              </p>
            )}
            {paymentMethod === "qr_transfer" && user && (
              <p className="text-xs text-stone">
                Nach der Bestellung wird ein QR-Code mit Betrag und Verwendungszweck angezeigt.
              </p>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-wood/10 bg-linen/50 p-4 text-sm">
            <label className="flex gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedAgb}
                onChange={(e) => setAcceptedAgb(e.target.checked)}
                className="mt-1"
                required
              />
              <span className="text-stone">
                {checkoutLegal.agbLabel}{" "}
                <Link href="/agb" className="text-forest hover:underline" target="_blank">
                  AGB
                </Link>
                {" · "}
                <Link href="/widerruf" className="text-forest hover:underline" target="_blank">
                  Widerruf
                </Link>
              </span>
            </label>
            <label className="flex gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedWithdrawal}
                onChange={(e) => setAcceptedWithdrawal(e.target.checked)}
                className="mt-1"
                required
              />
              <span className="text-stone">{checkoutLegal.withdrawalLabel}</span>
            </label>
            <p className="text-xs text-stone">
              {checkoutLegal.privacyNote}{" "}
              <Link href="/datenschutz" className="text-forest hover:underline" target="_blank">
                Datenschutzerklärung
              </Link>
            </p>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting || calcLoading}
          >
            {submitting
              ? "Wird bestellt..."
              : `Bestellung abschicken · ${formatPrice(totals.total)}`}
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
