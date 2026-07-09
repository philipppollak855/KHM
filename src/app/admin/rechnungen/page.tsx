"use client";

import { useEffect, useState } from "react";
import { getInvoices, updateInvoiceStatus, formatPrice, formatDate } from "@/lib/firestore";
import { downloadInvoicePdf } from "@/lib/documents/download";
import type { Invoice } from "@/lib/types";
import DownloadButton from "@/components/documents/DownloadButton";

const statusLabels: Record<Invoice["status"], string> = {
  draft: "Entwurf",
  sent: "Versendet",
  paid: "Bezahlt",
  cancelled: "Storniert",
};

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const load = async () => setInvoices(await getInvoices());

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleStatusChange = async (id: string, status: Invoice["status"]) => {
    await updateInvoiceStatus(id, status);
    await load();
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-light text-wood-dark mb-8">Rechnungen</h1>

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
            {invoices.map((inv) => (
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
            {invoices.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-stone">Noch keine Rechnungen.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
