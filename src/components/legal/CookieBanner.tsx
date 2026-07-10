"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings2, X } from "lucide-react";
import { useSiteContent } from "@/context/SiteContentContext";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import Button from "@/components/ui/Button";

export default function CookieBanner() {
  const { content } = useSiteContent();
  const banner = content.legal.cookieBanner;
  const { needsBanner, acceptAll, rejectOptional, saveConsent } = useCookieConsent(
    banner.policyVersion
  );
  const [customOpen, setCustomOpen] = useState(false);
  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  if (!needsBanner) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-modal="true"
    >
      <div className="max-w-3xl mx-auto bg-wood-dark text-linen border border-wheat/20 shadow-2xl rounded-xl overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h2 id="cookie-banner-title" className="font-display text-xl font-light">
              {banner.title}
            </h2>
            <button
              type="button"
              onClick={rejectOptional}
              className="text-linen/50 hover:text-linen p-1"
              aria-label="Nur notwendige Cookies"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-linen/70 leading-relaxed mb-4">{banner.description}</p>
          <p className="text-xs text-linen/50 mb-4">
            <Link href="/datenschutz" className="underline hover:text-linen">
              {banner.privacyLinkLabel}
            </Link>
            {" · "}
            <Link href="/impressum" className="underline hover:text-linen">
              {banner.impressumLinkLabel}
            </Link>
          </p>

          {customOpen && (
            <div className="space-y-4 mb-5 border-t border-linen/10 pt-4">
              <div className="rounded-lg bg-linen/5 p-3">
                <p className="text-sm font-medium text-wheat">{banner.necessary.title}</p>
                <p className="text-xs text-linen/60 mt-1">{banner.necessary.description}</p>
                <p className="text-[10px] uppercase tracking-wider text-linen/40 mt-2">
                  Immer aktiv
                </p>
              </div>
              <label className="flex gap-3 rounded-lg bg-linen/5 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={functional}
                  onChange={(e) => setFunctional(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  <span className="text-sm font-medium text-linen block">
                    {banner.functional.title}
                  </span>
                  <span className="text-xs text-linen/60">{banner.functional.description}</span>
                </span>
              </label>
              <label className="flex gap-3 rounded-lg bg-linen/5 p-3 cursor-pointer opacity-80">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-1"
                  disabled
                />
                <span>
                  <span className="text-sm font-medium text-linen block">
                    {banner.analytics.title}
                  </span>
                  <span className="text-xs text-linen/60">{banner.analytics.description}</span>
                </span>
              </label>
            </div>
          )}

          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            <Button type="button" onClick={acceptAll} className="sm:flex-1">
              {banner.acceptAllLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={rejectOptional}
              className="sm:flex-1 border-linen/30 text-linen hover:bg-linen/10"
            >
              {banner.rejectOptionalLabel}
            </Button>
            <button
              type="button"
              onClick={() => setCustomOpen((o) => !o)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-linen/80 hover:text-linen"
            >
              <Settings2 className="w-4 h-4" />
              {customOpen ? banner.saveLabel : banner.customizeLabel}
            </button>
            {customOpen && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  saveConsent(functional, analytics);
                  setCustomOpen(false);
                }}
                className="sm:flex-1 border-linen/30 text-linen hover:bg-linen/10"
              >
                {banner.saveLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
