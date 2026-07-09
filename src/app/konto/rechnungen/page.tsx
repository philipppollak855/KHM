"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getInvoicesByUser, getCompanySettings, formatPrice, formatDate } from "@/lib/firestore";
import { downloadInvoicePdf } from "@/lib/documents/download";
import type { Invoice, CompanySettings } from "@/lib/types";
import PageHeader from "@/components/layout/PageHeader";
import DownloadButton from "@/components/documents/DownloadButton";

const statusLabels: Record<Invoice["status"], string> = {
  draft: "Entwurf",
  sent: "Offen – bitte überweisen",
  paid: "Bezahlt",
  cancelled: "Storniert",
};

export default function CustomerInvoicesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      Promise.all([getInvoicesByUser(user.id), getCompanySettings()])
        .then(([inv, comp]) => {
          setInvoices(inv);
          setCompany(comp);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || !user) return null;

  const openInvoices = invoices.filter((i) => i.status === "sent");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/konto" className="inline-flex items-center gap-1 text-forest text-sm mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Zurück zum Konto
      </Link>

      <PageHeader label="Kundenbereich" title="Meine Rechnungen" description="Rechnungen mit Briefkopf als PDF herunterladen." />

      {openInvoices.length > 0 && company && (
        <div className="mb-8 p-6 bg-amber-50 border border-amber-200">
          <p className="font-medium text-wood-dark mb-2">Offene Rechnungen – Zahlung per Überweisung</p>
          <p className="text-sm text-stone mb-3">
            Bitte überweisen Sie den offenen Betrag auf folgendes Konto. Als Verwendungszweck geben Sie die jeweilige Rechnungsnummer an.
          </p>
          <p className="text-sm">
            <strong>{company.bankName}</strong><br />
            IBAN: {company.iban}<br />
            BIC: {company.bic}
          </p>
        </div>
      )}

      {loading ? (
        <p className="text-stone">Laden...</p>
      ) : invoices.length > 0 ? (
        <div className="space-y-4">
          {invoices.map((inv) => {
            const isOpen = inv.status === "sent";
            const isOverdue = isOpen && inv.dueAt < new Date();
            return (
              <div
                key={inv.id}
                className={`p-6 bg-linen border ${isOverdue ? "border-red-300" : "border-wood/10"}`}
              >
                <div className="flex flex-wrap justify-between gap-4 mb-3">
                  <div>
                    <p className="font-display text-lg text-wood-dark">{inv.invoiceNumber}</p>
                    <p className="text-sm text-stone">
                      Bestellung {inv.orderNumber} · {formatDate(inv.issuedAt)}
                    </p>
                    {isOpen && (
                      <p className={`text-sm mt-1 ${isOverdue ? "text-red-600" : "text-stone"}`}>
                        Fällig am {formatDate(inv.dueAt)}
                      </p>
                    )}
                  </div>
                  <span className={`text-sm ${isOpen ? "text-amber-700" : "text-forest"}`}>
                    {statusLabels[inv.status]}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="font-semibold text-wood-dark">{formatPrice(inv.total)}</p>
                  <DownloadButton label="Rechnung PDF" onClick={() => downloadInvoicePdf(inv.id)} />
                </div>
                {isOpen && company && (
                  <p className="text-xs text-stone mt-3">
                    Verwendungszweck: <strong>{inv.invoiceNumber}</strong>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-stone">Noch keine Rechnungen vorhanden.</p>
      )}
    </div>
  );
}
