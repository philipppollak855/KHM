"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getSiteContent, saveSiteContent } from "@/lib/firestore";
import { DEFAULT_SITE_CONTENT, mergeSiteContent, type SiteContent } from "@/lib/site-content";

interface SiteContentContextValue {
  content: SiteContent;
  loading: boolean;
  refreshContent: () => Promise<void>;
  saveContent: (data: SiteContent) => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextValue>({
  content: DEFAULT_SITE_CONTENT,
  loading: true,
  refreshContent: async () => {},
  saveContent: async () => {},
});

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);

  const refreshContent = useCallback(async () => {
    try {
      const data = await getSiteContent();
      setContent(data);
    } catch {
      setContent(DEFAULT_SITE_CONTENT);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveContent = useCallback(async (data: SiteContent) => {
    await saveSiteContent(data);
    setContent(data);
  }, []);

  useEffect(() => {
    refreshContent();
  }, [refreshContent]);

  const value = useMemo(
    () => ({ content, loading, refreshContent, saveContent }),
    [content, loading, refreshContent, saveContent]
  );

  return (
    <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}

export function useMergedSiteContent(partial?: Partial<SiteContent> | null) {
  return useMemo(() => mergeSiteContent(partial ?? undefined), [partial]);
}
