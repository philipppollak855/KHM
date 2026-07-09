"use client";

import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus, formatPrice, formatDate } from "@/lib/firestore";
import { downloadOrderConfirmationPdf, downloadDeliveryNotePdf } from "@/lib/documents/download";
import type { Order } from "@/lib/types";
import DownloadButton from "@/components/documents/DownloadButton";

const statuses: Order["status"][] = [
  "pending", "confirmed", "processing", "shipped", "delivered", "cancelled",
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

  const load = async () => setOrders(await getOrders());

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleStatusChange = async (id: string, status: Order["status"]) => {
    await updateOrderStatus(id, status);
    await load();
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-light text-wood-dark mb-2">Bestellungen</h1>
      <p className="text-stone text-sm mb-8">Auftragsbestätigung und Lieferschein bei Statusänderung</p>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-cream border border-wood/10 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-semibold text-wood-dark text-lg">{order.orderNumber}</p>
                <p className="text-sm text-stone">{order.customerName} · {order.customerEmail}</p>
                <p className="text-sm text-stone">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value as Order["status"])}
                  className="rounded-lg border-2 border-wood/20 bg-linen px-3 py-1.5 text-sm"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{statusLabels[s]}</option>
                  ))}
                </select>
                <span className="font-semibold text-forest">{formatPrice(order.total)}</span>
              </div>
            </div>

            <div className="text-sm text-stone space-y-1 mb-4">
              {order.items.map((item, i) => (
                <p key={i}>
                  {item.quantity}× {item.name} – {formatPrice(item.grossAmount)} (USt. {item.taxRate} %)
                </p>
              ))}
            </div>

            <p className="text-sm text-stone mb-4">
              Lieferadresse: {order.shippingAddress.street}, {order.shippingAddress.zip} {order.shippingAddress.city}, {order.shippingAddress.country}
            </p>

            <div className="flex flex-wrap gap-2 pt-3 border-t border-wood/10">
              <DownloadButton
                label="Auftragsbestätigung"
                onClick={() => downloadOrderConfirmationPdf(order.id)}
              />
              {order.deliveryNoteId && (
                <DownloadButton
                  label="Lieferschein"
                  onClick={() => downloadDeliveryNotePdf(order.deliveryNoteId!)}
                />
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-center text-stone py-12">Noch keine Bestellungen.</p>
        )}
      </div>
    </div>
  );
}
