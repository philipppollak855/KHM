import { Suspense } from "react";
import PosApp from "@/components/pos/PosApp";

function PosLoading() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-wood-dark text-linen">
      <p className="text-linen/70">Kassa wird geladen…</p>
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
