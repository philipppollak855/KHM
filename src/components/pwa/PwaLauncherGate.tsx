"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isStandalonePwa } from "@/lib/pwa-history";

export default function PwaLauncherGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (isStandalonePwa()) {
      setAllowed(true);
      return;
    }
    router.replace("/admin");
  }, [router]);

  if (!allowed) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-wood-dark">
        <p className="text-cream/50 text-sm">Weiterleitung…</p>
      </div>
    );
  }

  return <>{children}</>;
}
