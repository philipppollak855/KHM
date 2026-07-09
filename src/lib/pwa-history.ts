export type PwaHistoryState = {
  pwaRoot?: boolean;
  pwaOverlay?: string;
};

/** Dummy-Einträge auf Root-Screens – schützt vor Doppel-Zurück (Android/iOS PWA). */
export const PWA_ROOT_BUFFER_SIZE = 3;

const RAPID_BACK_WINDOW_MS = 500;
let lastRootPopAt = 0;

export function isStandalonePwa() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isPwaRootPath(pathname: string) {
  return (
    pathname === "/admin/start" ||
    pathname === "/admin" ||
    pathname === "/pos"
  );
}

export function pushPwaRootBuffer(count = PWA_ROOT_BUFFER_SIZE) {
  if (typeof window === "undefined" || !isStandalonePwa()) return;

  for (let i = 0; i < count; i++) {
    window.history.pushState(
      { pwaRoot: true } satisfies PwaHistoryState,
      "",
      window.location.href
    );
  }
}

export function pushPwaOverlayState(id: string) {
  if (typeof window === "undefined") return;
  const state: PwaHistoryState = { pwaOverlay: id };
  window.history.pushState(state, "", window.location.href);
}

export function ensurePwaRootHistory() {
  if (typeof window === "undefined" || !isStandalonePwa()) return;

  const current = window.history.state as PwaHistoryState | null;
  if (current?.pwaRoot) return;

  window.history.replaceState(
    { pwaRoot: true } satisfies PwaHistoryState,
    "",
    window.location.href
  );
  pushPwaRootBuffer(PWA_ROOT_BUFFER_SIZE);
}

export function rearmPwaRootHistory() {
  if (typeof window === "undefined" || !isStandalonePwa()) return;

  const now = Date.now();
  const rapid = now - lastRootPopAt < RAPID_BACK_WINDOW_MS;
  lastRootPopAt = now;

  pushPwaRootBuffer(rapid ? PWA_ROOT_BUFFER_SIZE + 1 : PWA_ROOT_BUFFER_SIZE);
}

export function shouldGuardPwaBack(pathname: string) {
  if (!isStandalonePwa()) return false;
  const state = window.history.state as PwaHistoryState | null;
  return Boolean(state?.pwaRoot) || isPwaRootPath(pathname);
}
