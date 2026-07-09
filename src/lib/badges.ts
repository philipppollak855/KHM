import type { Invoice, Order, PaymentMethod, User } from "@/lib/types";
import { isGuestUserId } from "@/lib/guest-order";

export type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "pos"
  | "online";

export interface BadgeItem {
  key: string;
  label: string;
  tone: BadgeTone;
  title?: string;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Bar",
  card: "Karte",
  bank_transfer: "Überweisung",
  qr_transfer: "QR-Überweisung",
};

const ORDER_STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Ausstehend",
  confirmed: "Bestätigt",
  processing: "In Bearbeitung",
  shipped: "Versendet",
  delivered: "Zugestellt",
  cancelled: "Storniert",
};

function isWalkInUserId(userId: string) {
  return userId.startsWith("pos-walkin-");
}

function isPickupOrder(order: Order) {
  return (
    order.shippingAddress?.street === "Abholung vor Ort" ||
    (order.channel === "pos" && (order.shipping ?? 0) === 0)
  );
}

function getChannel(order: Order): Order["channel"] {
  if (order.channel) return order.channel;
  if (order.orderNumber.startsWith("POS-")) return "pos";
  return "online";
}

export function getOrderBadges(order: Order, invoice?: Invoice | null): BadgeItem[] {
  const badges: BadgeItem[] = [];
  const channel = getChannel(order);

  badges.push({
    key: "channel",
    label: channel === "pos" ? "POS" : "Webshop",
    tone: channel === "pos" ? "pos" : "online",
    title: channel === "pos" ? "Verkauf über Kassa" : "Online-Bestellung",
  });

  if (order.isGuest || isGuestUserId(order.userId)) {
    badges.push({
      key: "guest",
      label: "Gast",
      tone: "info",
      title: "Gastbestellung ohne Kundenkonto",
    });
  }

  if (order.paymentMethod) {
    badges.push({
      key: "payment",
      label: PAYMENT_LABELS[order.paymentMethod],
      tone: order.paymentMethod === "bank_transfer" ? "warning" : "neutral",
      title: "Zahlungsart",
    });
  }

  if (invoice) {
    if (invoice.status === "paid") {
      badges.push({
        key: "paid",
        label: "Bezahlt",
        tone: "success",
        title: "Rechnung bezahlt",
      });
    } else if (invoice.status === "sent") {
      const overdue = invoice.dueAt < new Date();
      badges.push({
        key: overdue ? "overdue" : "open",
        label: overdue ? "Überfällig" : "Zahlung offen",
        tone: overdue ? "danger" : "warning",
        title: overdue
          ? `Fällig seit ${invoice.dueAt.toLocaleDateString("de-AT")}`
          : `Fällig am ${invoice.dueAt.toLocaleDateString("de-AT")}`,
      });
    } else if (invoice.status === "cancelled") {
      badges.push({
        key: "invoice-cancelled",
        label: "Rechnung storniert",
        tone: "neutral",
      });
    }
  } else if (
    order.paymentMethod === "cash" ||
    order.paymentMethod === "card" ||
    order.paymentMethod === "qr_transfer"
  ) {
    badges.push({
      key: "paid-implicit",
      label: "Bezahlt",
      tone: "success",
      title: "Sofortzahlung POS",
    });
  }

  if (order.status === "cancelled") {
    badges.push({
      key: "cancelled",
      label: "Storniert",
      tone: "danger",
    });
  } else if (order.status !== "delivered") {
    badges.push({
      key: "status",
      label: ORDER_STATUS_LABELS[order.status],
      tone:
        order.status === "shipped"
          ? "info"
          : order.status === "pending"
            ? "warning"
            : "neutral",
      title: "Auftragsstatus",
    });
  }

  if (isWalkInUserId(order.userId)) {
    badges.push({
      key: "walkin",
      label: "Verkauf vor Ort",
      tone: "neutral",
      title: "Kein Kundenkonto",
    });
  }

  badges.push({
    key: "fulfillment",
    label: isPickupOrder(order) ? "Abholung" : "Versand",
    tone: isPickupOrder(order) ? "pos" : "online",
    title: isPickupOrder(order) ? "Abholung vor Ort" : "Lieferung/Versand",
  });

  if ((order.shipping ?? 0) > 0) {
    badges.push({
      key: "shipping-cost",
      label: "Versandkosten",
      tone: "neutral",
      title: `Versand: € ${order.shipping.toFixed(2)}`,
    });
  }

  if (order.stockDeducted) {
    badges.push({
      key: "stock",
      label: "Lager −",
      tone: "info",
      title: "Lagerbestand abgebucht",
    });
  }

  if (order.stockRestocked) {
    badges.push({
      key: "restock",
      label: "Lager +",
      tone: "success",
      title: "Lager zurückgebucht",
    });
  }

  return badges;
}

