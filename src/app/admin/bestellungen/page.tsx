"use client";

import { useEffect, useState, useMemo } from "react";
import { getOrders, getInvoices, updateOrderStatus, formatPrice, formatDate } from "@/lib/firestore";
import { downloadOrderConfirmationPdf, downloadDeliveryNotePdf } from "@/lib/documents/download";
import type { Invoice, Order } from "@/lib/types";
import DownloadButton from "@/components/documents/DownloadButton";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import OrderBadges from "@/components/admin/OrderBadges";
import { matchesSearch } from "@/lib/search";
import { getOrderBadges } from "@/lib/badges";
import { formatAdminCustomerName } from "@/lib/customer-display";
import { isDateInRange, type PeriodPreset } from "@/lib/date-filters";
import { computeOrderReport } from "@/lib/admin-reports";
import AdminPeriodFilter, {
  getActiveDateRange,
  useDefaultCustomRange,
} from "@/components/admin/AdminPeriodFilter";
import AdminReportCards, { AdminFilterChips } from "@/components/admin/AdminReportCards";

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
  const defaultRange = useDefaultCustomRange();
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>("month");
  const [customFrom, setCustomFrom] = useState(defaultRange.from);
  const [customTo, setCustomTo] = useState(defaultRange.to);
  const [channelFilter, setChannelFilter] = useState<"all" | "pos" | "online">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "open" | "completed" | "cancelled"
  >("all");

  const load = async () => {
    const [orderList, invoiceList] = await Promise.all([getOrders(), getInvoices()]);
    setOrders(orderList);
    setInvoices(invoiceList);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const invoiceByOrderId = useMemo(() => {
    const map = new Map<string, Invoice>();
    for (const inv of invoices) map.set(inv.orderId, inv);
    return map;
  }, [invoices]);

  const dateRange = useMemo(
    () => getActiveDateRange(periodPreset, customFrom, customTo),
    [periodPreset, customFrom, customTo]
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        if (!isDateInRange(order.createdAt, dateRange)) return false;

        const invoice = invoiceByOrderId.get(order.id);
        const badges = getOrderBadges(order, invoice);
        const isPos = badges.some((b) => b.key === "channel" && b.label === "POS");
        const isOnline = badges.some((b) => b.key === "channel" && b.label === "Webshop");
        if (channelFilter === "pos" && !isPos) return false;
        if (channelFilter === "online" && !isOnline) return false;

        if (statusFilter === "open" && !["pending", "confirmed", "processing"].includes(order.status)) {
          return false;
        }
        if (statusFilter === "completed" && !["shipped", "delivered"].includes(order.status)) {
          return false;
        }
        if (statusFilter === "cancelled" && order.status !== "cancelled") return false;

        return matchesSearch(search, [
          order.orderNumber,
          order.customerName,
          order.customerEmail,
          statusLabels[order.status],
          order.total,
          formatPrice(order.total),
          order.shippingAddress.street,
          order.shippingAddress.city,
          order.shippingAddress.zip,
          order.shippingAddress.country,
          ...order.items.map((i) => i.name),
          ...badges.map((b) => b.label),
        ]);
      }),
    [orders, search, channelFilter, statusFilter, dateRange, invoiceByOrderId]
  );

  const report = useMemo(() => computeOrderReport(filteredOrders), [filteredOrders]);

  const reportCards = [
    {
      label: "Aufträge",
      value: String(report.count),
      hint: `${report.activeCount} aktiv · ${report.cancelledCount} storniert`,
    },
    {
      label: "Volumen",
      value: formatPrice(report.volume),
      hint: "Ohne Stornierte",
    },
    {
      label: "Ø Bestellwert",
      value: formatPrice(report.average),
      hint: `${report.activeCount} aktive Bestellungen`,
    },
    {
      label: "POS",
      value: formatPrice(report.posVolume),
      hint: `${report.posCount} Verkäufe`,
    },
    {
      label: "Webshop",
      value: formatPrice(report.onlineVolume),
      hint: `${report.onlineCount} Bestellungen`,
    },
    {
      label: "Offen",
      value: String(
        filteredOrders.filter((o) =>
          ["pending", "confirmed", "processing"].includes(o.status)
        ).length
      ),
      hint: "In Bearbeitung",
      accent:
        filteredOrders.some((o) =>
          ["pending", "confirmed", "processing"].includes(o.status)
        )
          ? "border-amber-200/80"
          : "",
    },
  ];

  const handleStatusChange = async (id: string, status: Order["status"]) => {
    await updateOrderStatus(id, status);
    await load();
  };

  return (
    <div>
      <AdminPageHeader
        title="Bestellungen"
        description="Aufträge nach Zeitraum filtern, auswerten und bearbeiten"
      />

      <AdminPeriodFilter
        preset={periodPreset}
        onPresetChange={setPeriodPreset}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
      />

      <AdminReportCards cards={reportCards} />

      <AdminFilterChips
        value={statusFilter}
        onChange={setStatusFilter}
        options={[
          { id: "all", label: "Alle Status" },
          { id: "open", label: "Offen" },
          { id: "completed", label: "Abgeschlossen" },
          { id: "cancelled", label: "Storniert" },
        ]}
      />

      <AdminFilterChips
        value={channelFilter}
        onChange={setChannelFilter}
        options={[
          { id: "all", label: "Alle Kanäle" },
          { id: "pos", label: "POS" },
          { id: "online", label: "Webshop" },
        ]}
      />

      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Bestellnr., Kunde, E-Mail, Produkt, Badge…"
        resultCount={filteredOrders.length}
        totalCount={orders.length}
      />

      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const invoice = invoiceByOrderId.get(order.id);
          return (
          <div key={order.id} className="bg-cream border border-wood/10 p-4 sm:p-6 rounded-lg">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-wood-dark text-lg">{order.orderNumber}</p>
                <p className="text-sm text-stone">{formatAdminCustomerName(order.customerName, order.userId)} · {order.customerEmail || "–"}</p>
                <p className="text-sm text-stone mt-1">{formatDate(order.createdAt)}</p>
                <OrderBadges order={order} invoice={invoice} className="mt-3" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value as Order["status"])}
                  className="w-full sm:w-auto rounded-lg border-2 border-wood/20 bg-linen px-3 py-2.5 text-base sm:text-sm"
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
        );
        })}
        {filteredOrders.length === 0 && (
          <p className="text-center text-stone py-12">
            {search ? "Keine Bestellungen gefunden." : "Noch keine Bestellungen."}
          </p>
        )}
      </div>
    </div>
  );
}
