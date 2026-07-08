"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getOrdersByUser, formatPrice, formatDate } from "@/lib/firestore";
import type { Order } from "@/lib/types";

const statusLabels: Record<Order["status"], string> = {
  pending: "Ausstehend",
  confirmed: "Bestätigt",
  processing: "In Bearbeitung",
  shipped: "Versendet",
  delivered: "Zugestellt",
  cancelled: "Storniert",
};

const statusColors: Record<Order["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
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
      <Link
        href="/konto"
        className="inline-flex items-center gap-1 text-forest text-sm mb-6 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Zurück zum Konto
      </Link>

      <h1 className="font-display text-4xl font-bold text-wood-dark mb-8">
        Meine Bestellungen
      </h1>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <p>Ihre Bestellung wurde erfolgreich aufgegeben. Vielen Dank!</p>
        </div>
      )}

      {loading ? (
        <p className="text-wood/60">Laden...</p>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-6 bg-cream rounded-2xl border border-wood/10 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="font-semibold text-wood-dark">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-wood/60">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}
                >
                  {statusLabels[order.status]}
                </span>
              </div>
              <div className="space-y-1 mb-4">
                {order.items.map((item, i) => (
                  <p key={i} className="text-sm text-wood/70">
                    {item.quantity}× {item.name} – {formatPrice(item.price * item.quantity)}
                  </p>
                ))}
              </div>
              <p className="font-bold text-forest text-lg">
                Gesamt: {formatPrice(order.total)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-wood/60 mb-4">Noch keine Bestellungen vorhanden.</p>
          <Link href="/shop" className="text-forest font-medium hover:underline">
            Zum Shop
          </Link>
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
