"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminShell from "@/components/admin/AdminShell";
import PwaRootGuard from "@/components/pwa/PwaRootGuard";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAdmin, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login");
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-wood-dark">
        <p className="text-cream/60">Laden...</p>
      </div>
    );
  }

  return (
    <>
      <PwaRootGuard />
      <AdminShell onLogout={() => logout()}>{children}</AdminShell>
    </>
  );
}
