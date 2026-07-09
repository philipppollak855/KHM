"use client";

import { useSyncExternalStore } from "react";
import { isStandalonePwa } from "@/lib/pwa-history";

function subscribePwaDisplayMode(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const mq = window.matchMedia("(display-mode: standalone)");
  mq.addEventListener("change", onStoreChange);
  window.addEventListener("resize", onStoreChange);

  return () => {
    mq.removeEventListener("change", onStoreChange);
    window.removeEventListener("resize", onStoreChange);
  };
}

function getPwaSnapshot() {
  return isStandalonePwa();
}

function getPwaServerSnapshot() {
  return false;
}

export function useIsStandalonePwa() {
  return useSyncExternalStore(
    subscribePwaDisplayMode,
    getPwaSnapshot,
    getPwaServerSnapshot
  );
}
