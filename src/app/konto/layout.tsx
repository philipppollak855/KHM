"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useIsStandalonePwa } from "@/hooks/useIsStandalonePwa";
import { getAdminHomePath } from "@/lib/auth-redirect";

export default function KontoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isPwa = useIsStandalonePwa();

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      router.replace(getAdminHomePath({ pwa: isPwa }));
    }
  }, [user, loading, router, isPwa]);

  if (!loading && user?.role === "admin") {
    return null;
  }

  return <>{children}</>;
}
