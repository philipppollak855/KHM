"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import PosQrPayment from "@/components/pos/PosQrPayment";
import { useCompanyBranding } from "@/context/CompanyBrandingContext";
import { formatPrice } from "@/lib/firestore";
import {
  clearGuestOrderConfirmation,
  readGuestOrderConfirmation,
  type GuestOrderConfirmation,
} from "@/lib/guest-order";

export default function GuestCheckoutSuccessPage() {
  const { company } = useCompanyBranding();
  const [order, setOrder] = useState<GuestOrderConfirmation | null>(null);

  useEffect(() => {
    const data = readGuestOrderConfirmation();
    setOrder(data);
    if (data) clearGuestOrderConfirmation();
  }, []);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <PageHeader
          title="Keine Bestellung gefunden"
          description="Diese Bestätigung ist nicht mehr verfügbar."
        />
        <Link href="/shop">
          <Button>Zur Kollektion</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <CheckCircle2 className="w-14 h-14 text-forest mx-auto mb-4" strokeWidth={1.5} />
        <PageHeader
          label={order.paymentMethod === "qr_transfer" ? "Zahlung" : "Gastbestellung"}
          title="Vielen Dank!"
          description={`Bestellung ${order.orderNumber} wurde aufgenommen. Bitte bezahlen Sie per QR-Code – danach bearbeiten wir Ihre Bestellung.`}
        />
      </div>

      <div className="rounded-xl border border-wood/10 bg-linen/50 p-5 mb-8 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-stone">Bestellnummer</span>
          <span className="font-medium">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-stone">Rechnungsnummer</span>
          <span className="font-medium">{order.invoiceNumber}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-stone">Betrag</span>
          <span className="font-semibold text-forest">{formatPrice(order.total)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-stone">E-Mail</span>
          <span className="text-right break-all">{order.email}</span>
        </div>
      </div>

      {company.iban?.trim() ? (
        <div className="flex justify-center mb-8">
          <PosQrPayment
            amount={order.total}
            beneficiaryName={company.name}
            iban={company.iban}
            bic={company.bic}
            bankName={company.bankName}
            reference={order.invoiceNumber}
          />
        </div>
      ) : (
        <p className="text-sm text-stone text-center mb-8">
          Bitte überweisen Sie {formatPrice(order.total)} mit Verwendungszweck{" "}
          <strong>{order.invoiceNumber}</strong>.
        </p>
      )}

      <p className="text-xs text-stone text-center mb-6">
        Eine Bestätigung wurde intern erfasst. Bei Fragen nennen Sie bitte Ihre Bestellnummer.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/shop">
          <Button variant="outline">Weiter einkaufen</Button>
        </Link>
        <Link href="/login">
          <Button>Konto erstellen / anmelden</Button>
        </Link>
      </div>
    </div>
  );
}
