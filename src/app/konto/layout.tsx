"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useIsStandalonePwa } from "@/hooks/useIsStandalonePwa";
import { getAdminHomePath } from "@/lib/auth-redirect";
import { canAccessAdminArea } from "@/lib/permissions";
import KontoLogoutButton from "@/components/konto/KontoLogoutButton";

export default function KontoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isPwa = useIsStandalonePwa();

  useEffect(() => {
    if (!loading && canAccessAdminArea(user)) {
      router.replace(getAdminHomePath({ pwa: isPwa }));
    }
  }, [user, loading, router, isPwa]);

  if (!loading && canAccessAdminArea(user)) {
    return null;
  }

  return (
    <>
      {user && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex justify-end">
          <KontoLogoutButton />
        </div>
      )}
      {children}
    </>
  );
}
