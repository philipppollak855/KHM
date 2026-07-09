import { formatPrice } from "@/lib/firestore";
import type { OrderTotals } from "@/lib/types";

interface OrderSummaryProps {
  totals: OrderTotals;
  showFreeShippingHint?: boolean;
  freeFrom?: number;
}

export default function OrderSummary({
  totals,
  showFreeShippingHint,
  freeFrom,
}: OrderSummaryProps) {
  return (
    <div className="space-y-2 text-sm">
      {totals.items.map((item) => (
        <div key={item.productId} className="flex justify-between text-wood/70">
          <span>
            {item.quantity}× {item.name}
          </span>
          <span>{formatPrice(item.grossAmount)}</span>
        </div>
      ))}

      <div className="border-t border-wood/10 pt-3 space-y-1.5">
        <div className="flex justify-between text-wood/60">
          <span>Netto</span>
          <span>{formatPrice(totals.subtotalNet)}</span>
        </div>
        {totals.taxBreakdown.map((line) => (
          <div key={line.rate} className="flex justify-between text-wood/60">
            <span>USt. {line.rate} %</span>
            <span>{formatPrice(line.tax)}</span>
          </div>
        ))}
        <div className="flex justify-between text-wood/60">
          <span>Versand</span>
          <span>
            {totals.shipping === 0 ? "Kostenlos" : formatPrice(totals.shipping)}
          </span>
        </div>
        {showFreeShippingHint &&
          freeFrom &&
          totals.subtotalGross < freeFrom &&
          totals.shipping > 0 && (
            <p className="text-xs text-moss">
              Noch {formatPrice(freeFrom - totals.subtotalGross)} bis kostenloser Versand
            </p>
          )}
        <div className="flex justify-between text-lg font-semibold text-wood-dark pt-2 border-t border-wood/10">
          <span>Gesamt (brutto)</span>
          <span>{formatPrice(totals.total)}</span>
        </div>
      </div>
    </div>
  );
}
