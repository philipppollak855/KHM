"use client";

import { useEffect, useState } from "react";
import { getShippingZones } from "@/lib/firestore";
import { calculateShipping } from "@/lib/shipping";
import { calculateOrderTotals } from "@/lib/pricing";
import type { CartItem } from "@/lib/types";
import type { ShippingZone } from "@/lib/types";

export function useOrderCalculation(
  items: CartItem[],
  country: string,
  zip: string,
  distanceKm = 0
) {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShippingZones()
      .then(setZones)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const orderItems = calculateOrderTotals(items, 0);
  const shipping = calculateShipping(
    zones,
    orderItems.subtotalGross,
    country,
    zip,
    distanceKm
  );
  const totals = calculateOrderTotals(items, shipping);

  return { totals, zones, loading };
}
