"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { PackageMinus } from "lucide-react";
import {
  getProducts,
  getStockMovements,
  formatPrice,
  formatDate,
} from "@/lib/firestore";
import { adjustProductStock } from "@/lib/inventory";
import { useAuth } from "@/context/AuthContext";
import { LOW_STOCK_THRESHOLD } from "@/lib/types";
import type { Product, StockMovement } from "@/lib/types";
import StockInboundButton from "@/components/admin/StockInboundButton";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import { matchesSearch } from "@/lib/search";
import Button from "@/components/ui/Button";

const reasonLabels: Record<StockMovement["reason"], string> = {
  order: "Bestellung",
  cancel: "Storno",
  inbound: "Einbuchung",
  outbound: "Ausbuchung",
  correction: "Korrektur",
  reorder: "Nachbestellung",
};

export default function AdminInventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [outboundQty, setOutboundQty] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const [prods, movs] = await Promise.all([
      getProducts(),
      getStockMovements(20),
    ]);
    setProducts(prods.sort((a, b) => a.stock - b.stock));
    setMovements(movs);
  }, []);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  const handleOutbound = async (productId: string, productName: string) => {
    if (!user) return;
    const qty = parseInt(outboundQty[productId] || "0", 10);
    if (!qty || qty <= 0) {
      alert("Bitte eine gültige Menge eingeben.");
      return;
    }
    await adjustProductStock(
      productId,
      -qty,
      "outbound",
      user.id,
      `Manuelle Ausbuchung: ${productName}`
    );
    setOutboundQty((prev) => ({ ...prev, [productId]: "" }));
    await load();
  };

  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        matchesSearch(search, [p.name, p.description, p.stock, p.slug])
      ),
    [products, search]
  );

  const lowCount = filteredProducts.filter(
    (p) => p.active && p.stock <= LOW_STOCK_THRESHOLD
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-light text-wood-dark mb-1">
          Lager
        </h1>
        <p className="text-stone text-sm">
          Bestände prüfen, nachbestellen und ein- oder ausbuchen
        </p>
      </div>

      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Produkt, Bestand…"
        resultCount={filteredProducts.length}
        totalCount={products.length}
      />

      {lowCount > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {lowCount} Produkt(e) mit niedrigem Bestand (≤ {LOW_STOCK_THRESHOLD} Stück).
        </div>
      )}

      <div className="bg-linen border border-wood/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-wood/5">
            <tr>
              <th className="text-left p-4 font-medium text-wood-dark">Produkt</th>
              <th className="text-left p-4 font-medium text-wood-dark">Bestand</th>
              <th className="text-left p-4 font-medium text-wood-dark">Status</th>
              <th className="text-right p-4 font-medium text-wood-dark">Nachbestellen / Einbuchen</th>
              <th className="text-right p-4 font-medium text-wood-dark">Ausbuchen</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-t border-wood/10">
                <td className="p-4">
                  <Link
                    href="/admin/produkte"
                    className="font-medium text-wood-dark hover:text-forest"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-stone">{formatPrice(p.price)}</p>
                </td>
                <td className="p-4">
                  <span
                    className={`font-semibold ${
                      p.stock <= 0
                        ? "text-red-600"
                        : p.stock <= LOW_STOCK_THRESHOLD
                          ? "text-amber-700"
                          : "text-wood-dark"
                    }`}
                  >
                    {p.stock}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      p.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.active ? "Aktiv" : "Inaktiv"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end">
                    <StockInboundButton
                      productId={p.id}
                      productName={p.name}
                      label="Einbuchen"
                      onSuccess={load}
                    />
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Menge"
                      value={outboundQty[p.id] || ""}
                      onChange={(e) =>
                        setOutboundQty((prev) => ({
                          ...prev,
                          [p.id]: e.target.value,
                        }))
                      }
                      className="w-16 rounded border border-wood/20 bg-linen px-2 py-1.5 text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOutbound(p.id, p.name)}
                    >
                      <PackageMinus className="w-4 h-4" />
                      Ausbuchen
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section>
        <h2 className="font-display text-xl font-light text-wood-dark mb-4">
          Letzte Lagerbewegungen
        </h2>
        <div className="bg-linen border border-wood/10 divide-y divide-wood/10">
          {movements.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm"
            >
              <div>
                <p className="font-medium text-wood-dark">{m.productName}</p>
                <p className="text-stone text-xs">
                  {reasonLabels[m.reason]}
                  {m.orderNumber ? ` · ${m.orderNumber}` : ""}
                  {m.note ? ` · ${m.note}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    m.delta > 0 ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {m.delta > 0 ? "+" : ""}
                  {m.delta}
                </p>
                <p className="text-xs text-stone">
                  → {m.stockAfter} · {formatDate(m.createdAt)}
                </p>
              </div>
            </div>
          ))}
          {movements.length === 0 && (
            <p className="p-8 text-center text-stone">Noch keine Lagerbewegungen.</p>
          )}
        </div>
      </section>
    </div>
  );
}
