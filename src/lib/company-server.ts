import { DEFAULT_COMPANY } from "./company";
import { getAdminFirestore, hasAdminCredentials } from "./firebase-admin";
import type { CompanySettings } from "./types";

export async function getCompanySettingsServer(): Promise<CompanySettings> {
  if (!hasAdminCredentials()) return DEFAULT_COMPANY;
  const snap = await getAdminFirestore().doc("settings/company").get();
  if (!snap.exists) return DEFAULT_COMPANY;
  return { ...DEFAULT_COMPANY, ...snap.data() } as CompanySettings;
}
