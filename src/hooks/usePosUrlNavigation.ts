"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type PosView = "catalog" | "checkout" | "card_pending" | "qr_pending" | "success";

function parseView(step: string | null): PosView {
  if (step === "checkout") return "checkout";
  if (step === "card") return "card_pending";
  if (step === "qr") return "qr_pending";
  if (step === "success") return "success";
  return "catalog";
}

function viewToStep(view: PosView): string | null {
  if (view === "catalog") return null;
  if (view === "card_pending") return "card";
  if (view === "qr_pending") return "qr";
  return view;
}

export function usePosUrlNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const view = parseView(searchParams.get("step"));
  const cartOpen = searchParams.get("cart") === "1";
  const customerOpen = searchParams.get("customer") === "1";

  const setQuery = useCallback(
    (updates: Record<string, string | null>, replace = false) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) params.delete(key);
        else params.set(key, value);
      }
      const qs = params.toString();
      const href = qs ? `/pos?${qs}` : "/pos";
      if (replace) router.replace(href);
      else router.push(href);
    },
    [router, searchParams]
  );

  const setView = useCallback(
    (next: PosView, replace = false) => {
      const step = viewToStep(next);
      if (next === "catalog") {
        setQuery({ step: null, cart: null, customer: null }, true);
        return;
      }
      setQuery({ step }, replace);
    },
    [setQuery]
  );

  const setCartOpen = useCallback(
    (open: boolean) => {
      setQuery({ cart: open ? "1" : null }, !open);
    },
    [setQuery]
  );

  const setCustomerOpen = useCallback(
    (open: boolean) => {
      setQuery({ customer: open ? "1" : null }, !open);
    },
    [setQuery]
  );

  return useMemo(
    () => ({
      view,
      cartOpen,
      customerOpen,
      setView,
      setCartOpen,
      setCustomerOpen,
    }),
    [view, cartOpen, customerOpen, setView, setCartOpen, setCustomerOpen]
  );
}
