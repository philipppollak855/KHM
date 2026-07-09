"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Home, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSwipePages } from "@/hooks/useSwipePages";
import { usePwaLauncherTheme } from "@/hooks/usePwaLauncherTheme";
import { usePwaLauncherBadges } from "@/hooks/usePwaLauncherBadges";
import PwaBottomNav from "@/components/pwa/PwaBottomNav";
import CompanyLogo from "@/components/branding/CompanyLogo";
import { useCompanyBranding } from "@/context/CompanyBrandingContext";
import { filterPwaLauncherPages } from "@/lib/permissions";
import {
  getPwaGreeting,
  pwaLauncherPages,
  type PwaLauncherModule,
} from "@/lib/pwa-launcher";
import { usePwaBottomNavInset } from "@/hooks/usePwaBottomNavInset";

function formatBadge(count: number) {
  if (count > 99) return "99+";
  return String(count);
}

function LauncherTile({
  module,
  badge,
  isDark,
}: {
  module: PwaLauncherModule;
  badge: number;
  isDark: boolean;
}) {
  const Icon = module.icon;

  return (
    <Link
      href={module.href}
      className="group flex flex-col items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 rounded-3xl"
    >
      <div
        className={`relative w-[4.75rem] h-[4.75rem] sm:w-[5.25rem] sm:h-[5.25rem] rounded-[1.35rem] bg-gradient-to-br ${module.tile} p-[1px] shadow-xl ${module.glow} transition-all duration-300 group-active:scale-95 group-hover:scale-[1.04]`}
      >
        {badge > 0 && (
          <span
            className={`absolute -top-1.5 -right-1.5 z-10 flex min-w-[1.125rem] h-[1.125rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm ${
              isDark ? "border-2 border-wood-dark" : "border-2 border-linen"
            }`}
            aria-label={`${badge} offen`}
          >
            {formatBadge(badge)}
          </span>
        )}
        <div className="absolute inset-0 rounded-[1.35rem] bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative h-full w-full rounded-[1.28rem] bg-black/10 backdrop-blur-[2px] flex items-center justify-center border border-white/20">
          <Icon className="w-8 h-8 sm:w-9 sm:h-9 text-white drop-shadow-md" strokeWidth={1.6} />
        </div>
      </div>
      <span
        className={`text-[11px] sm:text-xs font-medium text-center leading-tight max-w-[5.5rem] tracking-wide ${
          isDark ? "text-cream/90" : "text-wood-dark/85"
        }`}
      >
        {module.label}
      </span>
    </Link>
  );
}

function formatClock(date: Date) {
  return date.toLocaleTimeString("de-AT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("de-AT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function PwaLauncher() {
  const { logout, canRead } = useAuth();
  const { company } = useCompanyBranding();
  const { isDark } = usePwaLauncherTheme();
  const badges = usePwaLauncherBadges(canRead);
  usePwaBottomNavInset(true);
  const [now, setNow] = useState(() => new Date());
  const launcherPages = useMemo(
    () => filterPwaLauncherPages(pwaLauncherPages, canRead),
    [canRead]
  );
  const { scrollerRef, activePage, scrollToPage } = useSwipePages(
    launcherPages.length
  );

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const actionBtnClass = isDark
    ? "p-2 rounded-xl bg-white/5 border border-white/10 text-cream/45 hover:text-cream hover:bg-white/10 transition-colors"
    : "p-2 rounded-xl bg-wood/5 border border-wood/10 text-wood/55 hover:text-wood-dark hover:bg-wood/10 transition-colors";

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className={`pwa-launcher min-h-dvh flex flex-col overflow-hidden select-none pb-pwa-nav ${
        isDark ? "text-cream" : "text-wood-dark"
      }`}
    >
      <div className="pwa-launcher-bg pointer-events-none" aria-hidden />

      <header className="relative z-10 px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <Link href="/" aria-label="Zur Homepage" title="Zur Homepage">
                <CompanyLogo variant="mark" size="md" dark={isDark} />
              </Link>
              <p
                className={`text-[11px] uppercase tracking-[0.35em] ${
                  isDark ? "text-cream/45" : "text-stone"
                }`}
              >
                {company.name}
              </p>
            </div>
            <h1
              className={`font-display text-3xl sm:text-4xl font-light tracking-tight ${
                isDark ? "text-cream" : "text-wood-dark"
              }`}
            >
              {getPwaGreeting(now)}
            </h1>
            <p
              className={`text-sm mt-1 capitalize ${
                isDark ? "text-cream/55" : "text-stone"
              }`}
            >
              {formatDate(now)}
            </p>
          </div>
          <div className="text-right shrink-0 flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className={actionBtnClass}
                aria-label="Zur Homepage"
                title="Zur Homepage"
              >
                <Home className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className={actionBtnClass}
                aria-label="Abmelden"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <p
              className={`font-display text-4xl sm:text-5xl font-light tabular-nums tracking-tight ${
                isDark ? "text-cream/95" : "text-wood-dark"
              }`}
            >
              {formatClock(now)}
            </p>
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest ${
                isDark
                  ? "bg-white/8 border border-white/10 text-cream/60"
                  : "bg-wood/5 border border-wood/10 text-stone"
              }`}
            >
              <Sparkles className="w-3 h-3 text-wheat/80" />
              PWA
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex flex-col min-h-0 px-2 pb-2">
        <div
          ref={scrollerRef}
          className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-none"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {launcherPages.map((page) => (
            <section
              key={page.id}
              className="w-full shrink-0 snap-center snap-always px-4 flex flex-col"
              aria-label={page.title}
            >
              <div className="text-center mb-6 sm:mb-8">
                <h2
                  className={`font-display text-xl sm:text-2xl font-light ${
                    isDark ? "text-cream/95" : "text-wood-dark"
                  }`}
                >
                  {page.title}
                </h2>
                <p
                  className={`text-xs mt-1 tracking-wide ${
                    isDark ? "text-cream/45" : "text-stone"
                  }`}
                >
                  {page.subtitle}
                </p>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div
                  className={`w-full max-w-sm rounded-[2rem] border backdrop-blur-xl p-6 sm:p-8 ${
                    isDark
                      ? "border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
                      : "border-wood/10 bg-linen/80 shadow-[0_24px_80px_rgba(44,33,24,0.08)]"
                  }`}
                >
                  <div className="grid grid-cols-2 gap-x-6 gap-y-8 place-items-center auto-rows-fr">
                    {page.modules.map((module) => (
                      <LauncherTile
                        key={module.href}
                        module={module}
                        badge={badges[module.href] ?? 0}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            {launcherPages.map((page, index) => (
              <button
                key={page.id}
                type="button"
                aria-label={`Seite ${index + 1}: ${page.title}`}
                aria-current={activePage === index ? "true" : undefined}
                onClick={() => scrollToPage(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activePage === index
                    ? isDark
                      ? "w-7 bg-cream/90"
                      : "w-7 bg-forest/80"
                    : isDark
                      ? "w-2 bg-cream/25 hover:bg-cream/45"
                      : "w-2 bg-wood/20 hover:bg-wood/35"
                }`}
              />
            ))}
          </div>
          <p
            className={`text-[10px] uppercase tracking-[0.28em] ${
              isDark ? "text-cream/35" : "text-stone/70"
            }`}
          >
            Wischen für mehr Module
          </p>
        </div>
      </div>

      <PwaBottomNav />
    </div>
  );
}
