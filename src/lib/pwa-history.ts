export type PwaHistoryState = {
  pwaRoot?: boolean;
  pwaOverlay?: string;
};

export function isStandalonePwa() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
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

  window.history.replaceState({ pwaRoot: true } satisfies PwaHistoryState, "", window.location.href);
  window.history.pushState({ pwaRoot: true } satisfies PwaHistoryState, "", window.location.href);
}

export function rearmPwaRootHistory() {
  if (typeof window === "undefined" || !isStandalonePwa()) return;
  window.history.pushState(
    { pwaRoot: true } satisfies PwaHistoryState,
    "",
    window.location.href
  );
}
