"use client";

import { usePwaLauncherTheme } from "@/hooks/usePwaLauncherTheme";

export function usePosTheme() {
  const { isDark, mode, setMode } = usePwaLauncherTheme();

  const t = isDark
    ? {
        shell: "bg-wood-dark text-linen",
        page: "min-h-dvh flex flex-col",
        header: "bg-wood-dark/95 backdrop-blur border-b border-linen/10 text-linen",
        headerSub: "text-linen/50",
        headerMeta: "text-linen/45",
        headerMetaLight: "text-linen/60",
        text: "text-linen",
        textMuted: "text-linen/70",
        textSoft: "text-linen/80",
        searchInput:
          "bg-linen/10 border border-linen/15 text-linen placeholder:text-linen/40",
        searchIcon: "text-linen/40",
        chip: "border-linen/20 text-linen/80",
        chipActive: "bg-wheat text-wood-dark border-wheat",
        loading: "text-linen/60",
        empty: "text-linen/50",
        error: "text-red-300",
        overlay: "bg-wood-dark/60",
        overlayStrong: "bg-wood-dark/70",
        productCard: "bg-linen text-wood-dark border border-wood/10",
        panel: "bg-linen text-wood-dark",
        panelBorder: "border-wood/10",
        sectionCard: "bg-white border border-wood/10",
        footerBar: "bg-white border-t border-wood/10",
        input: "border border-wood/20 bg-white text-wood-dark",
        dashboardLink: "border-linen/20 text-linen/90 hover:bg-linen/10",
        successBg: "bg-gradient-to-b from-forest to-wood-dark text-linen",
        logoDark: true,
      }
    : {
        shell: "bg-linen text-wood-dark",
        page: "min-h-dvh flex flex-col bg-linen text-wood-dark",
        header: "bg-cream/95 backdrop-blur border-b border-wood/10 text-wood-dark",
        headerSub: "text-stone",
        headerMeta: "text-stone/80",
        headerMetaLight: "text-stone",
        text: "text-wood-dark",
        textMuted: "text-stone",
        textSoft: "text-stone/90",
        searchInput:
          "bg-white border border-wood/15 text-wood-dark placeholder:text-stone/50",
        searchIcon: "text-stone/50",
        chip: "border-wood/20 text-stone bg-white/70",
        chipActive: "bg-forest text-linen border-forest",
        loading: "text-stone",
        empty: "text-stone/70",
        error: "text-red-600",
        overlay: "bg-wood-dark/35",
        overlayStrong: "bg-wood-dark/45",
        productCard: "bg-white text-wood-dark border border-wood/10 shadow-sm",
        panel: "bg-cream text-wood-dark",
        panelBorder: "border-wood/10",
        sectionCard: "bg-white border border-wood/10 shadow-sm",
        footerBar: "bg-cream border-t border-wood/10",
        input: "border border-wood/20 bg-white text-wood-dark",
        dashboardLink: "border-wood/20 text-wood-dark/90 hover:bg-wood/5",
        successBg: "bg-gradient-to-b from-cream to-linen text-wood-dark",
        logoDark: false,
      };

  const toggleMode = () => setMode(isDark ? "light" : "dark");

  return { isDark, mode, setMode, toggleMode, t };
}
