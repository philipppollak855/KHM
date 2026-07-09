"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PwaRootGuard from "@/components/pwa/PwaRootGuard";
import PwaBottomNav from "@/components/pwa/PwaBottomNav";
import { usePwaBottomNavInset } from "@/hooks/usePwaBottomNavInset";

export default function PosLayoutGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, canAccessAdmin, canRead, loading } = useAuth();

  usePwaBottomNavInset(!loading && canAccessAdmin && canRead("pos"));

  useEffect(() => {
    if (!loading && (!user || !canAccessAdmin)) {
      router.replace("/login?redirect=/pos");
      return;
    }
    if (!loading && canAccessAdmin && !canRead("pos")) {
      router.replace("/admin/start");
    }
  }, [user, canAccessAdmin, canRead, loading, router]);

  if (loading || !user || !canAccessAdmin || !canRead("pos")) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-wood-dark text-linen">
        <p className="text-linen/70">Kassa wird geladen…</p>
      </div>
    );
  }

  return (
    <>
      <PwaRootGuard />
      <div className="min-h-dvh bg-wood-dark text-linen pwa-pos-shell pb-pwa-nav lg:pb-0">
        {children}
      </div>
      <PwaBottomNav />
    </>
  );
}
