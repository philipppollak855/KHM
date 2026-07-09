"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useSwipePages(pageCount: number) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const rafRef = useRef<number | null>(null);

  const updateActivePage = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || pageCount <= 0) return;

    const width = el.clientWidth || 1;
    const index = Math.round(el.scrollLeft / width);
    setActivePage(Math.min(Math.max(index, 0), pageCount - 1));
  }, [pageCount]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateActivePage);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [updateActivePage]);

  const scrollToPage = useCallback(
    (index: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const clamped = Math.min(Math.max(index, 0), pageCount - 1);
      el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
      setActivePage(clamped);
    },
    [pageCount]
  );

  return { scrollerRef, activePage, scrollToPage };
}
