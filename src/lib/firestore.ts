import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
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
  DeliveryNote,
  User,
  OrderItem,
  Address,
  ShippingZone,
  CompanySettings,
  ContactInquiry,
  ContactInquiryStatus,
  StockMovement,
} from "./types";
import { DEFAULT_COMPANY } from "./company";
import { DEFAULT_SHIPPING_ZONES } from "./shipping";
import { validateCartStock, restockOrder } from "./inventory";
import { auth } from "./firebase";
import type { CartItem } from "./types";

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}

// ─── Categories ───────────────────────────────────────────────

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

// ─── Products ─────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    taxRate: d.data().taxRate ?? 20,
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
    taxRate: d.data().taxRate ?? 20,
    createdAt: toDate(d.data().createdAt),
  })) as Product[];
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) return null;
  return {
    id: snap.id,
    ...snap.data(),
    taxRate: snap.data().taxRate ?? 20,
    createdAt: toDate(snap.data().createdAt),
  } as Product;
}

export async function createProduct(data: Omit<Product, "id" | "createdAt">) {
  return addDoc(collection(db, "products"), {
    ...data,
    taxRate: data.taxRate ?? 20,
    createdAt: serverTimestamp(),
  });
}

export async function updateProduct(id: string, data: Partial<Product>) {
  return updateDoc(doc(db, "products", id), data);
}

export async function deleteProduct(id: string) {
  return deleteDoc(doc(db, "products", id));
}

// ─── Settings ─────────────────────────────────────────────────

export async function getCompanySettings(): Promise<CompanySettings> {
  const snap = await getDoc(doc(db, "settings", "company"));
  if (!snap.exists()) return DEFAULT_COMPANY;
  return { ...DEFAULT_COMPANY, ...snap.data() } as CompanySettings;
}

export async function saveCompanySettings(data: CompanySettings) {
  return setDoc(doc(db, "settings", "company"), data, { merge: true });
}

export async function getShippingZones(): Promise<ShippingZone[]> {
  const snap = await getDocs(
    query(collection(db, "shippingZones"), orderBy("sortOrder"))
  );
  if (snap.empty) return DEFAULT_SHIPPING_ZONES.map((z, i) => ({
    ...z,
    id: `default-${i}`,
  }));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ShippingZone));
}

export async function createShippingZone(data: Omit<ShippingZone, "id">) {
  return addDoc(collection(db, "shippingZones"), data);
}

export async function updateShippingZone(id: string, data: Partial<ShippingZone>) {
  if (id.startsWith("default-")) {
    return addDoc(collection(db, "shippingZones"), data);
  }
  return updateDoc(doc(db, "shippingZones", id), data);
}

export async function deleteShippingZone(id: string) {
  if (id.startsWith("default-")) return;
  return deleteDoc(doc(db, "shippingZones", id));
}

export async function seedShippingZones() {
  const existing = await getDocs(collection(db, "shippingZones"));
  if (!existing.empty) return;
  for (const zone of DEFAULT_SHIPPING_ZONES) {
    await addDoc(collection(db, "shippingZones"), zone);
  }
}

// ─── Orders ───────────────────────────────────────────────────

function mapOrder(d: { id: string; data: () => Record<string, unknown> }): Order {
  const data = d.data();
  return {
    id: d.id,
    ...data,
    subtotalNet: (data.subtotalNet as number) ?? (data.subtotal as number) ?? 0,
    subtotalGross: (data.subtotalGross as number) ?? (data.subtotal as number) ?? 0,
    taxTotal: (data.taxTotal as number) ?? (data.tax as number) ?? 0,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } as Order;
}

export async function getOrders(): Promise<Order[]> {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(mapOrder);
}

export async function getOrder(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, "orders", id));
  if (!snap.exists()) return null;
  return mapOrder({ id: snap.id, data: () => snap.data() });
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapOrder);
}

export async function createOrder(data: {
  userId: string;
  customerName: string;
  customerEmail: string;
  cartItems: CartItem[];
  shipping: number;
  shippingAddress: Address;
  notes?: string;
  distanceKm?: number;
}) {
  const stockCheck = await validateCartStock(
    data.cartItems.map((i) => ({
      productId: i.productId,
      name: i.name,
      quantity: i.quantity,
    }))
  );
  if (!stockCheck.ok) {
    throw new Error(stockCheck.error);
  }

  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error("Nicht angemeldet.");
  }

  const res = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(payload.error || "Bestellung fehlgeschlagen.");
  }

  return payload as { orderId: string; orderNumber: string; invoiceId: string };
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  const order = await getOrder(id);
  if (!order) throw new Error("Bestellung nicht gefunden.");

  const updates: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  };

  if (
    status === "cancelled" &&
    order.status !== "cancelled" &&
    order.stockDeducted &&
    !order.stockRestocked
  ) {
    const adminUser = auth.currentUser;
    if (!adminUser) throw new Error("Nur Admins können Bestellungen stornieren.");
    await restockOrder(id, order.orderNumber, order.items, adminUser.uid);
    updates.stockRestocked = true;
  }

  if (status === "shipped" && !order.deliveryNoteId) {
    const noteRef = await createDeliveryNote(order);
    updates.deliveryNoteId = noteRef.id;
  }

  return updateDoc(doc(db, "orders", id), updates);
}

