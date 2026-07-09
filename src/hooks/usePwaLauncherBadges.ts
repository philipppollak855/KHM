"use client";

import { useEffect, useState } from "react";
import {
  getContactInquiries,
  getInvoices,
  getOrders,
  getProducts,
} from "@/lib/firestore";
import type { PermissionModule } from "@/lib/types";
import { LOW_STOCK_THRESHOLD } from "@/lib/types";

export type PwaLauncherBadgeMap = Record<string, number>;

export function usePwaLauncherBadges(
  canRead: (module: PermissionModule) => boolean
) {
  const [badges, setBadges] = useState<PwaLauncherBadgeMap>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const next: PwaLauncherBadgeMap = {};
      const tasks: Promise<void>[] = [];

      if (canRead("orders")) {
        tasks.push(
          getOrders().then((orders) => {
            const open = orders.filter((order) =>
              ["pending", "confirmed", "processing"].includes(order.status)
            ).length;
            next["/admin/bestellungen"] = open;
            next["/admin"] = open;
          })
        );
      }

      if (canRead("contactInquiries")) {
        tasks.push(
          getContactInquiries().then((inquiries) => {
            next["/admin/kontaktanfragen"] = inquiries.filter(
              (inquiry) => inquiry.status === "new"
            ).length;
          })
        );
      }

      if (canRead("invoices")) {
        tasks.push(
          getInvoices().then((invoices) => {
            const open = invoices.filter((invoice) => invoice.status === "sent");
            next["/admin/rechnungen"] = open.length;

            if (canRead("dunning")) {
              const now = Date.now();
              next["/admin/mahnungen"] = open.filter(
                (invoice) => invoice.dueAt.getTime() < now
              ).length;
            }
          })
        );
      }

      if (canRead("inventory") || canRead("products")) {
        tasks.push(
          getProducts().then((products) => {
            const lowStock = products.filter(
              (product) => product.active && product.stock <= LOW_STOCK_THRESHOLD
            ).length;
            if (canRead("inventory")) {
              next["/admin/lager"] = lowStock;
            }
            if (canRead("products")) {
              next["/admin/produkte"] = lowStock;
            }
          })
        );
      }

      await Promise.all(tasks);

      const dashboardTotal =
        (next["/admin/bestellungen"] ?? 0) +
        (next["/admin/kontaktanfragen"] ?? 0) +
        (next["/admin/mahnungen"] ?? 0);
      if (dashboardTotal > 0) {
        next["/admin"] = dashboardTotal;
      }

      if (!cancelled) {
        setBadges(next);
      }
    }

    load().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [canRead]);

  return badges;
}
