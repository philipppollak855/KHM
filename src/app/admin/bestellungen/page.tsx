"use client";

import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus, formatPrice, formatDate } from "@/lib/firestore";
import type { Order } from "@/lib/types";

const statuses: Order["status"][] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const statusLabels: Record<Order["status"], string> = {
  pending: "Ausstehend",
  confirmed: "Bestätigt",
  processing: "In Bearbeitung",
  shipped: "Versendet",
  delivered: "Zugestellt",
  cancelled: "Storniert",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const load = async () => {
    setOrders(await getOrders());
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleStatusChange = async (id: string, status: Order["status"]) => {
    await updateOrderStatus(id, status);
    await load();
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-wood-dark mb-8">
        Bestellungen
      </h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-cream rounded-2xl p-6 border border-wood/10 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-semibold text-wood-dark text-lg">
                  {order.orderNumber}
                </p>
                <p className="text-sm text-wood/60">
                  {order.customerName} · {order.customerEmail}
                </p>
                <p className="text-sm text-wood/60">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order.id, e.target.value as Order["status"])
                  }
                  className="rounded-lg border-2 border-wood/20 bg-cream px-3 py-1.5 text-sm"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </select>
                <span className="font-bold text-forest text-lg">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
            <div className="text-sm text-wood/70 space-y-1">
              {order.items.map((item, i) => (
                <p key={i}>
                  {item.quantity}× {item.name} –{" "}
                  {formatPrice(item.price * item.quantity)}
                </p>
              ))}
            </div>
            <p className="text-sm text-wood/60 mt-3">
              Lieferadresse: {order.shippingAddress.street},{" "}
              {order.shippingAddress.zip} {order.shippingAddress.city}
            </p>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-center text-wood/60 py-12">
            Noch keine Bestellungen vorhanden.
          </p>
        )}
      </div>
    </div>
  );
}
