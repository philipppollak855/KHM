/**
 * Erstellt einen Firebase Admin SDK-Schlüssel und setzt Umgebungsvariablen.
 * Nutzt die Firebase-CLI-Anmeldung (refresh_token).
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { execSync } from "child_process";
import { google } from "googleapis";

const PROJECT_ID = "khm-handmade";
const CONFIG_PATH = join(homedir(), ".config", "configstore", "firebase-tools.json");
const ENV_LOCAL = ".env.local";
const TEMP_KEY = join(".tmp", "firebase-service-account.json");

function loadFirebaseTokens() {
  if (!existsSync(CONFIG_PATH)) {
    throw new Error("Firebase CLI nicht angemeldet. Bitte: firebase login");
  }
  const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
  if (!config.tokens?.refresh_token) {
    throw new Error("Kein Firebase refresh_token gefunden.");
  }
  return config.tokens;
}

async function getAuthClient(tokens) {
  const oauth2 = new google.auth.OAuth2(
    "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
    undefined,
    "http://localhost"
  );
  oauth2.setCredentials(tokens);
  await oauth2.getAccessToken();
  return oauth2;
}

async function findAdminServiceAccount(auth) {
  const iam = google.iam({ version: "v1", auth });
  const res = await iam.projects.serviceAccounts.list({
    name: `projects/${PROJECT_ID}`,
  });
  const accounts = res.data.accounts || [];
  const adminSa = accounts.find(
    (a) =>
      a.email?.includes("firebase-adminsdk") ||
      a.displayName?.toLowerCase().includes("firebase")
  );
  if (!adminSa?.name) {
    throw new Error("Kein Firebase Admin Service Account gefunden.");
  }
  return adminSa.name;
}

async function createServiceAccountKey(auth, serviceAccountName) {
  const iam = google.iam({ version: "v1", auth });
  const res = await iam.projects.serviceAccounts.keys.create({
    name: serviceAccountName,
    requestBody: {
      privateKeyType: "TYPE_GOOGLE_CREDENTIALS_FILE",
      keyAlgorithm: "KEY_ALG_RSA_2048",
    },
  });
  if (!res.data.privateKeyData) {
    throw new Error("Schlüsselerstellung fehlgeschlagen.");
  }
  const json = Buffer.from(res.data.privateKeyData, "base64").toString("utf8");
  return JSON.parse(json);
}

function updateEnvLocal(keyJson) {
  const minified = JSON.stringify(keyJson);
  const line = `FIREBASE_SERVICE_ACCOUNT_KEY=${JSON.stringify(minified)}`;
  let content = existsSync(ENV_LOCAL) ? readFileSync(ENV_LOCAL, "utf8") : "";
  if (/^FIREBASE_SERVICE_ACCOUNT_KEY=/m.test(content)) {
    content = content.replace(/^FIREBASE_SERVICE_ACCOUNT_KEY=.*$/m, line);
  } else {
    content = content.trimEnd() + (content.endsWith("\n") || !content ? "" : "\n") + line + "\n";
  }
  writeFileSync(ENV_LOCAL, content, "utf8");
}

function setVercelEnv(keyJson) {
  const minified = JSON.stringify(keyJson);
  const environments = ["production", "preview", "development"];

  for (const env of environments) {
    try {
      execSync(`npx vercel env rm FIREBASE_SERVICE_ACCOUNT_KEY ${env} --yes`, {
        stdio: "pipe",
        cwd: process.cwd(),
      });
    } catch {
      // Variable existiert noch nicht
    }
    execSync(`npx vercel env add FIREBASE_SERVICE_ACCOUNT_KEY ${env}`, {
      input: minified,
      stdio: ["pipe", "pipe", "pipe"],
      cwd: process.cwd(),
    });
    console.log(`✓ Vercel ${env}: FIREBASE_SERVICE_ACCOUNT_KEY gesetzt`);
  }
}

async function main() {
  const tokens = loadFirebaseTokens();
  const auth = await getAuthClient(tokens);
  const saName = await findAdminServiceAccount(auth);
  console.log(`Service Account: ${saName.split("/").pop()}`);

  const keyJson = await createServiceAccountKey(auth, saName);

  writeFileSync(TEMP_KEY, JSON.stringify(keyJson, null, 2), "utf8");
  updateEnvLocal(keyJson);
  console.log("✓ .env.local aktualisiert");

  setVercelEnv(keyJson);
  console.log("Fertig.");
}

main().catch((err) => {
  console.error("Fehler:", err.message || err);
  process.exit(1);
});