// ─── Invoices ─────────────────────────────────────────────────

function mapInvoice(d: { id: string; data: () => Record<string, unknown> }): Invoice {
  const data = d.data();
  return {
    id: d.id,
    ...data,
    subtotalNet: (data.subtotalNet as number) ?? 0,
    subtotalGross: (data.subtotalGross as number) ?? (data.subtotal as number) ?? 0,
    taxTotal: (data.taxTotal as number) ?? (data.tax as number) ?? 0,
    taxBreakdown: (data.taxBreakdown as Invoice["taxBreakdown"]) ?? [],
    shipping: (data.shipping as number) ?? 0,
    issuedAt: toDate(data.issuedAt),
    dueAt: toDate(data.dueAt),
    paidAt: data.paidAt ? toDate(data.paidAt) : undefined,
  } as Invoice;
}

export async function getInvoices(): Promise<Invoice[]> {
  const q = query(collection(db, "invoices"), orderBy("issuedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(mapInvoice);
}

export async function getInvoicesByUser(userId: string): Promise<Invoice[]> {
  const q = query(
    collection(db, "invoices"),
    where("userId", "==", userId),
    orderBy("issuedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapInvoice);
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const snap = await getDoc(doc(db, "invoices", id));
  if (!snap.exists()) return null;
  return mapInvoice({ id: snap.id, data: () => snap.data() });
}

export async function getInvoiceByOrder(orderId: string): Promise<Invoice | null> {
  const q = query(collection(db, "invoices"), where("orderId", "==", orderId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return mapInvoice({ id: d.id, data: () => d.data() });
}

export async function updateInvoiceStatus(id: string, status: Invoice["status"]) {
  const updates: Record<string, unknown> = { status };
  if (status === "paid") updates.paidAt = serverTimestamp();
  return updateDoc(doc(db, "invoices", id), updates);
}

// ─── Delivery Notes ───────────────────────────────────────────

function mapDeliveryNote(d: { id: string; data: () => Record<string, unknown> }): DeliveryNote {
  const data = d.data();
  return {
    id: d.id,
    ...data,
    createdAt: toDate(data.createdAt),
  } as DeliveryNote;
}

export async function createDeliveryNote(order: Order) {
  const deliveryNoteNumber = `LS-${Date.now().toString(36).toUpperCase()}`;
  return addDoc(collection(db, "deliveryNotes"), {
    deliveryNoteNumber,
    orderId: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    items: order.items,
    shippingAddress: order.shippingAddress,
    createdAt: serverTimestamp(),
  });
}

export async function getDeliveryNotes(): Promise<DeliveryNote[]> {
  const q = query(collection(db, "deliveryNotes"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(mapDeliveryNote);
}

export async function getDeliveryNote(id: string): Promise<DeliveryNote | null> {
  const snap = await getDoc(doc(db, "deliveryNotes", id));
  if (!snap.exists()) return null;
  return mapDeliveryNote({ id: snap.id, data: () => snap.data() });
}

export async function getDeliveryNotesByUser(userId: string): Promise<DeliveryNote[]> {
  const q = query(
    collection(db, "deliveryNotes"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapDeliveryNote);
}

// ─── Users ────────────────────────────────────────────────────

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

// ─── Contact Inquiries ────────────────────────────────────────

function mapContactInquiry(d: {
  id: string;
  data: () => Record<string, unknown>;
}): ContactInquiry {
  const data = d.data();
  return {
    id: d.id,
    name: data.name as string,
    email: data.email as string,
    subject: data.subject as string,
    message: data.message as string,
    status: (data.status as ContactInquiryStatus) || "new",
    createdAt: toDate(data.createdAt),
  };
}

export async function createContactInquiry(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return addDoc(collection(db, "contactInquiries"), {
    name: data.name.trim(),
    email: data.email.trim(),
    subject: data.subject.trim(),
    message: data.message.trim(),
    status: "new",
    createdAt: serverTimestamp(),
  });
}

export async function getContactInquiries(): Promise<ContactInquiry[]> {
  const q = query(
    collection(db, "contactInquiries"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) =>
    mapContactInquiry({ id: d.id, data: () => d.data() })
  );
}

export async function updateContactInquiryStatus(
  id: string,
  status: ContactInquiryStatus
) {
  return updateDoc(doc(db, "contactInquiries", id), { status });
}

// ─── Stock Movements ──────────────────────────────────────────

export async function getStockMovements(limit = 50): Promise<StockMovement[]> {
  const q = query(
    collection(db, "stockMovements"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.slice(0, limit).map((d) => {
    const data = d.data();
    return {
      id: d.id,
      productId: data.productId as string,
      productName: data.productName as string,
      delta: data.delta as number,
      stockAfter: data.stockAfter as number,
      reason: data.reason as StockMovement["reason"],
      orderId: data.orderId as string | undefined,
      orderNumber: data.orderNumber as string | undefined,
      note: data.note as string | undefined,
      createdBy: data.createdBy as string,
      createdAt: toDate(data.createdAt),
    };
  });
}

// ─── Helpers ──────────────────────────────────────────────────

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
