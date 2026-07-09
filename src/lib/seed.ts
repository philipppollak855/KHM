import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { slugify } from "./firestore";

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
    imageUrl:
      "https://images.unsplash.com/photo-1610701596007-3a61ceadf344?w=600&q=80",
  },
  {
    categorySlug: "holzprodukte",
    name: "Schneidebrett Eiche",
    description:
      "Robustes Schneidebrett aus regionaler Eiche mit natürlicher Maserung. Ideal für Küche und Servieren.",
    price: 49.9,
    stock: 8,
    featured: true,
    imageUrl:
      "https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=600&q=80",
  },
  {
    categorySlug: "holzprodukte",
    name: "Holzherz Anhänger",
    description:
      "Kleines Herz aus Zirbenholz – duftet angenehm und eignet sich perfekt als Geschenk oder Baumschmuck.",
    price: 12.5,
    stock: 25,
    featured: false,
    imageUrl:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&q=80",
  },
  {
    categorySlug: "textilien-filz",
    name: "Filz-Sitzkissen rund",
    description:
      "Weiches Sitzkissen aus 100 % Schafwolle, handgefilzt in traditioneller Technik. Durchmesser 40 cm.",
    price: 38.0,
    stock: 15,
    featured: true,
    imageUrl:
      "https://images.unsplash.com/photo-1584100936595-c0654b8a4fb2?w=600&q=80",
  },
  {
    categorySlug: "textilien-filz",
    name: "Filz-Untersetzer Set (4 Stk.)",
    description:
      "Vier Untersetzer in Erdtönen, handgefilzt. Schützt Ihre Oberflächen und bringt Wärme auf den Tisch.",
    price: 22.0,
    stock: 20,
    featured: false,
    imageUrl:
      "https://images.unsplash.com/photo-1615529182904-1488c6e57c0e?w=600&q=80",
  },
  {
    categorySlug: "textilien-filz",
    name: "Wolldecke Schneebergland",
    description:
      "Kuschelige Decke aus regionaler Schafwolle, gewebt im Schneebergland. Naturfarben, 130 × 180 cm.",
    price: 89.0,
    stock: 6,
    featured: false,
    imageUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  },
  {
    categorySlug: "dekoration-geschenke",
    name: "Adventskranz handgebunden",
    description:
      "Frisch gebundener Adventskranz mit Tannenzweigen, Zapfen und Beeren aus heimischen Wäldern.",
    price: 45.0,
    stock: 10,
    featured: true,
    imageUrl:
      "https://images.unsplash.com/photo-1545048705-9613006ceb9c?w=600&q=80",
  },
  {
    categorySlug: "dekoration-geschenke",
    name: "Kerzenhalter aus Treibholz",
    description:
      "Einzigartiger Kerzenhalter aus am Mühlbach getriebenem Holz. Für Stabkerzen, rustikal und natürlich.",
    price: 28.5,
    stock: 14,
    featured: false,
    imageUrl:
      "https://images.unsplash.com/photo-1602602898657-3e91760cbb34?w=600&q=80",
  },
  {
    categorySlug: "dekoration-geschenke",
    name: "Geschenkset „Schneebergland“",
    description:
      "Kleines Geschenkset mit Holzherz, Filz-Untersetzer und duftendem Zirben-Anhänger – liebevoll verpackt.",
    price: 39.9,
    stock: 18,
    featured: true,
    imageUrl:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80",
  },
];

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
      imageUrl: product.imageUrl,
      active: true,
      featured: product.featured,
      taxRate: 20,
      createdAt: serverTimestamp(),
    });
    productCount++;
  }

  return { categories: SAMPLE_CATEGORIES.length, products: productCount };
}
