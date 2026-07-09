"use client";

import { useEffect, useState, useMemo } from "react";
import { getInvoices, formatPrice, formatDate } from "@/lib/firestore";
import { downloadInvoicePdf } from "@/lib/documents/download";
import { confirmInvoicePayment, sendInvoiceReminder } from "@/lib/admin-api";
import type { Invoice, PaymentMethod } from "@/lib/types";
import DownloadButton from "@/components/documents/DownloadButton";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import { matchesSearch } from "@/lib/search";

const statusLabels: Record<Invoice["status"], string> = {
  draft: "Entwurf",
  sent: "Offen",
  paid: "Bezahlt",
  cancelled: "Storniert",
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Bar",
  card: "Karte",
  bank_transfer: "Überweisung",
};

const reminderLabels = ["–", "Erinnerung", "1. Mahnung", "2. Mahnung"];

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => setInvoices(await getInvoices());

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((inv) =>
        matchesSearch(search, [
          inv.invoiceNumber,
          inv.orderNumber,
          inv.customerName,
          inv.customerEmail,
          statusLabels[inv.status],
          inv.total,
          formatPrice(inv.total),
        ])
      ),
    [invoices, search]
  );

  const openInvoices = filteredInvoices.filter((i) => i.status === "sent");
  const overdueInvoices = openInvoices.filter((i) => i.dueAt < new Date());

  const handleConfirmPayment = async (invoiceId: string) => {
    setActionLoading(invoiceId);
    setActionError("");
    try {
      await confirmInvoicePayment({
        invoiceId,
        reference: reference || undefined,
        notes: "Manuell bestätigt",
      });
      setConfirmingId(null);
      setReference("");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Fehler");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReminder = async (invoiceId: string) => {
    setActionLoading(invoiceId);
    setActionError("");
    try {
      await sendInvoiceReminder(invoiceId);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Fehler");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-light text-wood-dark mb-2">Rechnungen & Zahlungen</h1>
      <p className="text-stone text-sm mb-4">
        Offene Rechnungen bestätigen, Mahnungen senden und PDFs herunterladen
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-cream border border-wood/10 p-4">
          <p className="text-xs text-stone uppercase">Offen</p>
          <p className="text-2xl font-display text-wood-dark">{openInvoices.length}</p>
        </div>
        <div className="bg-cream border border-wood/10 p-4">
          <p className="text-xs text-stone uppercase">Überfällig</p>
          <p className="text-2xl font-display text-red-700">{overdueInvoices.length}</p>
        </div>
        <div className="bg-cream border border-wood/10 p-4">
          <p className="text-xs text-stone uppercase">Offener Betrag</p>
          <p className="text-2xl font-display text-wood-dark">
            {formatPrice(openInvoices.reduce((s, i) => s + i.total, 0))}
          </p>
        </div>
      </div>

      {actionError && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-100 p-3">{actionError}</p>
      )}

      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Rechnungsnr., Bestellnr., Kunde…"
        resultCount={filteredInvoices.length}
        totalCount={invoices.length}
      />

      <div className="bg-cream border border-wood/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-wood/5">
            <tr>
              <th className="text-left p-4">Nr.</th>
              <th className="text-left p-4">Kunde</th>
              <th className="text-left p-4">Datum / Fällig</th>
              <th className="text-left p-4">Betrag</th>
              <th className="text-left p-4">Zahlung</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => {
              const isOverdue = inv.status === "sent" && inv.dueAt < new Date();
              return (
                <tr key={inv.id} className="border-t border-wood/10">
                  <td className="p-4 font-medium">{inv.invoiceNumber}</td>
                  <td className="p-4">
                    <p>{inv.customerName}</p>
                    <p className="text-xs text-stone">{inv.customerEmail}</p>
                  </td>
                  <td className="p-4">
                    <p>{formatDate(inv.issuedAt)}</p>
                    <p className={`text-xs ${isOverdue ? "text-red-600" : "text-stone"}`}>
                      Fällig: {formatDate(inv.dueAt)}
                    </p>
                  </td>
                  <td className="p-4 font-medium">{formatPrice(inv.total)}</td>
                  <td className="p-4 text-stone">
                    {inv.paymentMethod ? paymentMethodLabels[inv.paymentMethod] : "–"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        inv.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : inv.status === "sent"
                            ? isOverdue
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                            : "bg-stone/10 text-stone"
                      }`}
                    >
                      {statusLabels[inv.status]}
                    </span>
                    {(inv.reminderLevel || 0) > 0 && (
                      <p className="text-xs text-stone mt-1">
                        {reminderLabels[inv.reminderLevel || 0]}
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <DownloadButton
                      label="PDF"
                      onClick={() => downloadInvoicePdf(inv.id)}
                    />
                    {inv.status === "sent" && (
                      <>
                        <button
                          onClick={() => setConfirmingId(confirmingId === inv.id ? null : inv.id)}
                          className="text-xs px-2 py-1 bg-forest text-linen rounded"
                        >
                          Zahlung bestätigen
                        </button>
                        <button
                          onClick={() => handleReminder(inv.id)}
                          disabled={actionLoading === inv.id}
                          className="text-xs px-2 py-1 border border-wood/20 rounded disabled:opacity-50"
                        >
                          Mahnen
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-stone">
                  {search ? "Keine Rechnungen gefunden." : "Noch keine Rechnungen."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirmingId && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-linen w-full max-w-md p-6 border border-wood/10">
            <h2 className="font-display text-xl mb-4">Zahlung bestätigen</h2>
            <input
              placeholder="Referenz / Überweisungs-ID (optional)"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full border border-wood/20 rounded px-3 py-2 text-sm mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleConfirmPayment(confirmingId)}
                disabled={actionLoading === confirmingId}
                className="flex-1 py-2.5 bg-forest text-linen disabled:opacity-50"
              >
                {actionLoading === confirmingId ? "Speichern…" : "Bestätigen"}
              </button>
              <button
                onClick={() => {
                  setConfirmingId(null);
                  setReference("");
                }}
                className="px-4 py-2.5 border border-wood/20"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
