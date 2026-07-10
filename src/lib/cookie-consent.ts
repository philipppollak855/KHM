export const COOKIE_CONSENT_STORAGE_KEY = "khm-cookie-consent";

export interface CookieConsentPreferences {
  policyVersion: number;
  necessary: true;
  functional: boolean;
  analytics: boolean;
  decidedAt: string;
}

export function readCookieConsent(): CookieConsentPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentPreferences;
    if (parsed.necessary !== true || typeof parsed.policyVersion !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeCookieConsent(prefs: CookieConsentPreferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(prefs));
}

export function clearCookieConsent() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
}

export function hasValidConsent(currentPolicyVersion: number): boolean {
  const stored = readCookieConsent();
  return stored !== null && stored.policyVersion === currentPolicyVersion;
}

export function allowsFunctionalCookies(): boolean {
  const stored = readCookieConsent();
  return stored?.functional === true;
}

export function allowsAnalyticsCookies(): boolean {
  const stored = readCookieConsent();
  return stored?.analytics === true;
}
