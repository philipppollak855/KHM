"use client";

import { useEffect, useState, useCallback } from "react";
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
import type { Order, Product, ContactInquiry } from "@/lib/types";
import StockInboundButton from "@/components/admin/StockInboundButton";
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
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-light text-wood-dark mb-1">
          Dashboard
        </h1>
        <p className="text-stone text-sm">
          Übersicht über Aufträge, Lager, Kunden und Anfragen
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map(({ href, icon: Icon, label, value, hint, accent }) => (
          <Link
            key={label}
            href={href}
            className={`group bg-linen border border-wood/10 p-5 hover:border-forest/30 transition-all ${accent || ""}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 border border-forest/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-forest" strokeWidth={1.5} />
              </div>
              <ArrowRight className="w-4 h-4 text-stone/40 group-hover:text-forest transition-colors" />
            </div>
            <p className="text-xs uppercase tracking-wider text-stone mb-1">{label}</p>
            <p className="text-2xl font-display font-light text-wood-dark">{value}</p>
            <p className="text-xs text-stone mt-1">{hint}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="bg-linen border border-wood/10">
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
                className="flex items-center justify-between p-4 hover:bg-wood/5 transition-colors"
              >
                <div>
                  <p className="font-medium text-wood-dark">{order.orderNumber}</p>
                  <p className="text-sm text-stone">
                    {order.customerName} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-forest">{formatPrice(order.total)}</p>
                  <p className="text-xs text-stone">{statusLabels[order.status]}</p>
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
      </div>

      <section className="bg-linen border border-wood/10">
        <div className="flex items-center justify-between p-5 border-b border-wood/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" strokeWidth={1.5} />
            <h2 className="font-display text-xl font-light text-wood-dark">
              Lager – Nachbestellung nötig
            </h2>
          </div>
          <Link
            href="/admin/lager"
            className="text-sm text-forest hover:underline flex items-center gap-1"
          >
            Lager verwalten <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-wood/5">
              <tr>
                <th className="text-left p-4 font-medium text-wood-dark">Produkt</th>
                <th className="text-left p-4 font-medium text-wood-dark">Bestand</th>
                <th className="text-left p-4 font-medium text-wood-dark">Preis</th>
                <th className="text-right p-4 font-medium text-wood-dark">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((p) => (
                <tr key={p.id} className="border-t border-wood/10">
                  <td className="p-4">
                    <Link
                      href="/admin/produkte"
                      className="font-medium text-wood-dark hover:text-forest"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span
                      className={
                        p.stock <= 0
                          ? "text-red-600 font-semibold"
                          : "text-amber-700 font-medium"
                      }
                    >
                      {p.stock} Stück
                    </span>
                  </td>
                  <td className="p-4">{formatPrice(p.price)}</td>
                  <td className="p-4">
                    <div className="flex justify-end">
                      <StockInboundButton
                        productId={p.id}
                        productName={p.name}
                        onSuccess={load}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {lowStockProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-stone">
                    Alle Lagerbestände sind ausreichend.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/admin/produkte", icon: Package, label: "Produkte" },
          { href: "/admin/lager", icon: Boxes, label: "Lager" },
          { href: "/admin/bestellungen", icon: ShoppingCart, label: "Bestellungen" },
          { href: "/admin/kunden", icon: Users, label: "Kunden" },
        ].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 p-4 bg-linen border border-wood/10 hover:border-forest/30 transition-colors"
          >
            <Icon className="w-4 h-4 text-forest" strokeWidth={1.5} />
            <span className="text-sm text-wood-dark">{label}</span>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <div className="bg-linen border border-wood/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-light text-wood-dark mb-1 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-forest" />
                Shop starten
              </h2>
              <p className="text-sm text-stone">
                Beispiel-Kategorien und -Produkte anlegen, um den Shop zu testen.
              </p>
            </div>
            <Button onClick={handleSeed} disabled={seeding}>
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
          </div>
          {seedMessage && (
            <p
              className={`mt-4 text-sm ${seedMessage.includes("angelegt") ? "text-green-700" : "text-red-600"}`}
            >
              {seedMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
