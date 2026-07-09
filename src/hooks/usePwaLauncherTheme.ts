"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getPwaThemeMode,
  getSystemPrefersDark,
  PWA_THEME_CHANGE_EVENT,
  PWA_THEME_STORAGE_KEY,
  resolvePwaIsDark,
  setPwaThemeMode,
  type PwaThemeMode,
} from "@/lib/pwa-theme";

function subscribeLauncherTheme(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onStoreChange);
  window.addEventListener(PWA_THEME_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    mq.removeEventListener("change", onStoreChange);
    window.removeEventListener(PWA_THEME_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getLauncherThemeSnapshot() {
  return resolvePwaIsDark(getPwaThemeMode(), getSystemPrefersDark());
}

function getLauncherThemeServerSnapshot() {
  return true;
}

export function usePwaLauncherTheme() {
  const isDark = useSyncExternalStore(
    subscribeLauncherTheme,
    getLauncherThemeSnapshot,
    getLauncherThemeServerSnapshot
  );

  const mode = useSyncExternalStore(
    subscribeLauncherTheme,
    getPwaThemeMode,
    () => "system" as PwaThemeMode
  );

  const setMode = useCallback((next: PwaThemeMode) => {
    setPwaThemeMode(next);
  }, []);

  return { isDark, mode, setMode };
}

export { PWA_THEME_STORAGE_KEY };
