"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getInvoicesByUser, formatPrice, formatDate } from "@/lib/firestore";
import { downloadInvoicePdf } from "@/lib/documents/download";
import type { Invoice } from "@/lib/types";
import PageHeader from "@/components/layout/PageHeader";
import DownloadButton from "@/components/documents/DownloadButton";

const statusLabels: Record<Invoice["status"], string> = {
  draft: "Entwurf",
  sent: "Versendet",
  paid: "Bezahlt",
  cancelled: "Storniert",
};

export default function CustomerInvoicesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      getInvoicesByUser(user.id)
        .then(setInvoices)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/konto" className="inline-flex items-center gap-1 text-forest text-sm mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Zurück zum Konto
      </Link>

      <PageHeader label="Kundenbereich" title="Meine Rechnungen" description="Rechnungen mit Briefkopf als PDF herunterladen." />

      {loading ? (
        <p className="text-stone">Laden...</p>
      ) : invoices.length > 0 ? (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div key={inv.id} className="p-6 bg-linen border border-wood/10">
              <div className="flex flex-wrap justify-between gap-4 mb-3">
                <div>
                  <p className="font-display text-lg text-wood-dark">{inv.invoiceNumber}</p>
                  <p className="text-sm text-stone">Bestellung {inv.orderNumber} · {formatDate(inv.issuedAt)}</p>
                </div>
                <span className="text-sm text-forest">{statusLabels[inv.status]}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="font-semibold text-wood-dark">{formatPrice(inv.total)}</p>
                <DownloadButton label="Rechnung PDF" onClick={() => downloadInvoicePdf(inv.id)} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-stone">Noch keine Rechnungen vorhanden.</p>
      )}
    </div>
  );
}
