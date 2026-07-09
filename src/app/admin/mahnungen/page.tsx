"use client";

import { useEffect, useState } from "react";
import { getInvoices, formatPrice, formatDate } from "@/lib/firestore";
import { sendInvoiceReminder } from "@/lib/admin-api";
import type { Invoice } from "@/lib/types";

const reminderLabels = ["Keine", "Zahlungserinnerung", "1. Mahnung", "2. Mahnung"];

export default function AdminDunningPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = async () => {
    const all = await getInvoices();
    setInvoices(
      all
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
    try {
      const result = await sendInvoiceReminder(invoiceId);
      setMessage(`Mahnung Stufe ${result.reminderLevel} gesendet.`);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Fehler");
    } finally {
      setActionId(null);
    }
  };

  const overdue = invoices.filter((i) => i.dueAt < new Date());

  return (
    <div>
      <h1 className="font-display text-3xl font-light text-wood-dark mb-2">Mahnwesen</h1>
      <p className="text-stone text-sm mb-6">
        Automatische Mahnungen laufen täglich per Cron. Hier können Mahnungen manuell ausgelöst werden.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-cream border border-wood/10 p-4">
          <p className="text-xs text-stone uppercase">Offene Rechnungen</p>
          <p className="text-2xl font-display">{invoices.length}</p>
        </div>
        <div className="bg-cream border border-wood/10 p-4">
          <p className="text-xs text-stone uppercase">Überfällig</p>
          <p className="text-2xl font-display text-red-700">{overdue.length}</p>
        </div>
      </div>

      {message && (
        <p className="text-sm mb-4 p-3 bg-forest/10 text-forest border border-forest/20">{message}</p>
      )}

      {loading ? (
        <p className="text-stone">Laden…</p>
      ) : overdue.length > 0 ? (
        <div className="space-y-3">
          {overdue.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4 bg-cream border border-wood/10"
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
                className="px-4 py-2 bg-forest text-linen text-sm disabled:opacity-50"
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
