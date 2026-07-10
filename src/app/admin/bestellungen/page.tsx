"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { getOrders, getInvoices, updateOrderStatus, formatPrice, formatDate } from "@/lib/firestore";
import type { Invoice, Order } from "@/lib/types";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import OrderBadges from "@/components/admin/OrderBadges";
import OrderDetailPanel from "@/components/admin/OrderDetailPanel";
import { matchesSearch } from "@/lib/search";
import { getOrderBadges } from "@/lib/badges";
import { formatAdminCustomerName } from "@/lib/customer-display";
import { ORDER_STATUS_LABELS } from "@/lib/customer-insights";
import { isDateInRange, type PeriodPreset } from "@/lib/date-filters";
import { computeOrderReport, computePosStaffReport } from "@/lib/admin-reports";
import AdminPeriodFilter, {
  getActiveDateRange,
  useDefaultCustomRange,
} from "@/components/admin/AdminPeriodFilter";
import AdminReportCards, { AdminFilterChips } from "@/components/admin/AdminReportCards";
import { useTeamDataFilters } from "@/hooks/useTeamDataFilters";
import { usePwaOverlayBack } from "@/hooks/usePwaBackNavigation";

export default function AdminOrdersPage() {
  const { filterOrders } = useTeamDataFilters();
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const closeDetail = useCallback(() => setSelectedOrder(null), []);
  usePwaOverlayBack(!!selectedOrder, "order-detail", closeDetail);

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

  const scopedOrders = useMemo(() => filterOrders(orders), [orders, filterOrders]);

  const filteredOrders = useMemo(
    () =>
      scopedOrders.filter((order) => {
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
          ORDER_STATUS_LABELS[order.status],
          order.total,
          formatPrice(order.total),
          order.shippingAddress.street,
          order.shippingAddress.city,
          order.shippingAddress.zip,
          order.shippingAddress.country,
          order.createdByAdminName,
          ...order.items.map((i) => i.name),
          ...badges.map((b) => b.label),
        ]);
      }),
    [scopedOrders, search, channelFilter, statusFilter, dateRange, invoiceByOrderId]
  );

  const report = useMemo(() => computeOrderReport(filteredOrders), [filteredOrders]);
  const staffReport = useMemo(
    () => computePosStaffReport(filteredOrders),
    [filteredOrders]
  );

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
    const [orderList, invoiceList] = await Promise.all([getOrders(), getInvoices()]);
    setOrders(orderList);
    setInvoices(invoiceList);
    setSelectedOrder((current) =>
      current?.id === id ? orderList.find((o) => o.id === id) ?? null : current
    );
  };

  const selectedInvoice = selectedOrder
    ? invoiceByOrderId.get(selectedOrder.id)
    : undefined;

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

      {staffReport.length > 0 && (channelFilter === "all" || channelFilter === "pos") && (
        <section className="mb-6 rounded-xl border border-wood/10 bg-cream p-4">
          <h2 className="text-sm font-semibold text-wood-dark mb-3">Kassa nach Verkäufer</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {staffReport.map((row) => (
              <div
                key={row.staffId}
                className="rounded-lg border border-wood/10 bg-linen/50 px-3 py-2.5"
              >
                <p className="font-medium text-wood-dark truncate">{row.name}</p>
                <p className="text-sm text-stone mt-0.5">
                  {row.orderCount} Verkäufe · {formatPrice(row.volume)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

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

      <div className="bg-linen border border-wood/10 rounded-lg divide-y divide-wood/10 overflow-hidden">
        {filteredOrders.map((order) => {
          const invoice = invoiceByOrderId.get(order.id);
          const itemSummary =
            order.items.length === 1
              ? `1 Artikel`
              : `${order.items.length} Artikel`;

          return (
            <button
              key={order.id}
              type="button"
              onClick={() => setSelectedOrder(order)}
              className="w-full text-left px-3 py-2.5 sm:px-4 sm:py-3 hover:bg-wood/5 active:bg-wood/8 transition-colors touch-manipulation"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-wood-dark text-sm">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-stone hidden sm:inline">
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p className="text-xs text-stone mt-0.5 truncate">
                    {formatAdminCustomerName(order.customerName, order.userId)}
                    <span className="mx-1.5 text-wood/30">·</span>
                    {formatDate(order.createdAt)}
                    {order.createdByAdminName && (
                      <>
                        <span className="mx-1.5 text-wood/30">·</span>
                        {order.createdByAdminName}
                      </>
                    )}
                    <span className="mx-1.5 text-wood/30 hidden sm:inline">·</span>
                    <span className="hidden sm:inline">{itemSummary}</span>
                  </p>
                  <OrderBadges
                    order={order}
                    invoice={invoice}
                    className="mt-1.5 gap-1"
                  />
                </div>
                <div className="shrink-0 text-right flex items-center gap-2">
                  <div>
                    <p className="font-semibold text-forest text-sm tabular-nums">
                      {formatPrice(order.total)}
                    </p>
                    <p className="text-[10px] text-stone sm:hidden mt-0.5">
                      {ORDER_STATUS_LABELS[order.status]}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone/40 shrink-0" />
                </div>
              </div>
            </button>
          );
        })}
        {filteredOrders.length === 0 && (
          <p className="text-center text-stone py-12 text-sm">
            {search ? "Keine Bestellungen gefunden." : "Noch keine Bestellungen."}
          </p>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailPanel
          order={selectedOrder}
          invoice={selectedInvoice}
          onClose={closeDetail}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
