"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { formatPrice, formatDate } from "@/lib/firestore";
import type { Invoice } from "@/lib/types";

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
      const q = query(
        collection(db, "invoices"),
        where("userId", "==", user.id),
        orderBy("issuedAt", "desc")
      );
      getDocs(q)
        .then((snap) =>
          setInvoices(
            snap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
              issuedAt: d.data().issuedAt?.toDate?.() || new Date(),
              dueAt: d.data().dueAt?.toDate?.() || new Date(),
              paidAt: d.data().paidAt?.toDate?.(),
            })) as Invoice[]
          )
        )
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/konto"
        className="inline-flex items-center gap-1 text-forest text-sm mb-6 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Zurück zum Konto
      </Link>

      <h1 className="font-display text-4xl font-bold text-wood-dark mb-8">
        Meine Rechnungen
      </h1>

      {loading ? (
        <p className="text-wood/60">Laden...</p>
      ) : invoices.length > 0 ? (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-6 bg-cream rounded-2xl border border-wood/10 shadow-sm"
            >
              <div className="flex flex-wrap justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-wood-dark">
                    {inv.invoiceNumber}
                  </p>
                  <p className="text-sm text-wood/60">
                    Ausgestellt: {formatDate(inv.issuedAt)}
                  </p>
                </div>
                <span className="text-sm font-medium text-forest">
                  {statusLabels[inv.status]}
                </span>
              </div>
              <p className="font-bold text-wood-dark">
                {formatPrice(inv.total)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-wood/60">Noch keine Rechnungen vorhanden.</p>
      )}
    </div>
  );
}
