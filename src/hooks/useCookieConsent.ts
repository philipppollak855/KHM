"use client";

import { useCallback, useEffect, useState } from "react";
import {
  hasValidConsent,
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentPreferences,
} from "@/lib/cookie-consent";

export function useCookieConsent(policyVersion: number) {
  const [consent, setConsent] = useState<CookieConsentPreferences | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setConsent(readCookieConsent());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, policyVersion]);

  const needsBanner = ready && !hasValidConsent(policyVersion);

  const saveConsent = useCallback(
    (functional: boolean, analytics: boolean) => {
      const prefs: CookieConsentPreferences = {
        policyVersion,
        necessary: true,
        functional,
        analytics,
        decidedAt: new Date().toISOString(),
      };
      writeCookieConsent(prefs);
      setConsent(prefs);
      window.dispatchEvent(new CustomEvent("khm-cookie-consent-changed", { detail: prefs }));
    },
    [policyVersion]
  );

  const acceptAll = useCallback(() => saveConsent(true, true), [saveConsent]);
  const rejectOptional = useCallback(() => saveConsent(false, false), [saveConsent]);

  return {
    consent,
    ready,
    needsBanner,
    acceptAll,
    rejectOptional,
    saveConsent,
    refresh,
  };
}
