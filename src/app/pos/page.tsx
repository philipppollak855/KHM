"use client";

import { Suspense } from "react";
import PosApp from "@/components/pos/PosApp";
import { usePosTheme } from "@/hooks/usePosTheme";

function PosLoading() {
  const { t } = usePosTheme();
  return (
    <div className={`min-h-dvh flex items-center justify-center ${t.shell}`}>
      <p className={t.textMuted}>Kassa wird geladen…</p>
    </div>
  );
}

export default function PosPage() {
  return (
    <Suspense fallback={<PosLoading />}>
      <PosApp />
    </Suspense>
  );
}
