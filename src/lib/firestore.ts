import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Category,
  Product,
  Order,
  Invoice,
  User,
  OrderItem,
  Address,
} from "./types";

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}

// Categories
export async function getCategories(): Promise<Category[]> {
  const q = query(collection(db, "categories"), orderBy("sortOrder"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function getActiveCategories(): Promise<Category[]> {
  const cats = await getCategories();
  return cats.filter((c) => c.active);
}

export async function createCategory(data: Omit<Category, "id">) {
  return addDoc(collection(db, "categories"), data);
}

export async function updateCategory(id: string, data: Partial<Category>) {
  return updateDoc(doc(db, "categories", id), data);
}

export async function deleteCategory(id: string) {
  return deleteDoc(doc(db, "categories", id));
}

// Products
export async function getProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: toDate(d.data().createdAt),
  })) as Product[];
}

export async function getActiveProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.active);
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const q = query(
    collection(db, "products"),
    where("categoryId", "==", categoryId),
    where("active", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: toDate(d.data().createdAt),
  })) as Product[];
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) return null;
  return {
    id: snap.id,
    ...snap.data(),
    createdAt: toDate(snap.data().createdAt),
  } as Product;
}

export async function createProduct(data: Omit<Product, "id" | "createdAt">) {
  return addDoc(collection(db, "products"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateProduct(id: string, data: Partial<Product>) {
  return updateDoc(doc(db, "products", id), data);
}

export async function deleteProduct(id: string) {
  return deleteDoc(doc(db, "products", id));
}

// Orders
export async function getOrders(): Promise<Order[]> {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: toDate(d.data().createdAt),
    updatedAt: toDate(d.data().updatedAt),
  })) as Order[];
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: toDate(d.data().createdAt),
    updatedAt: toDate(d.data().updatedAt),
  })) as Order[];
}

export async function createOrder(data: {
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  notes?: string;
}) {
  const orderNumber = `KHM-${Date.now().toString(36).toUpperCase()}`;
  const orderRef = await addDoc(collection(db, "orders"), {
    ...data,
    orderNumber,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const invoiceNumber = `RE-${Date.now().toString(36).toUpperCase()}`;
  await addDoc(collection(db, "invoices"), {
    invoiceNumber,
    orderId: orderRef.id,
    userId: data.userId,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    items: data.items,
    subtotal: data.subtotal,
    tax: 0,
    total: data.total,
    status: "sent",
    issuedAt: serverTimestamp(),
    dueAt: Timestamp.fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
  });

  return orderRef;
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  return updateDoc(doc(db, "orders", id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

// Invoices
export async function getInvoices(): Promise<Invoice[]> {
  const q = query(collection(db, "invoices"), orderBy("issuedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    issuedAt: toDate(d.data().issuedAt),
    dueAt: toDate(d.data().dueAt),
    paidAt: d.data().paidAt ? toDate(d.data().paidAt) : undefined,
  })) as Invoice[];
}

export async function updateInvoiceStatus(id: string, status: Invoice["status"]) {
  const updates: Record<string, unknown> = { status };
  if (status === "paid") updates.paidAt = serverTimestamp();
  return updateDoc(doc(db, "invoices", id), updates);
}

// Users / Customers
export async function getUsers(): Promise<User[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: toDate(d.data().createdAt),
  })) as User[];
}

export async function getUser(id: string): Promise<User | null> {
  const snap = await getDoc(doc(db, "users", id));
  if (!snap.exists()) return null;
  return {
    id: snap.id,
    ...snap.data(),
    createdAt: toDate(snap.data().createdAt),
  } as User;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-AT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
