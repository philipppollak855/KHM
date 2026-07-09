import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { slugify } from "./firestore";
import { getSampleProductImage } from "./marketing-images";

const SAMPLE_CATEGORIES = [
  {
    name: "Holzprodukte",
    description:
      "Handgefertigte Artikel aus heimischem Holz – Schalen, Bretter und Deko aus dem Schneebergland.",
    sortOrder: 1,
    active: true,
  },
  {
    name: "Textilien & Filz",
    description:
      "Warme Filzprodukte und Textilien, traditionell verarbeitet mit Schafwolle aus der Region.",
    sortOrder: 2,
    active: true,
  },
  {
    name: "Dekoration & Geschenke",
    description:
      "Liebevoll gestaltete Geschenkideen und saisonale Dekoration für Ihr Zuhause.",
    sortOrder: 3,
    active: true,
  },
];

const SAMPLE_PRODUCTS = [
  {
    categorySlug: "holzprodukte",
    name: "Handgedrechselte Holzschale",
    description:
      "Schale aus heimischem Ahorn, von Hand gedrechselt und mit natürlichem Leinöl behandelt. Jedes Stück ist ein Unikat.",
    price: 34.9,
    stock: 12,
    featured: true,
  },
  {
    categorySlug: "holzprodukte",
    name: "Schneidebrett Eiche",
    description:
      "Robustes Schneidebrett aus regionaler Eiche mit natürlicher Maserung. Ideal für Küche und Servieren.",
    price: 49.9,
    stock: 8,
    featured: true,
  },
  {
    categorySlug: "holzprodukte",
    name: "Holzherz Anhänger",
    description:
      "Kleines Herz aus Zirbenholz – duftet angenehm und eignet sich perfekt als Geschenk oder Baumschmuck.",
    price: 12.5,
    stock: 25,
    featured: false,
  },
  {
    categorySlug: "textilien-filz",
    name: "Filz-Sitzkissen rund",
    description:
      "Weiches Sitzkissen aus 100 % Schafwolle, handgefilzt in traditioneller Technik. Durchmesser 40 cm.",
    price: 38.0,
    stock: 15,
    featured: true,
  },
  {
    categorySlug: "textilien-filz",
    name: "Filz-Untersetzer Set (4 Stk.)",
    description:
      "Vier Untersetzer in Erdtönen, handgefilzt. Schützt Ihre Oberflächen und bringt Wärme auf den Tisch.",
    price: 22.0,
    stock: 20,
    featured: false,
  },
  {
    categorySlug: "textilien-filz",
    name: "Wolldecke Schneebergland",
    description:
      "Kuschelige Decke aus regionaler Schafwolle, gewebt im Schneebergland. Naturfarben, 130 × 180 cm.",
    price: 89.0,
    stock: 6,
    featured: false,
  },
  {
    categorySlug: "dekoration-geschenke",
    name: "Adventskranz handgebunden",
    description:
      "Frisch gebundener Adventskranz mit Tannenzweigen, Zapfen und Beeren aus heimischen Wäldern.",
    price: 45.0,
    stock: 10,
    featured: true,
  },
  {
    categorySlug: "dekoration-geschenke",
    name: "Kerzenhalter aus Treibholz",
    description:
      "Einzigartiger Kerzenhalter aus am Mühlbach getriebenem Holz. Für Stabkerzen, rustikal und natürlich.",
    price: 28.5,
    stock: 14,
    featured: false,
  },
  {
    categorySlug: "dekoration-geschenke",
    name: "Geschenkset „Schneebergland“",
    description:
      "Kleines Geschenkset mit Holzherz, Filz-Untersetzer und duftendem Zirben-Anhänger – liebevoll verpackt.",
    price: 39.9,
    stock: 18,
    featured: true,
  },
];

function imageForProduct(name: string) {
  return getSampleProductImage(slugify(name));
}

export async function seedSampleData(): Promise<{
  categories: number;
  products: number;
}> {
  const existingCats = await getDocs(collection(db, "categories"));
  const existingProds = await getDocs(collection(db, "products"));

  if (existingCats.size > 0 || existingProds.size > 0) {
    throw new Error(
      "Es existieren bereits Daten. Bitte löschen Sie zuerst alle Kategorien und Produkte."
    );
  }

  const categoryIds: Record<string, string> = {};

  for (const cat of SAMPLE_CATEGORIES) {
    const ref = await addDoc(collection(db, "categories"), {
      ...cat,
      slug: slugify(cat.name),
    });
    categoryIds[slugify(cat.name)] = ref.id;
  }

  let productCount = 0;
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
      imageUrl: imageForProduct(product.name),
      active: true,
      featured: product.featured,
      taxRate: 20,
      createdAt: serverTimestamp(),
    });
    productCount++;
  }

  return { categories: SAMPLE_CATEGORIES.length, products: productCount };
}

export async function refreshSampleProductImages(): Promise<{ updated: number }> {
  const productsSnap = await getDocs(collection(db, "products"));
  let updated = 0;

  for (const productDoc of productsSnap.docs) {
    const slug = productDoc.data().slug as string | undefined;
    if (!slug) continue;

    const imageUrl = getSampleProductImage(slug);
    if (!imageUrl || productDoc.data().imageUrl === imageUrl) continue;

    await updateDoc(doc(db, "products", productDoc.id), { imageUrl });
    updated++;
  }

  return { updated };
}
