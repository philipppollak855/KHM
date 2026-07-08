"use client";

import { useEffect, useState } from "react";
import { getInvoices, updateInvoiceStatus, formatPrice, formatDate } from "@/lib/firestore";
import type { Invoice } from "@/lib/types";

const statusLabels: Record<Invoice["status"], string> = {
  draft: "Entwurf",
  sent: "Versendet",
  paid: "Bezahlt",
  cancelled: "Storniert",
};

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const load = async () => {
    setInvoices(await getInvoices());
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleStatusChange = async (id: string, status: Invoice["status"]) => {
    await updateInvoiceStatus(id, status);
    await load();
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-wood-dark mb-8">
        Rechnungen
      </h1>

      <div className="bg-cream rounded-2xl border border-wood/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-wood/5">
            <tr>
              <th className="text-left p-4 font-medium text-wood-dark">Nr.</th>
              <th className="text-left p-4 font-medium text-wood-dark">Kunde</th>
              <th className="text-left p-4 font-medium text-wood-dark">Datum</th>
              <th className="text-left p-4 font-medium text-wood-dark">Betrag</th>
              <th className="text-left p-4 font-medium text-wood-dark">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t border-wood/10">
                <td className="p-4 font-medium">{inv.invoiceNumber}</td>
                <td className="p-4">
                  <p>{inv.customerName}</p>
                  <p className="text-wood/60 text-xs">{inv.customerEmail}</p>
                </td>
                <td className="p-4">{formatDate(inv.issuedAt)}</td>
                <td className="p-4 font-medium">{formatPrice(inv.total)}</td>
                <td className="p-4">
                  <select
                    value={inv.status}
                    onChange={(e) =>
                      handleStatusChange(inv.id, e.target.value as Invoice["status"])
                    }
                    className="rounded-lg border-2 border-wood/20 bg-cream px-2 py-1 text-xs"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-wood/60">
                  Noch keine Rechnungen vorhanden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
