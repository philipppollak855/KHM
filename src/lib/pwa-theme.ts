export type PwaThemeMode = "system" | "light" | "dark";

export const PWA_THEME_STORAGE_KEY = "khm-pwa-launcher-theme";
export const PWA_THEME_CHANGE_EVENT = "khm-pwa-theme-change";

export function getPwaThemeMode(): PwaThemeMode {
  if (typeof window === "undefined") return "system";

  const stored = window.localStorage.getItem(PWA_THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }

  return "system";
}

export function setPwaThemeMode(mode: PwaThemeMode) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(PWA_THEME_STORAGE_KEY, mode);
  window.dispatchEvent(new Event(PWA_THEME_CHANGE_EVENT));
}

export function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolvePwaIsDark(
  mode: PwaThemeMode,
  systemDark = getSystemPrefersDark()
): boolean {
  if (mode === "light") return false;
  if (mode === "dark") return true;
  return systemDark;
}

export const PWA_THEME_LABELS: Record<PwaThemeMode, string> = {
  system: "System (Gerät)",
  light: "Hell",
  dark: "Dunkel",
};