export interface CustomerStats {
  orderCount: number;
  posOrderCount: number;
  onlineOrderCount: number;
  openInvoiceCount: number;
  overdueInvoiceCount: number;
  paidInvoiceCount: number;
  totalSpent: number;
  lastOrderAt?: Date;
}

export function buildCustomerStats(
  userId: string,
  orders: Order[],
  invoices: Invoice[]
): CustomerStats {
  const userOrders = orders.filter((o) => o.userId === userId && o.status !== "cancelled");
  const userInvoices = invoices.filter((i) => i.userId === userId);

  const openInvoices = userInvoices.filter((i) => i.status === "sent");
  const now = new Date();

  return {
    orderCount: userOrders.length,
    posOrderCount: userOrders.filter((o) => getChannel(o) === "pos").length,
    onlineOrderCount: userOrders.filter((o) => getChannel(o) === "online").length,
    openInvoiceCount: openInvoices.length,
    overdueInvoiceCount: openInvoices.filter((i) => i.dueAt < now).length,
    paidInvoiceCount: userInvoices.filter((i) => i.status === "paid").length,
    totalSpent: userInvoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.total, 0),
    lastOrderAt: userOrders[0]?.createdAt,
  };
}

export function getCustomerBadges(user: User, stats?: CustomerStats): BadgeItem[] {
  const badges: BadgeItem[] = [];

  if (stats) {
    if (stats.posOrderCount > 0) {
      badges.push({
        key: "pos",
        label: stats.posOrderCount === 1 ? "POS" : `POS · ${stats.posOrderCount}`,
        tone: "pos",
        title: "Einkäufe über Kassa",
      });
    }
    if (stats.onlineOrderCount > 0) {
      badges.push({
        key: "online",
        label:
          stats.onlineOrderCount === 1 ? "Webshop" : `Webshop · ${stats.onlineOrderCount}`,
        tone: "online",
        title: "Online-Bestellungen",
      });
    }
    if (stats.orderCount >= 5) {
      badges.push({
        key: "regular",
        label: "Stammkunde",
        tone: "success",
        title: `${stats.orderCount} Bestellungen`,
      });
    } else if (stats.orderCount > 0) {
      badges.push({
        key: "orders",
        label: `${stats.orderCount} Bestellung${stats.orderCount === 1 ? "" : "en"}`,
        tone: "neutral",
      });
    }
    if (stats.overdueInvoiceCount > 0) {
      badges.push({
        key: "overdue",
        label: "Überfällig",
        tone: "danger",
        title: `${stats.overdueInvoiceCount} überfällige Rechnung(en)`,
      });
    } else if (stats.openInvoiceCount > 0) {
      badges.push({
        key: "open",
        label: "Offen",
        tone: "warning",
        title: `${stats.openInvoiceCount} offene Rechnung(en)`,
      });
    }
    if (stats.paidInvoiceCount > 0 && stats.openInvoiceCount === 0) {
      badges.push({
        key: "paid",
        label: "Ausgeglichen",
        tone: "success",
        title: "Keine offenen Rechnungen",
      });
    }
  }

  const daysSinceReg = Math.floor(
    (Date.now() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (daysSinceReg <= 30) {
    badges.push({
      key: "new",
      label: "Neu",
      tone: "info",
      title: `Registriert vor ${daysSinceReg} Tag(en)`,
    });
  }

  if (user.address?.street && user.address?.city && user.address?.zip) {
    badges.push({
      key: "address",
      label: "Adresse",
      tone: "neutral",
      title: "Lieferadresse hinterlegt",
    });
  } else {
    badges.push({
      key: "no-address",
      label: "Ohne Adresse",
      tone: "warning",
      title: "Keine vollständige Adresse",
    });
  }

  if (!user.phone) {
    badges.push({
      key: "no-phone",
      label: "Ohne Telefon",
      tone: "neutral",
    });
  }

  return badges;
}

export function getInvoiceBadges(invoice: Invoice): BadgeItem[] {
  const badges: BadgeItem[] = [];

  if (invoice.paymentMethod) {
    badges.push({
      key: "payment",
      label: PAYMENT_LABELS[invoice.paymentMethod],
      tone: "neutral",
    });
  }

  const channel =
    invoice.orderNumber.startsWith("POS-") ? "pos" : "online";
  badges.push({
    key: "channel",
    label: channel === "pos" ? "POS" : "Webshop",
    tone: channel === "pos" ? "pos" : "online",
  });

  if (invoice.status === "sent" && invoice.dueAt < new Date()) {
    badges.push({ key: "overdue", label: "Überfällig", tone: "danger" });
  }

  if ((invoice.reminderLevel || 0) > 0) {
    const labels = ["", "Erinnerung", "1. Mahnung", "2. Mahnung"];
    badges.push({
      key: "reminder",
      label: labels[invoice.reminderLevel || 0] || "Mahnung",
      tone: "warning",
    });
  }

  return badges;
}
