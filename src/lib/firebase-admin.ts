import { initializeApp, getApps, cert, type App, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function normalizePrivateKey(key: string) {
  return key.includes("\\n") ? key.replace(/\\n/g, "\n") : key;
}

function getServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (!raw) return null;
  try {
    let parsed: unknown = JSON.parse(raw);
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }
    if (!parsed || typeof parsed !== "object") return null;
    const account = parsed as ServiceAccount & {
      project_id?: string;
      private_key?: string;
    };
    if (account.private_key) {
      account.private_key = normalizePrivateKey(account.private_key);
    }
    return account;
  } catch {
    return null;
  }
}

export function getAdminApp(): App | null {
  if (getApps().length > 0) return getApps()[0];
  const serviceAccount = getServiceAccount();
  if (!serviceAccount) return null;
  const projectId =
    serviceAccount.projectId ||
    (serviceAccount as ServiceAccount & { project_id?: string }).project_id;
  return initializeApp({
    credential: cert(serviceAccount),
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      `${projectId}.firebasestorage.app`,
  });
}

export function getAdminAuth() {
  const app = getAdminApp();
  if (!app) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY nicht konfiguriert.");
  return getAuth(app);
}

let firestoreSettingsApplied = false;

export function getAdminFirestore() {
  const app = getAdminApp();
  if (!app) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY nicht konfiguriert.");
  const db = getFirestore(app);
  if (!firestoreSettingsApplied) {
    db.settings({ ignoreUndefinedProperties: true });
    firestoreSettingsApplied = true;
  }
  return db;
}

export function hasAdminCredentials(): boolean {
  return getServiceAccount() !== null;
}
