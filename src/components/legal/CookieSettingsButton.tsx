"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import Link from "next/link";
import { useSiteContent } from "@/context/SiteContentContext";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { readCookieConsent, clearCookieConsent } from "@/lib/cookie-consent";
import Button from "@/components/ui/Button";

export default function CookieSettingsButton() {
  const { content } = useSiteContent();
  const banner = content.legal.cookieBanner;
  const { saveConsent, refresh } = useCookieConsent(banner.policyVersion);
  const [open, setOpen] = useState(false);
  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  const openSettings = () => {
    const stored = readCookieConsent();
    setFunctional(stored?.functional ?? false);
    setAnalytics(stored?.analytics ?? false);
    setOpen(true);
  };

  const handleSave = () => {
    saveConsent(functional, analytics);
    setOpen(false);
  };

  const handleReset = () => {
    clearCookieConsent();
    refresh();
    setOpen(false);
    window.location.reload();
  };

  return (
    <>
      <button
        type="button"
        onClick={openSettings}
        className="inline-flex items-center gap-1.5 text-linen/50 hover:text-linen transition-colors"
      >
        <Settings2 className="w-3.5 h-3.5" />
        Cookies
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-black/50">
          <div
            className="w-full max-w-lg bg-linen border border-wood/10 rounded-xl p-6 shadow-xl"
            role="dialog"
            aria-labelledby="cookie-settings-title"
          >
            <h2 id="cookie-settings-title" className="font-display text-xl text-wood-dark mb-4">
              {banner.title}
            </h2>
            <p className="text-sm text-stone mb-4">{banner.description}</p>
            <div className="space-y-3 mb-6">
              <div className="rounded-lg border border-wood/10 p-3 bg-cream">
                <p className="text-sm font-medium text-wood-dark">{banner.necessary.title}</p>
                <p className="text-xs text-stone mt-1">{banner.necessary.description}</p>
              </div>
              <label className="flex gap-3 rounded-lg border border-wood/10 p-3 bg-cream cursor-pointer">
                <input
                  type="checkbox"
                  checked={functional}
                  onChange={(e) => setFunctional(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  <span className="text-sm font-medium text-wood-dark block">
                    {banner.functional.title}
                  </span>
                  <span className="text-xs text-stone">{banner.functional.description}</span>
                </span>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={handleSave}>
                {banner.saveLabel}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Einwilligung widerrufen
              </Button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-stone hover:text-wood-dark px-3"
              >
                Schließen
              </button>
            </div>
            <p className="text-xs text-stone mt-4">
              <Link href="/datenschutz" className="text-forest hover:underline">
                {banner.privacyLinkLabel}
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
