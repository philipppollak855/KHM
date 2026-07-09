import { buildCustomerStats, type CustomerStats } from "@/lib/badges";
import type { Invoice, Order, PaymentMethod, User } from "@/lib/types";

export interface CustomerProductInsight {
  key: string;
  name: string;
  quantity: number;
  revenue: number;
  orderCount: number;
}

export interface CustomerInsights extends CustomerStats {
  averageOrderValue: number;
  totalOrderRevenue: number;
  openInvoiceTotal: number;
  topProducts: CustomerProductInsight[];
  paymentBreakdown: Partial<Record<PaymentMethod, number>>;
  orders: Order[];
  invoices: Invoice[];
  daysSinceLastOrder?: number;
  averageDaysBetweenOrders?: number;
}

function getChannel(order: Order): "pos" | "online" {
  if (order.channel) return order.channel;
  if (order.orderNumber.startsWith("POS-")) return "pos";
  return "online";
}

export function buildCustomerInsights(
  userId: string,
  orders: Order[],
  invoices: Invoice[]
): CustomerInsights {
  const stats = buildCustomerStats(userId, orders, invoices);
  const userOrders = orders
    .filter((o) => o.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const activeOrders = userOrders.filter((o) => o.status !== "cancelled");
  const userInvoices = invoices
    .filter((i) => i.userId === userId)
    .sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());

  const totalOrderRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue =
    activeOrders.length > 0 ? totalOrderRevenue / activeOrders.length : 0;

  const openInvoiceTotal = userInvoices
    .filter((i) => i.status === "sent")
    .reduce((sum, i) => sum + i.total, 0);

  const productMap = new Map<string, CustomerProductInsight>();
  for (const order of activeOrders) {
    const seenInOrder = new Set<string>();
    for (const item of order.items) {
      const key = item.productId || item.name;
      const existing = productMap.get(key) ?? {
        key,
        name: item.name,
        quantity: 0,
        revenue: 0,
        orderCount: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += item.grossAmount;
      if (!seenInOrder.has(key)) {
        existing.orderCount += 1;
        seenInOrder.add(key);
      }
      productMap.set(key, existing);
    }
  }

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const paymentBreakdown: Partial<Record<PaymentMethod, number>> = {};
  for (const order of activeOrders) {
    if (!order.paymentMethod) continue;
    paymentBreakdown[order.paymentMethod] =
      (paymentBreakdown[order.paymentMethod] ?? 0) + 1;
  }

  let daysSinceLastOrder: number | undefined;
  let averageDaysBetweenOrders: number | undefined;

  if (stats.lastOrderAt) {
    daysSinceLastOrder = Math.floor(
      (Date.now() - stats.lastOrderAt.getTime()) / (24 * 60 * 60 * 1000)
    );
  }

  if (activeOrders.length >= 2) {
    const sorted = [...activeOrders].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    let gapSum = 0;
    for (let i = 1; i < sorted.length; i++) {
      gapSum +=
        (sorted[i].createdAt.getTime() - sorted[i - 1].createdAt.getTime()) /
        (24 * 60 * 60 * 1000);
    }
    averageDaysBetweenOrders = Math.round(gapSum / (sorted.length - 1));
  }

  return {
    ...stats,
    averageOrderValue,
    totalOrderRevenue,
    openInvoiceTotal,
    topProducts,
    paymentBreakdown,
    orders: userOrders,
    invoices: userInvoices,
    daysSinceLastOrder,
    averageDaysBetweenOrders,
  };
}

export function getCustomerChannelLabel(order: Order) {
  return getChannel(order) === "pos" ? "Kassa" : "Webshop";
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Bar",
  card: "Karte",
  bank_transfer: "Überweisung",
};

export const INVOICE_STATUS_LABELS: Record<Invoice["status"], string> = {
  draft: "Entwurf",
  sent: "Offen",
  paid: "Bezahlt",
  cancelled: "Storniert",
};

export const ORDER_STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Ausstehend",
  confirmed: "Bestätigt",
  processing: "In Bearbeitung",
  shipped: "Versendet",
  delivered: "Zugestellt",
  cancelled: "Storniert",
};

export function formatCustomerSummary(user: User, insights: CustomerInsights) {
  const parts: string[] = [];
  if (insights.orderCount > 0) {
    parts.push(`${insights.orderCount} Bestellung(en)`);
  }
  if (insights.posOrderCount > 0 && insights.onlineOrderCount > 0) {
    parts.push(`${insights.posOrderCount} POS · ${insights.onlineOrderCount} Webshop`);
  }
  return parts.join(" · ") || "Noch keine Bestellungen";
}
