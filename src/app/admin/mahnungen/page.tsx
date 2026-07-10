"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getInvoices, getOrders, formatPrice, formatDate } from "@/lib/firestore";
import { sendInvoiceReminder } from "@/lib/admin-api";
import { getInvoiceListHref } from "@/lib/admin-invoice-filters";
import { useTeamDataFilters } from "@/hooks/useTeamDataFilters";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import type { Invoice } from "@/lib/types";

const reminderLabels = ["Keine", "Zahlungserinnerung", "1. Mahnung", "2. Mahnung"];

export default function AdminDunningPage() {
  const { filterInvoices } = useTeamDataFilters();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  const load = async () => {
    const [all, orderList] = await Promise.all([getInvoices(), getOrders()]);
    setInvoices(
      filterInvoices(all, orderList)
        .filter((i) => i.status === "sent")
        .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())
    );
  };

  useEffect(() => {
    load().catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleRemind = async (invoiceId: string) => {
    setActionId(invoiceId);
    setMessage("");
    setMessageIsError(false);
    try {
      const result = await sendInvoiceReminder(invoiceId);
      setMessage(`Mahnung Stufe ${result.reminderLevel} gesendet.`);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Fehler");
      setMessageIsError(true);
    } finally {
      setActionId(null);
    }
  };

  const overdue = invoices.filter((i) => i.dueAt < new Date());

  return (
    <div>
      <AdminPageHeader
        title="Mahnwesen"
        description="Automatische Mahnungen laufen täglich per Cron. Hier können Mahnungen manuell ausgelöst werden."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <Link
          href={getInvoiceListHref("open")}
          className="bg-cream border border-wood/10 p-4 rounded-lg hover:border-amber-300 hover:bg-amber-50/40 transition-colors"
        >
          <p className="text-xs text-stone uppercase">Offene Rechnungen</p>
          <p className="text-2xl font-display">{invoices.length}</p>
          <p className="text-[10px] text-stone mt-2">In Rechnungen anzeigen →</p>
        </Link>
        <Link
          href={getInvoiceListHref("overdue")}
          className="bg-cream border border-wood/10 p-4 rounded-lg hover:border-red-300 hover:bg-red-50/40 transition-colors"
        >
          <p className="text-xs text-stone uppercase">Überfällig</p>
          <p className="text-2xl font-display text-red-700">{overdue.length}</p>
          <p className="text-[10px] text-stone mt-2">In Rechnungen anzeigen →</p>
        </Link>
      </div>

      {message && (
        <p
          className={`text-sm mb-4 p-3 border ${
            messageIsError
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-forest/10 text-forest border-forest/20"
          }`}
        >
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-stone">Laden…</p>
      ) : overdue.length > 0 ? (
        <div className="space-y-3">
          {overdue.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-cream border border-wood/10 rounded-lg"
            >
              <div>
                <p className="font-medium">{inv.invoiceNumber}</p>
                <p className="text-sm text-stone">
                  {inv.customerName} · {formatPrice(inv.total)} · Fällig {formatDate(inv.dueAt)}
                </p>
                <p className="text-xs text-stone mt-1">
                  Mahnstufe: {reminderLabels[inv.reminderLevel || 0]}
                  {inv.lastReminderAt && ` · Zuletzt ${formatDate(inv.lastReminderAt)}`}
                </p>
              </div>
              <button
                onClick={() => handleRemind(inv.id)}
                disabled={actionId === inv.id}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-forest text-linen text-sm disabled:opacity-50 rounded-lg"
              >
                {actionId === inv.id ? "Senden…" : "Mahnung senden"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-stone">Keine überfälligen Rechnungen.</p>
      )}
    </div>
  );
}
