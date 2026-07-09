"use client";

import { useEffect, useState } from "react";
import { QrCode, Loader2 } from "lucide-react";
import {
  buildEpcQrPayload,
  formatIbanDisplay,
} from "@/lib/payments/epc-qr";
import { formatPrice } from "@/lib/firestore";

interface PosQrPaymentProps {
  amount: number;
  beneficiaryName: string;
  iban: string;
  bic?: string;
  bankName?: string;
  reference: string;
}

export default function PosQrPayment({
  amount,
  beneficiaryName,
  iban,
  bic,
  bankName,
  reference,
}: PosQrPaymentProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function renderQr() {
      setError("");
      setQrDataUrl(null);
      try {
        const QRCode = (await import("qrcode")).default;
        const payload = buildEpcQrPayload({
          beneficiaryName,
          iban,
          bic,
          amount,
          remittanceText: reference,
        });
        const url = await QRCode.toDataURL(payload, {
          width: 560,
          margin: 2,
          errorCorrectionLevel: "M",
        });
        if (!cancelled) setQrDataUrl(url);
      } catch {
        if (!cancelled) setError("QR-Code konnte nicht erzeugt werden.");
      }
    }

    void renderQr();
    return () => {
      cancelled = true;
    };
  }, [amount, beneficiaryName, iban, bic, reference]);

  return (
    <div className="w-full max-w-lg space-y-5">
      <div className="flex flex-col items-center">
        <div className="flex h-[min(72vw,20rem)] w-[min(72vw,20rem)] items-center justify-center rounded-2xl border-4 border-forest/20 bg-white p-3 shadow-lg">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="SEPA-Überweisungs-QR-Code"
              className="h-full w-full object-contain"
            />
          ) : error ? (
            <div className="flex flex-col items-center gap-2 px-4 text-center text-sm text-red-600">
              <QrCode className="h-10 w-10 opacity-50" />
              {error}
            </div>
          ) : (
            <Loader2 className="h-10 w-10 animate-spin text-forest" />
          )}
        </div>
        <p className="mt-3 text-sm text-stone">Kunde scannt mit der Banking-App</p>
      </div>

      <div className="rounded-xl border border-wood/15 bg-white p-4 text-left text-sm space-y-2">
        <div className="flex justify-between gap-3">
          <span className="text-stone">Betrag</span>
          <span className="font-semibold text-forest">{formatPrice(amount)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-stone">Empfänger</span>
          <span className="font-medium text-right">{beneficiaryName}</span>
        </div>
        {bankName && (
          <div className="flex justify-between gap-3">
            <span className="text-stone">Bank</span>
            <span className="text-right">{bankName}</span>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <span className="text-stone">IBAN</span>
          <span className="font-mono text-xs text-right break-all">
            {formatIbanDisplay(iban)}
          </span>
        </div>
        {bic && (
          <div className="flex justify-between gap-3">
            <span className="text-stone">BIC</span>
            <span className="font-mono text-xs">{bic}</span>
          </div>
        )}
        <div className="border-t border-wood/10 pt-2">
          <p className="text-stone text-xs mb-1">Verwendungszweck</p>
          <p className="font-mono text-xs break-all">{reference}</p>
        </div>
      </div>
    </div>
  );
}
