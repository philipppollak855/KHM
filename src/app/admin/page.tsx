"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  FileText,
  Mail,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Boxes,
  Sprout,
  Loader2,
} from "lucide-react";
import {
  getOrders,
  getProducts,
  getUsers,
  getInvoices,
  getContactInquiries,
  formatPrice,
  formatDate,
} from "@/lib/firestore";
import { seedSampleData } from "@/lib/seed";
import { LOW_STOCK_THRESHOLD } from "@/lib/types";
import type { Order, Product, ContactInquiry, Invoice } from "@/lib/types";
import StockInboundButton from "@/components/admin/StockInboundButton";
import OrderBadges from "@/components/admin/OrderBadges";
import Button from "@/components/ui/Button";

const statusLabels: Record<Order["status"], string> = {
  pending: "Ausstehend",
  confirmed: "Bestätigt",
  processing: "In Bearbeitung",
  shipped: "Versendet",
  delivered: "Zugestellt",
  cancelled: "Storniert",
};

const inquiryStatusLabels = {
  new: "Neu",
  read: "Gelesen",
  replied: "Beantwortet",
  archived: "Archiviert",
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [stats, setStats] = useState({
    customers: 0,
    revenue: 0,
    orderVolume: 0,
    openOrders: 0,
    lowStock: 0,
    newInquiries: 0,
  });
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allProducts, allOrders, users, invoices, allInquiries] =
        await Promise.all([
          getProducts(),
          getOrders(),
          getUsers(),
          getInvoices(),
          getContactInquiries(),
        ]);

      setProducts(allProducts);
      setOrders(allOrders);
      setInvoices(invoices);
      setInquiries(allInquiries);

      const revenue = invoices
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + i.total, 0);

      const orderVolume = allOrders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + o.total, 0);

      const openOrders = allOrders.filter((o) =>
        ["pending", "confirmed", "processing"].includes(o.status)
      ).length;

      const lowStock = allProducts.filter(
        (p) => p.active && p.stock <= LOW_STOCK_THRESHOLD
      ).length;

      const newInquiries = allInquiries.filter((i) => i.status === "new").length;

      setStats({
        customers: users.filter((u) => u.role === "customer").length,
        revenue,
        orderVolume,
        openOrders,
        lowStock,
        newInquiries,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSeed = async () => {
    if (
      !confirm(
        "Beispiel-Kategorien und -Produkte anlegen? Funktioniert nur, wenn noch keine Daten existieren."
      )
    ) {
      return;
    }
    setSeeding(true);
    setSeedMessage("");
    try {
      const result = await seedSampleData();
      setSeedMessage(
        `${result.categories} Kategorien und ${result.products} Produkte wurden angelegt.`
      );
      await load();
    } catch (err) {
      setSeedMessage(
        err instanceof Error ? err.message : "Seed fehlgeschlagen"
      );
    } finally {
      setSeeding(false);
    }
  };

  const recentOrders = orders.slice(0, 6);
  const invoiceByOrderId = useMemo(() => {
    const map = new Map<string, Invoice>();
    for (const inv of invoices) map.set(inv.orderId, inv);
    return map;
  }, [invoices]);
  const recentInquiries = inquiries.slice(0, 5);
  const lowStockProducts = products
    .filter((p) => p.active && p.stock <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8);

  const statCards = [
    {
      href: "/admin/bestellungen",
      icon: ShoppingCart,
      label: "Offene Aufträge",
      value: stats.openOrders.toString(),
      hint: "Zur Bearbeitung",
      accent: stats.openOrders > 0 ? "border-wheat bg-wheat/10" : "",
    },
    {
      href: "/admin/bestellungen",
      icon: FileText,
      label: "Bestellvolumen",
      value: formatPrice(stats.orderVolume),
      hint: "Alle aktiven Bestellungen",
    },
    {
      href: "/admin/kunden",
      icon: Users,
      label: "Kunden",
      value: stats.customers.toString(),
      hint: "Registrierte Kunden",
    },
    {
      href: "/admin/rechnungen",
      icon: TrendingUp,
      label: "Umsatz (bezahlt)",
      value: formatPrice(stats.revenue),
      hint: "Bezahlte Rechnungen",
    },
    {
      href: "/admin/lager",
      icon: Boxes,
      label: "Niedriger Lagerbestand",
      value: stats.lowStock.toString(),
      hint: `≤ ${LOW_STOCK_THRESHOLD} Stück`,
      accent: stats.lowStock > 0 ? "border-red-200 bg-red-50" : "",
    },
    {
      href: "/admin/kontaktanfragen",
      icon: Mail,
      label: "Kontaktanfragen",
      value: stats.newInquiries.toString(),
      hint: "Neue Nachrichten",
      accent: stats.newInquiries > 0 ? "border-forest/30 bg-forest/5" : "",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-light text-wood-dark mb-1">
          Dashboard
        </h1>
        <p className="text-stone text-sm">
          Übersicht über Aufträge, Lager, Kunden und Anfragen
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {statCards.map(({ href, icon: Icon, label, value, hint, accent }) => (
          <Link
            key={label}
            href={href}
            className={`group bg-linen border border-wood/10 p-4 sm:p-5 hover:border-forest/30 transition-all ${accent || ""}`}
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 border border-forest/20 flex items-center justify-center">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-forest" strokeWidth={1.5} />
              </div>
              <ArrowRight className="w-4 h-4 text-stone/40 group-hover:text-forest transition-colors hidden sm:block" />
            </div>
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-stone mb-1">{label}</p>
            <p className="text-lg sm:text-2xl font-display font-light text-wood-dark">{value}</p>
            <p className="text-[10px] sm:text-xs text-stone mt-1 line-clamp-1">{hint}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <section className="bg-linen border border-wood/10 min-h-0">
          <div className="flex items-center justify-between p-5 border-b border-wood/10">
            <h2 className="font-display text-xl font-light text-wood-dark">
              Aktuelle Aufträge
            </h2>
            <Link
              href="/admin/bestellungen"
              className="text-sm text-forest hover:underline flex items-center gap-1"
            >
              Alle anzeigen <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-wood/10">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href="/admin/bestellungen"
                className="block p-4 hover:bg-wood/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-wood-dark">{order.orderNumber}</p>
                    <p className="text-sm text-stone">
                      {order.customerName} · {formatDate(order.createdAt)}
                    </p>
                    <OrderBadges
                      order={order}
                      invoice={invoiceByOrderId.get(order.id)}
                      className="mt-2"
                    />
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium text-forest">{formatPrice(order.total)}</p>
                    <p className="text-xs text-stone">{statusLabels[order.status]}</p>
                  </div>
                </div>
              </Link>
            ))}
            {recentOrders.length === 0 && (
              <p className="p-8 text-center text-stone text-sm">Noch keine Bestellungen.</p>
            )}
          </div>
        </section>

        <section className="bg-linen border border-wood/10">
          <div className="flex items-center justify-between p-5 border-b border-wood/10">
            <h2 className="font-display text-xl font-light text-wood-dark">
              Kontaktanfragen
            </h2>
            <Link
              href="/admin/kontaktanfragen"
              className="text-sm text-forest hover:underline flex items-center gap-1"
            >
              Alle anzeigen <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-wood/10">
            {recentInquiries.map((inquiry) => (
              <Link
                key={inquiry.id}
                href="/admin/kontaktanfragen"
                className="block p-4 hover:bg-wood/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-wood-dark truncate">{inquiry.subject}</p>
                    <p className="text-sm text-stone truncate">
                      {inquiry.name} · {inquiry.email}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                      inquiry.status === "new"
                        ? "bg-forest/10 text-forest"
                        : "bg-wood/10 text-stone"
                    }`}
                  >
                    {inquiryStatusLabels[inquiry.status]}
                  </span>
                </div>
                <p className="text-xs text-stone mt-1">{formatDate(inquiry.createdAt)}</p>
              </Link>
            ))}
            {recentInquiries.length === 0 && (
              <p className="p-8 text-center text-stone text-sm">Keine Kontaktanfragen.</p>
            )}
          </div>
        </section>

        <section className="bg-linen border border-wood/10 min-h-0">
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-wood/10">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" strokeWidth={1.5} />
              <h2 className="font-display text-lg sm:text-xl font-light text-wood-dark truncate">
                Lager – Nachbestellung
              </h2>
            </div>
            <Link
              href="/admin/lager"
              className="text-sm text-forest hover:underline flex items-center gap-1 shrink-0"
            >
              <span className="hidden sm:inline">Lager</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-wood/10 max-h-[320px] overflow-y-auto">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4"
              >
                <div className="min-w-0">
                  <Link
                    href="/admin/produkte"
                    className="font-medium text-wood-dark hover:text-forest truncate block"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-stone">
                    <span
                      className={
                        p.stock <= 0
                          ? "text-red-600 font-semibold"
                          : "text-amber-700 font-medium"
                      }
                    >
                      {p.stock} Stück
                    </span>
                    {" · "}
                    {formatPrice(p.price)}
                  </p>
                </div>
                <StockInboundButton
                  productId={p.id}
                  productName={p.name}
                  onSuccess={load}
                />
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <p className="p-8 text-center text-stone text-sm">
                Alle Lagerbestände sind ausreichend.
              </p>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/admin/produkte", icon: Package, label: "Produkte" },
              { href: "/admin/lager", icon: Boxes, label: "Lager" },
              { href: "/admin/bestellungen", icon: ShoppingCart, label: "Bestellungen" },
              { href: "/admin/kunden", icon: Users, label: "Kunden" },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-linen border border-wood/10 hover:border-forest/30 transition-colors"
              >
                <Icon className="w-4 h-4 text-forest shrink-0" strokeWidth={1.5} />
                <span className="text-xs sm:text-sm text-wood-dark">{label}</span>
              </Link>
            ))}
          </div>

          {products.length === 0 && (
            <div className="bg-linen border border-wood/10 p-4 sm:p-6">
              <h2 className="font-display text-lg font-light text-wood-dark mb-1 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-forest" />
                Shop starten
              </h2>
              <p className="text-sm text-stone mb-4">
                Beispiel-Kategorien und -Produkte anlegen, um den Shop zu testen.
              </p>
              <Button onClick={handleSeed} disabled={seeding} className="w-full sm:w-auto">
                {seeding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Wird angelegt...
                  </>
                ) : (
                  <>
                    <Sprout className="w-4 h-4" />
                    Beispieldaten laden
                  </>
                )}
              </Button>
              {seedMessage && (
                <p
                  className={`mt-4 text-sm ${seedMessage.includes("angelegt") ? "text-green-700" : "text-red-600"}`}
                >
                  {seedMessage}
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
