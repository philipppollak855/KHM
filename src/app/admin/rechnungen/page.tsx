"use client";

import { useEffect, useState, useMemo } from "react";
import { getInvoices, updateInvoiceStatus, formatPrice, formatDate } from "@/lib/firestore";
import { downloadInvoicePdf } from "@/lib/documents/download";
import type { Invoice } from "@/lib/types";
import DownloadButton from "@/components/documents/DownloadButton";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import { matchesSearch } from "@/lib/search";

const statusLabels: Record<Invoice["status"], string> = {
  draft: "Entwurf",
  sent: "Versendet",
  paid: "Bezahlt",
  cancelled: "Storniert",
};

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");

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

  const handleStatusChange = async (id: string, status: Invoice["status"]) => {
    await updateInvoiceStatus(id, status);
    await load();
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-light text-wood-dark mb-2">Rechnungen</h1>
      <p className="text-stone text-sm mb-6">Rechnungen verwalten und als PDF herunterladen</p>

      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Rechnungsnr., Bestellnr., Kunde…"
        resultCount={filteredInvoices.length}
        totalCount={invoices.length}
      />

      <div className="bg-cream border border-wood/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-wood/5">
            <tr>
              <th className="text-left p-4">Nr.</th>
              <th className="text-left p-4">Kunde</th>
              <th className="text-left p-4">Bestellung</th>
              <th className="text-left p-4">Datum</th>
              <th className="text-left p-4">Betrag</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">PDF</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="border-t border-wood/10">
                <td className="p-4 font-medium">{inv.invoiceNumber}</td>
                <td className="p-4">
                  <p>{inv.customerName}</p>
                  <p className="text-xs text-stone">{inv.customerEmail}</p>
                </td>
                <td className="p-4 text-stone">{inv.orderNumber}</td>
                <td className="p-4">{formatDate(inv.issuedAt)}</td>
                <td className="p-4 font-medium">{formatPrice(inv.total)}</td>
                <td className="p-4">
                  <select
                    value={inv.status}
                    onChange={(e) => handleStatusChange(inv.id, e.target.value as Invoice["status"])}
                    className="rounded border border-wood/20 bg-linen px-2 py-1 text-xs"
                  >
                    {Object.entries(statusLabels).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </td>
                <td className="p-4 text-right">
                  <DownloadButton
                    label="PDF"
                    onClick={() => downloadInvoicePdf(inv.id)}
                  />
                </td>
              </tr>
            ))}
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
    </div>
  );
}
