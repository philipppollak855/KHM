"use client";

import { useEffect, useRef } from "react";
import {
  ensurePwaRootHistory,
  isStandalonePwa,
  rearmPwaRootHistory,
} from "@/lib/pwa-history";

type BackHandler = () => boolean;

const handlers: BackHandler[] = [];
let listenerAttached = false;

function handlePopState() {
  for (let i = handlers.length - 1; i >= 0; i--) {
    if (handlers[i]()) {
      window.history.pushState(window.history.state, "", window.location.href);
      return;
    }
  }

  const state = window.history.state as { pwaRoot?: boolean } | null;
  if (state?.pwaRoot && isStandalonePwa()) {
    rearmPwaRootHistory();
  }
}

function attachPopstateListener() {
  if (listenerAttached || typeof window === "undefined") return;
  window.addEventListener("popstate", handlePopState);
  listenerAttached = true;
}

export function usePwaBackNavigation(handler: BackHandler, enabled = true) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    attachPopstateListener();

    const wrapped = () => handlerRef.current();
    handlers.push(wrapped);
    return () => {
      const index = handlers.indexOf(wrapped);
      if (index >= 0) handlers.splice(index, 1);
    };
  }, [enabled]);
}

export function usePwaRootGuard(pathname: string) {
  useEffect(() => {
    const isAdminRoot = pathname === "/admin";
    const isPosRoot = pathname === "/pos";
    if (!isAdminRoot && !isPosRoot) return;
    ensurePwaRootHistory();
  }, [pathname]);
}

export function usePwaOverlayBack(
  open: boolean,
  overlayId: string,
  onClose: () => void
) {
  const openedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      openedRef.current = false;
      return;
    }

    if (!openedRef.current) {
      pushOverlayHistory(overlayId);
      openedRef.current = true;
    }
  }, [open, overlayId]);

  usePwaBackNavigation(() => {
    if (!open) return false;
    onClose();
    return true;
  }, open);
}

function pushOverlayHistory(overlayId: string) {
  if (typeof window === "undefined") return;
  window.history.pushState({ pwaOverlay: overlayId }, "", window.location.href);
}
