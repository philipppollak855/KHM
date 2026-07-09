"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePwaRootGuard } from "@/hooks/usePwaBackNavigation";

export default function PwaRootGuard() {
  const pathname = usePathname() || "/";
  usePwaRootGuard(pathname);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty(
      "--pwa-safe-top",
      "env(safe-area-inset-top)"
    );
  }, []);

  return null;
}
