"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getCompanySettings } from "@/lib/firestore";
import { DEFAULT_COMPANY } from "@/lib/company";
import type { CompanySettings } from "@/lib/types";

interface CompanyBrandingContextValue {
  company: CompanySettings;
  loading: boolean;
  refreshCompany: () => Promise<void>;
}

const CompanyBrandingContext = createContext<CompanyBrandingContextValue>({
  company: DEFAULT_COMPANY,
  loading: true,
  refreshCompany: async () => {},
});

export function CompanyBrandingProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<CompanySettings>(DEFAULT_COMPANY);
  const [loading, setLoading] = useState(true);

  const refreshCompany = useCallback(async () => {
    try {
      const settings = await getCompanySettings();
      setCompany(settings);
    } catch {
      setCompany(DEFAULT_COMPANY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCompany();
  }, [refreshCompany]);

  const value = useMemo(
    () => ({ company, loading, refreshCompany }),
    [company, loading, refreshCompany]
  );

  return (
    <CompanyBrandingContext.Provider value={value}>
      {children}
    </CompanyBrandingContext.Provider>
  );
}

export function useCompanyBranding() {
  return useContext(CompanyBrandingContext);
}
