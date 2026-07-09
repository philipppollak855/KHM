"use client";

import { useEffect, useState } from "react";
import { isStandalonePwa } from "@/lib/pwa-history";

export function useIsStandalonePwa() {
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(isStandalonePwa());
  }, []);

  return standalone;
}
