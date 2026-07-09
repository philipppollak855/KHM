import type { Invoice, Order } from "./types";

function isPosOrder(order: Order) {
  return order.channel === "pos" || order.orderNumber.startsWith("POS-");
}

function isPosInvoice(invoice: Invoice) {
  return invoice.orderNumber.startsWith("POS-");
}

export interface OrderReport {
  count: number;
  activeCount: number;
  cancelledCount: number;
  volume: number;
  average: number;
  posCount: number;
  onlineCount: number;
  posVolume: number;
  onlineVolume: number;
}

export interface PosStaffReportRow {
  staffId: string;
  name: string;
  orderCount: number;
  volume: number;
}

export function computePosStaffReport(orders: Order[]): PosStaffReportRow[] {
  const rows = new Map<string, PosStaffReportRow>();

  for (const order of orders) {
    if (!isPosOrder(order) || order.status === "cancelled") continue;
    const staffId = order.createdByAdmin || "unknown";
    const name = order.createdByAdminName?.trim() || "Unbekannt";
    const current = rows.get(staffId) || { staffId, name, orderCount: 0, volume: 0 };
    current.orderCount += 1;
    current.volume += order.total;
    rows.set(staffId, current);
  }

  return Array.from(rows.values()).sort((a, b) => b.volume - a.volume);
}

export function computeOrderReport(orders: Order[]): OrderReport {
  const active = orders.filter((o) => o.status !== "cancelled");
  const pos = active.filter(isPosOrder);
  const online = active.filter((o) => !isPosOrder(o));
  const volume = active.reduce((sum, o) => sum + o.total, 0);

  return {
    count: orders.length,
    activeCount: active.length,
    cancelledCount: orders.filter((o) => o.status === "cancelled").length,
    volume,
    average: active.length ? volume / active.length : 0,
    posCount: pos.length,
    onlineCount: online.length,
    posVolume: pos.reduce((sum, o) => sum + o.total, 0),
    onlineVolume: online.reduce((sum, o) => sum + o.total, 0),
  };
}

export interface InvoiceReport {
  count: number;
  paidCount: number;
  paidAmount: number;
  openCount: number;
  openAmount: number;
  overdueCount: number;
  cancelledCount: number;
  totalVolume: number;
  posCount: number;
  onlineCount: number;
}

export function computeInvoiceReport(invoices: Invoice[]): InvoiceReport {
  const now = new Date();
  const relevant = invoices.filter((i) => i.status !== "cancelled");
  const paid = invoices.filter((i) => i.status === "paid");
  const open = invoices.filter((i) => i.status === "sent");
  const overdue = open.filter((i) => i.dueAt < now);
  const pos = relevant.filter(isPosInvoice);
  const online = relevant.filter((i) => !isPosInvoice(i));

  return {
    count: invoices.length,
    paidCount: paid.length,
    paidAmount: paid.reduce((sum, i) => sum + i.total, 0),
    openCount: open.length,
    openAmount: open.reduce((sum, i) => sum + i.total, 0),
    overdueCount: overdue.length,
    cancelledCount: invoices.filter((i) => i.status === "cancelled").length,
    totalVolume: relevant.reduce((sum, i) => sum + i.total, 0),
    posCount: pos.length,
    onlineCount: online.length,
  };
}
