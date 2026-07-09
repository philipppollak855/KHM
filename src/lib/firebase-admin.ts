import { initializeApp, getApps, cert, type App, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ServiceAccount;
  } catch {
    return null;
  }
}

export function getAdminApp(): App | null {
  if (getApps().length > 0) return getApps()[0];
  const serviceAccount = getServiceAccount();
  if (!serviceAccount) return null;
  return initializeApp({ credential: cert(serviceAccount) });
}

export function getAdminAuth() {
  const app = getAdminApp();
  if (!app) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY nicht konfiguriert.");
  return getAuth(app);
}

export function getAdminFirestore() {
  const app = getAdminApp();
  if (!app) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY nicht konfiguriert.");
  return getFirestore(app);
}

export function hasAdminCredentials(): boolean {
  return getServiceAccount() !== null;
}
