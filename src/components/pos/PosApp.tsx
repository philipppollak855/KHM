"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import PosDashboardLink from "@/components/pos/PosDashboardLink";
import { usePosUrlNavigation } from "@/hooks/usePosUrlNavigation";
import { useIsStandalonePwa } from "@/hooks/useIsStandalonePwa";
import CompanyLogo from "@/components/branding/CompanyLogo";
import {
  ShoppingCart,
  User,
  Search,
  Minus,
  Plus,
  X,
  Banknote,
  CreditCard,
  Printer,
  Mail,
  CheckCircle2,
  ArrowLeft,
  Package,
  Landmark,
} from "lucide-react";
import { getActiveCategories, getActiveProducts, formatPrice } from "@/lib/firestore";
import { calculateOrderTotals } from "@/lib/pricing";
import { printInvoicePdf } from "@/lib/documents/download";
import {
  searchPosCustomers,
  createPosCustomer,
  completePosSale,
  sendPosInvoiceEmail,
} from "@/lib/pos-api";
import type { Category, Product, PosCartItem, PosCustomer, PaymentMethod } from "@/lib/types";
import type { Address } from "@/lib/types";
import { POS_WALK_IN_UI_LABEL } from "@/lib/customer-display";

type View = "catalog" | "checkout" | "card_pending" | "success";

function getPosCustomerLabel(customer: PosCustomer) {
  if (customer.name?.trim()) return customer.name.trim();
  if (customer.isWalkIn || !customer.id) return POS_WALK_IN_UI_LABEL;
  return customer.email || POS_WALK_IN_UI_LABEL;
}

const walkInCustomer = (): PosCustomer => ({
  id: null,
  name: "",
  email: "",
  isWalkIn: true,
});

