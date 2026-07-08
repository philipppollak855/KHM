/**
 * Legt Admin- und Kundenkonto in Firebase an.
 * Ausführen: node scripts/create-users.mjs
 */
import { readFileSync } from "fs";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

function loadEnv() {
  try {
    const env = readFileSync(".env.local", "utf8");
    for (const line of env.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...vals] = trimmed.split("=");
      if (key && vals.length) {
        process.env[key.trim()] = vals.join("=").trim().replace(/^"|"$/g, "");
      }
    }
  } catch {
    console.error(".env.local nicht gefunden");
    process.exit(1);
  }
}

const USERS = [
  {
    email: "kevin@khm.at",
    password: "KhmAdmin2026!",
    displayName: "Kevin (Admin)",
    role: "admin",
  },
  {
    email: "kunde@khm-handmade.at",
    password: "KhmKunde2026!",
    displayName: "Max Mustermann",
    role: "customer",
  },
];

loadEnv();

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});
const auth = getAuth(app);
const db = getFirestore(app);

async function ensureUser({ email, password, displayName, role }) {
  let uid;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    uid = cred.user.uid;
    console.log(`+ Auth-Konto erstellt: ${email}`);
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      uid = cred.user.uid;
      console.log(`= Auth-Konto existiert bereits: ${email}`);
    } else {
      throw err;
    }
  }

  const userRef = doc(db, "users", uid);
  const existing = await getDoc(userRef);

  if (!existing.exists()) {
    await setDoc(userRef, {
      email,
      displayName,
      role,
      createdAt: serverTimestamp(),
    });
    console.log(`+ Firestore-Profil angelegt (${role}): ${email}`);
  } else {
    await setDoc(
      userRef,
      { email, displayName, role },
      { merge: true }
    );
    console.log(`= Firestore-Profil aktualisiert (${role}): ${email}`);
  }
}

async function main() {
  console.log("Erstelle Zugänge für KHM...\n");
  for (const user of USERS) {
    await ensureUser(user);
  }
  console.log("\nFertig!\n");
  console.log("── Admin ──────────────────────────");
  console.log("  URL:      /login  →  /admin");
  console.log(`  E-Mail:   ${USERS[0].email}`);
  console.log(`  Passwort: ${USERS[0].password}`);
  console.log("\n── Kunde ──────────────────────────");
  console.log("  URL:      /login  →  /konto");
  console.log(`  E-Mail:   ${USERS[1].email}`);
  console.log(`  Passwort: ${USERS[1].password}`);
}

main().catch((err) => {
  console.error("Fehler:", err.message);
  process.exit(1);
});
