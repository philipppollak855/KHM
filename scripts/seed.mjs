/**
 * Einmaliges Seed-Skript – nutzt Firebase Client SDK.
 * Ausführen: node scripts/seed.mjs
 * Hinweis: Firestore-Regeln müssen Schreibzugriff erlauben (temporär oder als Admin).
 */
import { readFileSync } from "fs";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

function loadEnv() {
  try {
    const env = readFileSync(".env.local", "utf8");
    for (const line of env.split("\n")) {
      const [key, ...vals] = line.split("=");
      if (key && vals.length) {
        process.env[key.trim()] = vals.join("=").trim();
      }
    }
  } catch {
    console.error(".env.local nicht gefunden");
    process.exit(1);
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const SAMPLE_CATEGORIES = [
  { name: "Holzprodukte", description: "Handgefertigte Artikel aus heimischem Holz.", sortOrder: 1, active: true },
  { name: "Textilien & Filz", description: "Warme Filzprodukte und Textilien aus der Region.", sortOrder: 2, active: true },
  { name: "Dekoration & Geschenke", description: "Geschenkideen und saisonale Dekoration.", sortOrder: 3, active: true },
];

const SAMPLE_IMAGE = "?w=600&q=80&auto=format&fit=crop";

function sampleImage(photoId) {
  return `https://images.unsplash.com/${photoId}${SAMPLE_IMAGE}`;
}

const SAMPLE_PRODUCTS = [
  { categorySlug: "holzprodukte", name: "Handgedrechselte Holzschale", description: "Schale aus heimischem Ahorn, von Hand gedrechselt.", price: 34.9, stock: 12, featured: true, imageUrl: sampleImage("photo-1651589822716-2bb531112b8a") },
  { categorySlug: "holzprodukte", name: "Schneidebrett Eiche", description: "Robustes Schneidebrett aus regionaler Eiche.", price: 49.9, stock: 8, featured: true, imageUrl: sampleImage("photo-1594040226829-7f251ab46d80") },
  { categorySlug: "holzprodukte", name: "Holzherz Anhänger", description: "Herz aus Zirbenholz – duftet angenehm.", price: 12.5, stock: 25, featured: false, imageUrl: sampleImage("photo-1627820751275-e44b937c5d33") },
  { categorySlug: "textilien-filz", name: "Filz-Sitzkissen rund", description: "Sitzkissen aus 100 % Schafwolle, handgefilzt.", price: 38.0, stock: 15, featured: true, imageUrl: sampleImage("photo-1586023492125-27b2c045efd7") },
  { categorySlug: "textilien-filz", name: "Filz-Untersetzer Set (4 Stk.)", description: "Vier Untersetzer in Erdtönen, handgefilzt.", price: 22.0, stock: 20, featured: false, imageUrl: sampleImage("photo-1772110204270-8c88bb0f6251") },
  { categorySlug: "textilien-filz", name: "Wolldecke Schneebergland", description: "Decke aus regionaler Schafwolle, 130 × 180 cm.", price: 89.0, stock: 6, featured: false, imageUrl: sampleImage("photo-1631049307264-da0ec9d70304") },
  { categorySlug: "dekoration-geschenke", name: "Adventskranz handgebunden", description: "Frisch gebundener Adventskranz aus heimischen Wäldern.", price: 45.0, stock: 10, featured: true, imageUrl: sampleImage("photo-1543589077-47d81606c1bf") },
  { categorySlug: "dekoration-geschenke", name: "Kerzenhalter aus Treibholz", description: "Kerzenhalter aus Treibholz für Stabkerzen.", price: 28.5, stock: 14, featured: false, imageUrl: sampleImage("photo-1603006905003-be475563bc59") },
  { categorySlug: "dekoration-geschenke", name: "Geschenkset „Schneebergland“", description: "Geschenkset mit Holzherz, Filz-Untersetzer und Zirben-Anhänger.", price: 39.9, stock: 18, featured: true, imageUrl: sampleImage("photo-1544816155-12df9643f363") },
];

loadEnv();

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});
const db = getFirestore(app);

async function seed() {
  const existingCats = await getDocs(collection(db, "categories"));
  const existingProds = await getDocs(collection(db, "products"));

  if (existingCats.size > 0 || existingProds.size > 0) {
    console.log("Daten existieren bereits – überspringe Seed.");
    console.log(`  Kategorien: ${existingCats.size}, Produkte: ${existingProds.size}`);
    return;
  }

  const categoryIds = {};
  for (const cat of SAMPLE_CATEGORIES) {
    const ref = await addDoc(collection(db, "categories"), {
      ...cat,
      slug: slugify(cat.name),
    });
    categoryIds[slugify(cat.name)] = ref.id;
    console.log(`+ Kategorie: ${cat.name}`);
  }

  for (const product of SAMPLE_PRODUCTS) {
    const categoryId = categoryIds[product.categorySlug];
    if (!categoryId) continue;
    await addDoc(collection(db, "products"), {
      name: product.name,
      slug: slugify(product.name),
      description: product.description,
      price: product.price,
      categoryId,
      stock: product.stock,
      imageUrl: product.imageUrl,
      active: true,
      featured: product.featured,
      createdAt: serverTimestamp(),
    });
    console.log(`+ Produkt: ${product.name}`);
  }

  console.log("\nSeed abgeschlossen!");
}

seed().catch((err) => {
  console.error("Seed fehlgeschlagen:", err.message);
  process.exit(1);
});
