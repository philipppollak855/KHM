"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getOrdersByUser, formatPrice, formatDate } from "@/lib/firestore";
import { downloadOrderConfirmationPdf, downloadDeliveryNotePdf } from "@/lib/documents/download";
import type { Order } from "@/lib/types";
import PageHeader from "@/components/layout/PageHeader";
import DownloadButton from "@/components/documents/DownloadButton";

const statusLabels: Record<Order["status"], string> = {
  pending: "Ausstehend",
  confirmed: "Bestätigt",
  processing: "In Bearbeitung",
  shipped: "Versendet",
  delivered: "Zugestellt",
  cancelled: "Storniert",
};

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const orderNumber = searchParams.get("orderNumber");
  const newOrderId = searchParams.get("orderId");
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      getOrdersByUser(user.id)
        .then(setOrders)
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

      <PageHeader label="Kundenbereich" title="Meine Bestellungen" />

      {success && (
        <div className="mb-8 p-5 bg-green-50 border border-green-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-green-800">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Bestellung erfolgreich aufgegeben!</p>
              {orderNumber && <p className="text-sm mt-1">Auftragsnummer: {orderNumber}</p>}
              <p className="text-sm mt-1">Sie erhalten eine Auftragsbestätigung als PDF.</p>
            </div>
          </div>
          {newOrderId && (
            <DownloadButton
              label="Auftragsbestätigung PDF"
              onClick={() => downloadOrderConfirmationPdf(newOrderId)}
            />
          )}
        </div>
      )}

      {loading ? (
        <p className="text-stone">Laden...</p>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="p-6 bg-linen border border-wood/10">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="font-display text-lg text-wood-dark">{order.orderNumber}</p>
                  <p className="text-sm text-stone">{formatDate(order.createdAt)}</p>
                </div>
                <span className="text-sm text-forest font-medium">{statusLabels[order.status]}</span>
              </div>
              <div className="space-y-1 mb-4 text-sm text-stone">
                {order.items.map((item, i) => (
                  <p key={i}>{item.quantity}× {item.name} – {formatPrice(item.grossAmount)}</p>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-wood/10">
                <p className="font-semibold text-wood-dark">Gesamt: {formatPrice(order.total)}</p>
                <div className="flex gap-2">
                  <DownloadButton label="Auftragsbestätigung" onClick={() => downloadOrderConfirmationPdf(order.id)} />
                  {order.deliveryNoteId && (
                    <DownloadButton label="Lieferschein" onClick={() => downloadDeliveryNotePdf(order.deliveryNoteId!)} />
                  )}
                  {order.invoiceId && (
                    <Link href="/konto/rechnungen" className="text-sm text-forest hover:underline self-center">
                      Zur Rechnung →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-stone mb-4">Noch keine Bestellungen.</p>
          <Link href="/shop" className="text-forest hover:underline">Zur Kollektion</Link>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersContent />
    </Suspense>
  );
}
