"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PwaRootGuard from "@/components/pwa/PwaRootGuard";
import PwaBottomNav from "@/components/pwa/PwaBottomNav";

export default function PosLayoutGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace("/login?redirect=/pos");
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !user || !isAdmin) {
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
