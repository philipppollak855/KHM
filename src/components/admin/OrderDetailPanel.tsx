"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  X,
  User,
  Mail,
  MapPin,
  Package,
  FileText,
  Truck,
  ExternalLink,
  Calendar,
} from "lucide-react";
import type { Invoice, Order } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/firestore";
import OrderBadges from "@/components/admin/OrderBadges";
import DownloadButton from "@/components/documents/DownloadButton";
import {
  downloadDeliveryNotePdf,
  downloadInvoicePdf,
  downloadOrderConfirmationPdf,
  printInvoicePdf,
} from "@/lib/documents/download";
import {
  getCustomerChannelLabel,
  INVOICE_STATUS_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/customer-insights";
import { formatAdminCustomerName } from "@/lib/customer-display";

const statuses: Order["status"][] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-wood-dark uppercase tracking-wide">
      <Icon className="w-4 h-4 text-forest" strokeWidth={1.75} />
      {children}
    </h3>
  );
}

export default function OrderDetailPanel({
  order,
  invoice,
  onClose,
  onStatusChange,
}: {
  order: Order;
  invoice?: Invoice | null;
  onClose: () => void;
  onStatusChange: (id: string, status: Order["status"]) => Promise<void>;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-wood-dark/50 backdrop-blur-sm"
        aria-label="Detailfenster schließen"
        onClick={onClose}
      />
      <aside
        className="relative w-full max-w-xl bg-cream shadow-2xl flex flex-col h-full max-h-dvh"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
      >
        <header className="shrink-0 border-b border-wood/10 bg-linen px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone mb-1">
                Bestelldetails
              </p>
              <h2
                id="order-detail-title"
                className="font-display text-2xl text-wood-dark truncate"
              >
                {order.orderNumber}
              </h2>
              <p className="text-sm text-stone mt-0.5">
                {formatDate(order.createdAt)} · {getCustomerChannelLabel(order)}
                {order.paymentMethod
                  ? ` · ${PAYMENT_METHOD_LABELS[order.paymentMethod]}`
                  : ""}
                {order.createdByAdminName
                  ? ` · Verkäufer: ${order.createdByAdminName}`
                  : ""}
              </p>
              <OrderBadges order={order} invoice={invoice} className="mt-3" />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-wood/10 text-wood-dark shrink-0"
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <select
              value={order.status}
              onChange={(e) =>
                onStatusChange(order.id, e.target.value as Order["status"])
              }
              className="flex-1 min-w-[10rem] rounded-lg border-2 border-wood/20 bg-white px-3 py-2 text-sm"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <p className="font-display text-xl text-forest shrink-0">
              {formatPrice(order.total)}
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <section className="space-y-3">
            <SectionTitle icon={User}>Kunde</SectionTitle>
            <div className="bg-white border border-wood/10 rounded-xl p-4 space-y-3 text-sm">
              <div>
                <p className="text-stone text-xs">Name</p>
                <p className="text-wood-dark font-medium">
                  {formatAdminCustomerName(order.customerName, order.userId)}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-stone mt-0.5 shrink-0" />
                <div>
                  <p className="text-stone text-xs">E-Mail</p>
                  {order.customerEmail ? (
                    <a
                      href={`mailto:${order.customerEmail}`}
                      className="text-forest hover:underline break-all"
                    >
                      {order.customerEmail}
                    </a>
                  ) : (
                    <p className="text-stone">–</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <SectionTitle icon={Package}>Artikel</SectionTitle>
            <div className="bg-white border border-wood/10 rounded-xl overflow-hidden text-sm">
              <table className="w-full">
                <thead className="bg-wood/5 text-xs uppercase tracking-wide text-stone">
                  <tr>
                    <th className="text-left p-3 font-medium">Position</th>
                    <th className="text-right p-3 font-medium w-16">Menge</th>
                    <th className="text-right p-3 font-medium w-24">Betrag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood/10">
                  {order.items.map((item, index) => (
                    <tr key={`${item.productId}-${index}`}>
                      <td className="p-3 text-wood-dark">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-stone mt-0.5">
                          {formatPrice(item.price)} · USt. {item.taxRate} %
                        </p>
                      </td>
                      <td className="p-3 text-right text-wood-dark tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="p-3 text-right text-wood-dark font-medium tabular-nums">
                        {formatPrice(item.grossAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-wood/10 p-3 space-y-1 text-xs text-stone">
                <div className="flex justify-between">
                  <span>Zwischensumme (netto)</span>
                  <span>{formatPrice(order.subtotalNet)}</span>
                </div>
                <div className="flex justify-between">
                  <span>USt.</span>
                  <span>{formatPrice(order.taxTotal)}</span>
                </div>
                {order.shipping > 0 && (
                  <div className="flex justify-between">
                    <span>Versand</span>
                    <span>{formatPrice(order.shipping)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold text-wood-dark pt-1">
                  <span>Gesamt</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <SectionTitle icon={MapPin}>Lieferadresse</SectionTitle>
            <div className="bg-white border border-wood/10 rounded-xl p-4 text-sm text-wood-dark">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.zip} {order.shippingAddress.city}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.distanceKm !== undefined && order.distanceKm > 0 && (
                <p className="text-xs text-stone mt-2">
                  Entfernung: {order.distanceKm.toFixed(1)} km
                </p>
              )}
            </div>
          </section>

          {order.notes && (
            <section className="space-y-3">
              <SectionTitle icon={Calendar}>Hinweise</SectionTitle>
              <p className="bg-white border border-wood/10 rounded-xl p-4 text-sm text-wood-dark whitespace-pre-wrap">
                {order.notes}
              </p>
            </section>
          )}

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <SectionTitle icon={FileText}>Rechnung</SectionTitle>
              {invoice && (
                <Link
                  href="/admin/rechnungen"
                  className="text-xs text-forest hover:underline inline-flex items-center gap-1"
                >
                  Alle <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
            {!invoice ? (
              <p className="text-sm text-stone bg-white border border-wood/10 rounded-xl p-4">
                Keine Rechnung verknüpft.
              </p>
            ) : (
              <div className="bg-white border border-wood/10 rounded-xl p-4 text-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-wood-dark">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-stone mt-0.5">
                      Ausgestellt {formatDate(invoice.issuedAt)}
                      {invoice.status === "sent"
                        ? ` · fällig ${formatDate(invoice.dueAt)}`
                        : ""}
                    </p>
                  </div>
                  <p className="font-medium text-wood-dark shrink-0">
                    {formatPrice(invoice.total)}
                  </p>
                </div>
                <p
                  className={`text-xs ${
                    invoice.status === "paid"
                      ? "text-green-700"
                      : invoice.status === "sent" && invoice.dueAt < new Date()
                        ? "text-red-700"
                        : "text-stone"
                  }`}
                >
                  {INVOICE_STATUS_LABELS[invoice.status]}
                </p>
                <div className="flex flex-wrap gap-2">
                  <DownloadButton
                    label="Rechnung PDF"
                    onClick={() => downloadInvoicePdf(invoice.id)}
                  />
                  <DownloadButton
                    label="Drucken"
                    onClick={() => printInvoicePdf(invoice.id)}
                  />
                </div>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <SectionTitle icon={Truck}>Dokumente</SectionTitle>
            <div className="flex flex-wrap gap-2">
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
          </section>
        </div>
      </aside>
    </div>
  );
}