export default function PosApp() {
  const { view, cartOpen, customerOpen, setView, setCartOpen, setCustomerOpen } =
    usePosUrlNavigation();
  const isPwa = useIsStandalonePwa();
  const prevViewRef = useRef(view);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | "all">("all");
  const [productSearch, setProductSearch] = useState("");
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [customer, setCustomer] = useState<PosCustomer>(walkInCustomer());
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<
    Array<{ id: string; name: string; email: string; address: Address | null }>
  >([]);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    street: "",
    city: "",
    zip: "",
    country: "Österreich",
    createAccount: false,
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [linkToAccount, setLinkToAccount] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [saleResult, setSaleResult] = useState<{
    orderId: string;
    orderNumber: string;
    invoiceId: string;
    invoiceNumber: string;
    total: number;
    paymentStatus: "paid" | "pending";
    paymentMethod: PaymentMethod;
  } | null>(null);
  const [cardReference, setCardReference] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [printStatus, setPrintStatus] = useState("");
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  useEffect(() => {
    if (prevViewRef.current === "success" && view !== "success") {
      setSaleResult(null);
      setTempPassword(null);
      setEmailStatus("");
      setCardReference("");
    }
    prevViewRef.current = view;
  }, [view]);

  useEffect(() => {
    setCatalogLoading(true);
    Promise.all([getActiveProducts(), getActiveCategories()])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
        setCatalogError("");
      })
      .catch(() => setCatalogError("Produkte konnten nicht geladen werden."))
      .finally(() => setCatalogLoading(false));
  }, []);

  useEffect(() => {
    if (!customerOpen) return;
    const t = setTimeout(() => {
      searchPosCustomers(customerSearch)
        .then(setCustomerResults)
        .catch(() => setCustomerResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [customerSearch, customerOpen]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryId !== "all" && p.categoryId !== categoryId) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [products, categoryId, productSearch]);

  const cartItems = cart.map((c) => ({
    productId: c.productId,
    name: c.name,
    price: c.price,
    quantity: c.quantity,
    taxRate: c.taxRate,
    imageUrl: c.imageUrl,
  }));

  const totals = calculateOrderTotals(cartItems, 0);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        const next = Math.min(existing.quantity + 1, product.stock);
        if (next <= existing.quantity) return prev;
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: next, maxStock: product.stock } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          taxRate: product.taxRate ?? 20,
          imageUrl: product.imageUrl,
          maxStock: product.stock,
        },
      ];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.productId !== productId) return i;
          const next = Math.min(Math.max(1, i.quantity + delta), i.maxStock);
          return { ...i, quantity: next };
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const handleCreateCustomer = async () => {
    setError("");
    try {
      const result = await createPosCustomer({
        name: newCustomer.name,
        email: newCustomer.email || undefined,
        createAccount: newCustomer.createAccount && !!newCustomer.email,
        address:
          newCustomer.street || newCustomer.city
            ? {
                street: newCustomer.street,
                city: newCustomer.city,
                zip: newCustomer.zip,
                country: newCustomer.country,
              }
            : undefined,
      });
      setCustomer({
        id: result.id,
        name: result.name,
        email: result.email || "",
        address: result.address,
        isWalkIn: result.isWalkIn,
        isNewAccount: result.isNewAccount,
      });
      setCustomerOpen(false);
      if (result.tempPassword) {
        alert(`Kundenkonto erstellt. Temporäres Passwort: ${result.tempPassword}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Anlegen");
    }
  };

  const canUseBankTransfer = Boolean(customer.id && !customer.isWalkIn);

  const finalizeSale = async (method: PaymentMethod, reference?: string) => {
    let saleCustomer = customer;
    if (linkToAccount && customer.isWalkIn && newCustomer.name) {
      const created = await createPosCustomer({
        name: newCustomer.name || customer.name,
        email: newCustomer.email || undefined,
        createAccount: newCustomer.createAccount && !!newCustomer.email,
        address:
          newCustomer.street || newCustomer.city
            ? {
                street: newCustomer.street,
                city: newCustomer.city,
                zip: newCustomer.zip,
                country: newCustomer.country,
              }
            : customer.address,
      });
      saleCustomer = {
        id: created.id,
        name: created.name,
        email: created.email || "",
        address: created.address,
        isWalkIn: created.isWalkIn,
      };
      if (created.tempPassword) setTempPassword(created.tempPassword);
    }

    if (method === "bank_transfer" && (!saleCustomer.id || saleCustomer.isWalkIn)) {
      throw new Error("Überweisung ist nur mit Kundenkonto möglich.");
    }

    const result = await completePosSale({
      customer: saleCustomer,
      cartItems,
      paymentMethod: method,
      cardReference: reference,
    });
    setSaleResult(result);
    setCustomer(saleCustomer);
    setCart([]);
    setView("success");
    getActiveProducts().then(setProducts).catch(console.error);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === "bank_transfer" && !canUseBankTransfer && !linkToAccount) {
      setError("Überweisung erfordert ein Kundenkonto.");
      return;
    }
    if (paymentMethod === "card") {
      setView("card_pending");
      return;
    }
    setProcessing(true);
    setError("");
    try {
      await finalizeSale(paymentMethod);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verkauf fehlgeschlagen");
    } finally {
      setProcessing(false);
    }
  };

  const handleCardConfirm = async () => {
    setProcessing(true);
    setError("");
    try {
      await finalizeSale("card", cardReference || undefined);
      setCardReference("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verkauf fehlgeschlagen");
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = async () => {
    if (!saleResult) return;
    setPrintStatus("Druck wird vorbereitet…");
    try {
      await printInvoicePdf(saleResult.invoiceId);
      setPrintStatus("Druckdialog geöffnet.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Drucken fehlgeschlagen";
      setPrintStatus(message);
    }
  };

  const handleEmail = async () => {
    if (!saleResult || !customer.email) return;
    setEmailStatus("Wird gesendet…");
    try {
      await sendPosInvoiceEmail(saleResult.invoiceId, customer.email);
      setEmailStatus("Rechnung per E-Mail gesendet.");
    } catch (err) {
      setEmailStatus(err instanceof Error ? err.message : "E-Mail fehlgeschlagen");
    }
  };

  const resetSale = () => {
    setSaleResult(null);
    setCustomer(walkInCustomer());
    setPaymentMethod("cash");
    setLinkToAccount(false);
    setCardReference("");
    setEmailStatus("");
    setPrintStatus("");
    setTempPassword(null);
    setView("catalog");
  };

  if (view === "success" && saleResult) {
    const isPending = saleResult.paymentStatus === "pending";
    const isCard = saleResult.paymentMethod === "card";
    return (
      <div className="min-h-dvh flex flex-col p-6 bg-gradient-to-b from-forest to-wood-dark">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-16 h-16 text-wheat mb-4" strokeWidth={1.5} />
          <h1 className="font-display text-3xl font-light mb-2">
            {isPending ? "Verkauf verbucht" : "Verkauf abgeschlossen"}
          </h1>
          <p className="text-linen/70 mb-1">{saleResult.orderNumber}</p>
          <p className="text-2xl font-display text-wheat mb-4">
            {formatPrice(saleResult.total)}
          </p>
          {isPending && (
            <p className="text-sm text-linen/70 mb-8 max-w-sm">
              Rechnung auf Kundenkonto – Zahlung per Überweisung offen.
              Bestätigung erfolgt nach Zahlungseingang im Admin.
            </p>
          )}
          {tempPassword && (
            <p className="text-sm text-wheat/90 mb-4 p-3 bg-black/20 rounded max-w-sm">
              Kundenkonto erstellt. Temporäres Passwort: <strong>{tempPassword}</strong>
            </p>
          )}
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-linen text-wood-dark font-medium"
            >
              <Printer className="w-5 h-5" />
              {isCard ? "Kartenbeleg drucken" : "Rechnung drucken"}
            </button>
            {printStatus && (
              <p className="text-sm text-linen/70">{printStatus}</p>
            )}
            {customer.email && (
              <button
                onClick={handleEmail}
                className="flex items-center justify-center gap-2 w-full py-3.5 border border-linen/30 text-linen"
              >
                <Mail className="w-5 h-5" />
                Per E-Mail senden
              </button>
            )}
            {emailStatus && (
              <p className="text-sm text-linen/70">{emailStatus}</p>
            )}
            <button
              onClick={resetSale}
              className="w-full py-3.5 mt-4 bg-forest text-linen font-medium"
            >
              Neuer Verkauf
            </button>
            {!isPwa && (
              <PosDashboardLink className="w-full border-linen/30 justify-center py-3.5" />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === "card_pending") {
    return (
      <div className="min-h-dvh flex flex-col bg-linen text-wood-dark">
        <header className="flex items-center gap-3 p-4 border-b border-wood/10 bg-wood-dark text-linen">
          <button onClick={() => setView("checkout")} className="p-2" aria-label="Zurück">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-light flex-1 min-w-0">Kartenzahlung (SumUp)</h1>
          {!isPwa && <PosDashboardLink compact />}
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <CreditCard className="w-16 h-16 text-forest mb-6" strokeWidth={1.5} />
          <p className="text-3xl font-display text-forest mb-2">{formatPrice(totals.total)}</p>
          <p className="text-stone mb-8 max-w-sm">
            Bitte den Betrag am SumUp-Terminal durchführen. Danach Zahlung bestätigen und Beleg drucken.
          </p>
          <input
            placeholder="SumUp-Referenz (optional)"
            value={cardReference}
            onChange={(e) => setCardReference(e.target.value)}
            className="w-full max-w-sm border border-wood/20 rounded-lg px-4 py-3 text-sm mb-4"
          />
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <button
            onClick={handleCardConfirm}
            disabled={processing}
            className="w-full max-w-sm py-4 bg-forest text-linen font-medium text-lg disabled:opacity-50"
          >
            {processing ? "Wird verbucht…" : "Kartenzahlung bestätigt"}
          </button>
        </div>
      </div>
    );
  }

  if (view === "checkout") {
    return (
      <div className="min-h-dvh flex flex-col bg-linen text-wood-dark">
        <header className="flex items-center gap-3 p-4 border-b border-wood/10 bg-wood-dark text-linen">
          <button onClick={() => setView("catalog")} className="p-2" aria-label="Zurück">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-light flex-1 min-w-0">Kasse</h1>
          {!isPwa && <PosDashboardLink compact />}
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section className="bg-white border border-wood/10 p-4">
            <p className="text-xs uppercase tracking-wider text-stone mb-2">Kunde</p>
            <p className="font-medium">{getPosCustomerLabel(customer)}</p>
            {customer.email && <p className="text-sm text-stone">{customer.email}</p>}
            {customer.isWalkIn && (
              <label className="flex items-center gap-2 mt-3 text-sm">
                <input
                  type="checkbox"
                  checked={linkToAccount}
                  onChange={(e) => setLinkToAccount(e.target.checked)}
                />
                Auf Kundenkonto buchen / Kunde anlegen
              </label>
            )}
            {linkToAccount && customer.isWalkIn && (
              <div className="mt-3 space-y-2">
                <input
                  placeholder="Name *"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full border border-wood/20 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  placeholder="E-Mail (optional)"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full border border-wood/20 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  placeholder="Straße (optional)"
                  value={newCustomer.street}
                  onChange={(e) => setNewCustomer({ ...newCustomer, street: e.target.value })}
                  className="w-full border border-wood/20 rounded-lg px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="PLZ"
                    value={newCustomer.zip}
                    onChange={(e) => setNewCustomer({ ...newCustomer, zip: e.target.value })}
                    className="border border-wood/20 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Ort"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    className="border border-wood/20 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                {newCustomer.email && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={newCustomer.createAccount}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, createAccount: e.target.checked })
                      }
                    />
                    Kundenkonto erstellen
                  </label>
                )}
              </div>
            )}
          </section>

          <section>
            <p className="text-xs uppercase tracking-wider text-stone mb-3">Zahlungsart</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "cash" as const, label: "Bar", icon: Banknote },
                { id: "card" as const, label: "Karte", icon: CreditCard },
                { id: "bank_transfer" as const, label: "Überweisung", icon: Landmark },
              ].map(({ id, label, icon: Icon }) => {
                const disabled = id === "bank_transfer" && !canUseBankTransfer && !linkToAccount;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setPaymentMethod(id)}
                    className={`flex flex-col items-center gap-2 p-3 border-2 transition-colors ${
                      paymentMethod === id
                        ? "border-forest bg-forest/5"
                        : "border-wood/15 bg-white"
                    } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <Icon className="w-5 h-5 text-forest" />
                    <span className="text-xs font-medium text-center">{label}</span>
                  </button>
                );
              })}
            </div>
            {paymentMethod === "bank_transfer" && (
              <p className="text-xs text-stone mt-2">
                Rechnung wird dem Kundenkonto gutgeschrieben. Zahlung manuell bestätigen.
              </p>
            )}
          </section>

          <section className="bg-white border border-wood/10 p-4 space-y-2">
            {cart.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span>{item.quantity}× {item.name}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-wood/10 pt-2 flex justify-between font-semibold text-lg">
              <span>Gesamt</span>
              <span className="text-forest">{formatPrice(totals.total)}</span>
            </div>
            <p className="text-xs text-stone">inkl. USt.</p>
          </section>

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        <div className="p-4 border-t border-wood/10 bg-white">
          <button
            onClick={handleCheckout}
            disabled={processing || cart.length === 0}
            className="w-full py-4 bg-forest text-linen font-medium text-lg disabled:opacity-50"
          >
            {processing ? "Wird verbucht…" : `Bezahlen · ${formatPrice(totals.total)}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-30 bg-wood-dark/95 backdrop-blur border-b border-linen/10 px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1 flex items-center gap-3">
            <CompanyLogo variant="mark" size="sm" dark />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-linen/50">Kassa</p>
            <button
              onClick={() => setCustomerOpen(true)}
              className="flex items-center gap-2 text-linen text-sm mt-0.5 max-w-full"
            >
              <User className="w-4 h-4 text-wheat shrink-0" />
              <span className="truncate">{getPosCustomerLabel(customer)}</span>
            </button>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isPwa && <PosDashboardLink compact />}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 bg-forest px-4 py-2.5 text-linen text-sm font-medium"
            >
            <ShoppingCart className="w-4 h-4" />
            {formatPrice(totals.total)}
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-wheat text-wood-dark text-xs font-bold flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-linen/40" />
          <input
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Produkt suchen…"
            className="w-full bg-linen/10 border border-linen/15 rounded-lg pl-10 pr-4 py-2.5 text-sm text-linen placeholder:text-linen/40"
          />
        </div>
      </header>

      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setCategoryId("all")}
          className={`shrink-0 px-4 py-2 text-sm rounded-full border ${
            categoryId === "all"
              ? "bg-wheat text-wood-dark border-wheat"
              : "border-linen/20 text-linen/80"
          }`}
        >
          Alle
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryId(c.id)}
            className={`shrink-0 px-4 py-2 text-sm rounded-full border ${
              categoryId === c.id
                ? "bg-wheat text-wood-dark border-wheat"
                : "border-linen/20 text-linen/80"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-28">
        {catalogLoading ? (
          <div className="flex items-center justify-center py-20 text-linen/60 text-sm">
            Produkte werden geladen…
          </div>
        ) : catalogError ? (
          <div className="text-center py-20 px-4">
            <p className="text-red-300 text-sm mb-4">{catalogError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-forest text-linen text-sm"
            >
              Erneut laden
            </button>
          </div>
        ) : (
        <>
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.stock <= 0}
              className="text-left bg-linen text-wood-dark overflow-hidden border border-wood/10 disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              <div className="relative aspect-square bg-wood/5">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="50vw"
                    unoptimized={p.imageUrl.includes("firebasestorage")}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-forest/20" />
                  </div>
                )}
                {p.stock <= 3 && p.stock > 0 && (
                  <span className="absolute top-2 left-2 text-[10px] bg-amber-500 text-white px-2 py-0.5">
                    {p.stock} übrig
                  </span>
                )}
                {p.stock <= 0 && (
                  <span className="absolute inset-0 bg-wood-dark/50 flex items-center justify-center text-linen text-xs font-medium">
                    Ausverkauft
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium leading-tight line-clamp-2 mb-1">{p.name}</p>
                <p className="text-forest font-display text-lg">{formatPrice(p.price)}</p>
              </div>
            </button>
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <p className="text-center text-linen/50 py-12">Keine Produkte gefunden.</p>
        )}
        </>
        )}
      </div>

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-wood-dark/60" onClick={() => setCartOpen(false)} />
          <div className="relative bg-linen text-wood-dark rounded-t-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-wood/10">
              <h2 className="font-display text-xl">Warenkorb</h2>
              <button onClick={() => setCartOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 && (
                <p className="text-center text-stone py-8">Warenkorb ist leer.</p>
              )}
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-forest text-sm">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.productId, -1)}
                      className="p-1.5 border border-wood/20"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, 1)}
                      className="p-1.5 border border-wood/20"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      setCart((prev) => prev.filter((i) => i.productId !== item.productId))
                    }
                    className="p-1 text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-wood/10 space-y-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Gesamt</span>
                <span className="text-forest">{formatPrice(totals.total)}</span>
              </div>
              <button
                onClick={() => {
                  setCartOpen(false);
                  setView("checkout");
                }}
                disabled={cart.length === 0}
                className="w-full py-3.5 bg-forest text-linen font-medium disabled:opacity-50"
              >
                Zur Kasse
              </button>
            </div>
          </div>
        </div>
      )}

      {customerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-wood-dark/70" onClick={() => setCustomerOpen(false)} />
          <div className="relative w-full max-w-md bg-linen text-wood-dark rounded-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-wood/10">
              <h2 className="font-display text-xl">Kunde</h2>
              <button onClick={() => setCustomerOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <button
                onClick={() => {
                  setCustomer(walkInCustomer());
                  setCustomerOpen(false);
                }}
                className="w-full py-3 border-2 border-wood/15 text-left px-4"
              >
                <p className="font-medium">{POS_WALK_IN_UI_LABEL}</p>
                <p className="text-xs text-stone">Ohne Kundenkonto</p>
              </button>

              <div>
                <input
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Bestehenden Kunden suchen…"
                  className="w-full border border-wood/20 rounded-lg px-3 py-2.5 text-sm"
                />
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {customerResults.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCustomer({
                          id: c.id,
                          name: c.name,
                          email: c.email,
                          address: c.address || undefined,
                          isWalkIn: false,
                        });
                        setCustomerOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-wood/5 rounded-lg"
                    >
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-stone">{c.email}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-wood/10 pt-4">
                <p className="text-xs uppercase tracking-wider text-stone mb-3">Neuer Kunde</p>
                <div className="space-y-2">
                  <input
                    placeholder="Name *"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full border border-wood/20 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="E-Mail (optional)"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full border border-wood/20 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Straße (optional)"
                    value={newCustomer.street}
                    onChange={(e) => setNewCustomer({ ...newCustomer, street: e.target.value })}
                    className="w-full border border-wood/20 rounded-lg px-3 py-2 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="PLZ"
                      value={newCustomer.zip}
                      onChange={(e) => setNewCustomer({ ...newCustomer, zip: e.target.value })}
                      className="border border-wood/20 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="Ort"
                      value={newCustomer.city}
                      onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                      className="border border-wood/20 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  {newCustomer.email && (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newCustomer.createAccount}
                        onChange={(e) =>
                          setNewCustomer({ ...newCustomer, createAccount: e.target.checked })
                        }
                      />
                      Kundenkonto erstellen
                    </label>
                  )}
                  <button
                    onClick={handleCreateCustomer}
                    disabled={!newCustomer.name}
                    className="w-full py-3 bg-forest text-linen text-sm font-medium disabled:opacity-50"
                  >
                    Kunde übernehmen
                  </button>
                </div>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
