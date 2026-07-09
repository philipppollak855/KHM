"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingCart,
  FileText,
  Package,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import type { User } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/firestore";
import CustomerBadges from "@/components/admin/CustomerBadges";
import DownloadButton from "@/components/documents/DownloadButton";
import {
  buildCustomerInsights,
  getCustomerChannelLabel,
  INVOICE_STATUS_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/customer-insights";
import { downloadInvoicePdf, printInvoicePdf } from "@/lib/documents/download";
import type { Invoice, Order } from "@/lib/types";

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof Mail;
  children: React.ReactNode;
}) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-wood-dark uppercase tracking-wide">
      <Icon className="w-4 h-4 text-forest" strokeWidth={1.75} />
      {children}
    </h3>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-linen/80 border border-wood/10 rounded-lg p-3">
      <p className="text-[10px] uppercase tracking-wide text-stone">{label}</p>
      <p className="text-lg font-display text-wood-dark mt-0.5">{value}</p>
      {hint && <p className="text-[10px] text-stone mt-1">{hint}</p>}
    </div>
  );
}

export default function CustomerDetailPanel({
  customer,
  orders,
  invoices,
  onClose,
}: {
  customer: User;
  orders: Order[];
  invoices: Invoice[];
  onClose: () => void;
}) {
  const insights = useMemo(
    () => buildCustomerInsights(customer.id, orders, invoices),
    [customer.id, orders, invoices]
  );

  const maxProductRevenue = insights.topProducts[0]?.revenue ?? 1;

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
        aria-labelledby="customer-detail-title"
      >
        <header className="shrink-0 border-b border-wood/10 bg-linen px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone mb-1">
                Kundendetails
              </p>
              <h2
                id="customer-detail-title"
                className="font-display text-2xl text-wood-dark truncate"
              >
                {customer.displayName || "Ohne Name"}
              </h2>
              <p className="text-sm text-stone break-all mt-0.5">{customer.email}</p>
              <CustomerBadges user={customer} stats={insights} className="mt-3" />
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
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <section className="space-y-3">
            <SectionTitle icon={Mail}>Stammdaten</SectionTitle>
            <div className="bg-white border border-wood/10 rounded-xl p-4 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-stone mt-0.5 shrink-0" />
                <div>
                  <p className="text-stone text-xs">E-Mail</p>
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-forest hover:underline break-all"
                  >
                    {customer.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-stone mt-0.5 shrink-0" />
                <div>
                  <p className="text-stone text-xs">Telefon</p>
                  <p className="text-wood-dark">{customer.phone || "–"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-stone mt-0.5 shrink-0" />
                <div>
                  <p className="text-stone text-xs">Adresse</p>
                  {customer.address?.street ? (
                    <p className="text-wood-dark">
                      {customer.address.street}
                      <br />
                      {customer.address.zip} {customer.address.city}
                      <br />
                      {customer.address.country}
                    </p>
                  ) : (
                    <p className="text-stone">Keine Adresse hinterlegt</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-stone mt-0.5 shrink-0" />
                <div>
                  <p className="text-stone text-xs">Kunde seit</p>
                  <p className="text-wood-dark">{formatDate(customer.createdAt)}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <SectionTitle icon={TrendingUp}>Kennzahlen & Verhalten</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Bestellungen" value={String(insights.orderCount)} />
              <StatCard
                label="Umsatz (bezahlt)"
                value={formatPrice(insights.totalSpent)}
              />
              <StatCard
                label="Ø Bestellwert"
                value={formatPrice(insights.averageOrderValue)}
              />
              <StatCard
                label="Offene Rechnungen"
                value={String(insights.openInvoiceCount)}
                hint={
                  insights.openInvoiceTotal > 0
                    ? formatPrice(insights.openInvoiceTotal)
                    : undefined
                }
              />
              <StatCard
                label="POS / Webshop"
                value={`${insights.posOrderCount} / ${insights.onlineOrderCount}`}
              />
              <StatCard
                label="Letzte Bestellung"
                value={
                  insights.lastOrderAt
                    ? formatDate(insights.lastOrderAt)
                    : "–"
                }
                hint={
                  insights.daysSinceLastOrder !== undefined
                    ? `vor ${insights.daysSinceLastOrder} Tag(en)`
                    : undefined
                }
              />
            </div>

            {(insights.averageDaysBetweenOrders !== undefined ||
              Object.keys(insights.paymentBreakdown).length > 0) && (
              <div className="bg-white border border-wood/10 rounded-xl p-4 text-sm space-y-2">
                {insights.averageDaysBetweenOrders !== undefined && (
                  <p className="text-wood-dark">
                    <span className="text-stone">Kaufrhythmus:</span> ca. alle{" "}
                    {insights.averageDaysBetweenOrders} Tage
                  </p>
                )}
                {Object.entries(insights.paymentBreakdown).map(([method, count]) => (
                  <p key={method} className="text-wood-dark">
                    <span className="text-stone">
                      {PAYMENT_METHOD_LABELS[method as keyof typeof PAYMENT_METHOD_LABELS]}:
                    </span>{" "}
                    {count}×
                  </p>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <SectionTitle icon={Package}>Top-Produkte</SectionTitle>
            {insights.topProducts.length === 0 ? (
              <p className="text-sm text-stone bg-white border border-wood/10 rounded-xl p-4">
                Noch keine Produktkäufe.
              </p>
            ) : (
              <div className="bg-white border border-wood/10 rounded-xl p-4 space-y-3">
                {insights.topProducts.map((product) => (
                  <div key={product.key}>
                    <div className="flex items-center justify-between gap-2 text-sm mb-1">
                      <p className="font-medium text-wood-dark truncate">{product.name}</p>
                      <p className="text-stone shrink-0">{formatPrice(product.revenue)}</p>
                    </div>
                    <div className="h-2 bg-linen rounded-full overflow-hidden">
                      <div
                        className="h-full bg-forest/80 rounded-full"
                        style={{
                          width: `${Math.max(8, (product.revenue / maxProductRevenue) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-stone mt-1">
                      {product.quantity} Stk. · {product.orderCount} Bestellung(en)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <SectionTitle icon={ShoppingCart}>Bestellungen</SectionTitle>
              <Link
                href="/admin/bestellungen"
                className="text-xs text-forest hover:underline inline-flex items-center gap-1"
              >
                Alle <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            {insights.orders.length === 0 ? (
              <p className="text-sm text-stone bg-white border border-wood/10 rounded-xl p-4">
                Keine Bestellungen.
              </p>
            ) : (
              <ul className="space-y-2">
                {insights.orders.slice(0, 12).map((order) => (
                  <li
                    key={order.id}
                    className="bg-white border border-wood/10 rounded-xl p-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-wood-dark">{order.orderNumber}</p>
                        <p className="text-xs text-stone mt-0.5">
                          {formatDate(order.createdAt)} · {getCustomerChannelLabel(order)}
                        </p>
                      </div>
                      <p className="font-medium text-wood-dark shrink-0">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                    <p className="text-xs text-stone mt-2">
                      {ORDER_STATUS_LABELS[order.status]}
                      {order.paymentMethod
                        ? ` · ${PAYMENT_METHOD_LABELS[order.paymentMethod]}`
                        : ""}
                    </p>
                    <p className="text-xs text-stone mt-1 line-clamp-2">
                      {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <SectionTitle icon={FileText}>Rechnungen</SectionTitle>
              <Link
                href="/admin/rechnungen"
                className="text-xs text-forest hover:underline inline-flex items-center gap-1"
              >
                Alle <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            {insights.invoices.length === 0 ? (
              <p className="text-sm text-stone bg-white border border-wood/10 rounded-xl p-4">
                Keine Rechnungen.
              </p>
            ) : (
              <ul className="space-y-2">
                {insights.invoices.map((invoice) => {
                  const overdue =
                    invoice.status === "sent" && invoice.dueAt < new Date();
                  return (
                    <li
                      key={invoice.id}
                      className="bg-white border border-wood/10 rounded-xl p-3 text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-wood-dark">
                            {invoice.invoiceNumber}
                          </p>
                          <p className="text-xs text-stone mt-0.5">
                            {formatDate(invoice.issuedAt)} · {invoice.orderNumber}
                          </p>
                        </div>
                        <p className="font-medium text-wood-dark shrink-0">
                          {formatPrice(invoice.total)}
                        </p>
                      </div>
                      <p
                        className={`text-xs mt-2 ${
                          overdue
                            ? "text-red-700"
                            : invoice.status === "paid"
                              ? "text-green-700"
                              : "text-stone"
                        }`}
                      >
                        {INVOICE_STATUS_LABELS[invoice.status]}
                        {invoice.status === "sent"
                          ? ` · fällig ${formatDate(invoice.dueAt)}`
                          : ""}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <DownloadButton
                          label="PDF"
                          onClick={() => downloadInvoicePdf(invoice.id)}
                        />
                        <DownloadButton
                          label="Drucken"
                          onClick={() => printInvoicePdf(invoice.id)}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
