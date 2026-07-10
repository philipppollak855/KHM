import { DEFAULT_SITE_CONTENT, mergeSiteContent, type SiteContent } from "./site-content";
import { getAdminFirestore, hasAdminCredentials } from "./firebase-admin";

export async function getSiteContentServer(): Promise<SiteContent> {
  if (!hasAdminCredentials()) return DEFAULT_SITE_CONTENT;
  const snap = await getAdminFirestore().doc("settings/siteContent").get();
  if (!snap.exists) return DEFAULT_SITE_CONTENT;
  return mergeSiteContent(snap.data() as Partial<SiteContent>);
}
