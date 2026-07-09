import type { CartItem, OrderItem, TaxBreakdownLine } from "./types";
import { getCartDisplayName } from "./product-variants";

/** Verkaufspreis aus EK + prozentualem und/oder festem Aufschlag */
export function calculateSellingPrice(
  costPrice: number,
  markupPercent = 0,
  markupFixed = 0
): number {
  const withPercent = costPrice * (1 + markupPercent / 100);
  return roundCurrency(withPercent + markupFixed);
}

/** Steueranteil aus Bruttopreis (AT: Preise inkl. USt.) */
export function taxFromGross(gross: number, taxRate: number): number {
  if (taxRate <= 0) return 0;
  return roundCurrency(gross * (taxRate / (100 + taxRate)));
}

export function netFromGross(gross: number, taxRate: number): number {
  return roundCurrency(gross - taxFromGross(gross, taxRate));
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function buildOrderItem(
  productId: string,
  name: string,
  grossUnitPrice: number,
  quantity: number,
  taxRate: number,
  variantId?: string
): OrderItem {
  const grossAmount = roundCurrency(grossUnitPrice * quantity);
  const taxAmount = taxFromGross(grossAmount, taxRate);
  const netAmount = roundCurrency(grossAmount - taxAmount);
  return {
    productId,
    ...(variantId ? { variantId } : {}),
    name,
    price: grossUnitPrice,
    quantity,
    taxRate,
    netAmount,
    taxAmount,
    grossAmount,
  };
}

export function buildOrderItemsFromCart(items: CartItem[]): OrderItem[] {
  return items.map((i) =>
    buildOrderItem(
      i.productId,
      getCartDisplayName(i),
      i.price,
      i.quantity,
      i.taxRate ?? 20,
      i.variantId
    )
  );
}

export function aggregateTaxBreakdown(items: OrderItem[]): TaxBreakdownLine[] {
  const map = new Map<number, TaxBreakdownLine>();

  for (const item of items) {
    const existing = map.get(item.taxRate) ?? {
      rate: item.taxRate,
      net: 0,
      tax: 0,
      gross: 0,
    };
    existing.net = roundCurrency(existing.net + item.netAmount);
    existing.tax = roundCurrency(existing.tax + item.taxAmount);
    existing.gross = roundCurrency(existing.gross + item.grossAmount);
    map.set(item.taxRate, existing);
  }

  return Array.from(map.values()).sort((a, b) => b.rate - a.rate);
}

export function calculateOrderTotals(
  cartItems: CartItem[],
  shipping: number
): {
  items: OrderItem[];
  subtotalNet: number;
  subtotalGross: number;
  taxTotal: number;
  taxBreakdown: TaxBreakdownLine[];
  shipping: number;
  total: number;
} {
  const items = buildOrderItemsFromCart(cartItems);
  const subtotalGross = roundCurrency(
    items.reduce((s, i) => s + i.grossAmount, 0)
  );
  const subtotalNet = roundCurrency(items.reduce((s, i) => s + i.netAmount, 0));
  const taxTotal = roundCurrency(items.reduce((s, i) => s + i.taxAmount, 0));
  const taxBreakdown = aggregateTaxBreakdown(items);
  const total = roundCurrency(subtotalGross + shipping);

  return {
    items,
    subtotalNet,
    subtotalGross,
    taxTotal,
    taxBreakdown,
    shipping,
    total,
  };
}

export const TAX_RATES_AT = [
  { value: 20, label: "20 % (Normalsteuersatz)" },
  { value: 13, label: "13 % (ermäßigt)" },
  { value: 10, label: "10 % (ermäßigt)" },
  { value: 0, label: "0 % (steuerfrei)" },
];
