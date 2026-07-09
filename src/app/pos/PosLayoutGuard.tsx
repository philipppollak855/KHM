"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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

  return <div className="min-h-dvh bg-wood-dark text-linen">{children}</div>;
}
