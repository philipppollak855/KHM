"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingCart, Users, FileText, Sprout, Loader2 } from "lucide-react";
import { getOrders, getProducts, getUsers, getInvoices } from "@/lib/firestore";
import { formatPrice } from "@/lib/firestore";
import { seedSampleData } from "@/lib/seed";
import Button from "@/components/ui/Button";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
    pendingOrders: 0,
  });
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");

  const loadStats = async () => {
    try {
      const [products, orders, users, invoices] = await Promise.all([
        getProducts(),
        getOrders(),
        getUsers(),
        getInvoices(),
      ]);
      const revenue = invoices
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + i.total, 0);
      const pendingOrders = orders.filter((o) => o.status === "pending").length;
      setStats({
        products: products.length,
        orders: orders.length,
        customers: users.filter((u) => u.role === "customer").length,
        revenue,
        pendingOrders,
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

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
      await loadStats();
    } catch (err) {
      setSeedMessage(
        err instanceof Error ? err.message : "Seed fehlgeschlagen"
      );
    } finally {
      setSeeding(false);
    }
  };

  const cards = [
    { icon: Package, label: "Produkte", value: stats.products.toString() },
    { icon: ShoppingCart, label: "Bestellungen", value: stats.orders.toString() },
    { icon: Users, label: "Kunden", value: stats.customers.toString() },
    { icon: FileText, label: "Umsatz (bezahlt)", value: formatPrice(stats.revenue) },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-wood-dark mb-2">
        Dashboard
      </h1>
      <p className="text-wood/60 mb-8">
        Willkommen im Verwaltungsbereich von KHM
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="bg-cream rounded-2xl p-6 border border-wood/10 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-forest" />
              </div>
              <span className="text-sm text-wood/60">{label}</span>
            </div>
            <p className="text-2xl font-bold text-wood-dark">{value}</p>
          </div>
        ))}
      </div>

      {stats.pendingOrders > 0 && (
        <div className="bg-wheat/20 border border-wheat/40 rounded-xl p-4 text-wood-dark mb-6">
          <p className="font-medium">
            {stats.pendingOrders} ausstehende Bestellung(en) warten auf Bearbeitung.
          </p>
        </div>
      )}

      {stats.products === 0 && (
        <div className="bg-cream rounded-2xl p-6 border border-wood/10 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-wood-dark mb-1 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-forest" />
                Shop starten
              </h2>
              <p className="text-sm text-wood/60">
                Legen Sie Beispiel-Kategorien und -Produkte an, um den Shop sofort zu testen.
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
