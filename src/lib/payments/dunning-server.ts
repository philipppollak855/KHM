import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { sendDunningEmail, isEmailConfigured } from "@/lib/email";
import { getCompanySettingsServer } from "@/lib/company-server";

const REMINDER_LABELS = [
  "",
  "Zahlungserinnerung",
  "1. Mahnung",
  "2. Mahnung",
] as const;

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
}

export async function processDunningReminders() {
  const db = getAdminFirestore();
  const now = Timestamp.now();
  const snap = await db
    .collection("invoices")
    .where("status", "==", "sent")
    .get();

  const company = await getCompanySettingsServer();
  const results: Array<{ invoiceId: string; level: number; sent: boolean; error?: string }> = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    const dueAt = data.dueAt?.toDate?.() as Date | undefined;
    if (!dueAt || dueAt > new Date()) continue;

    const daysOverdue = daysSince(dueAt);
    const currentLevel = (data.reminderLevel as number) || 0;
    let targetLevel = 0;

    if (daysOverdue >= 14 && currentLevel < 3) targetLevel = 3;
    else if (daysOverdue >= 7 && currentLevel < 2) targetLevel = 2;
    else if (daysOverdue >= 0 && currentLevel < 1) targetLevel = 1;

    if (targetLevel <= currentLevel) continue;

    const email = data.customerEmail as string;
    if (!email) {
      results.push({
        invoiceId: doc.id,
        level: targetLevel,
        sent: false,
        error: "Keine E-Mail-Adresse",
      });
      continue;
    }

    if (!isEmailConfigured()) {
      results.push({
        invoiceId: doc.id,
        level: targetLevel,
        sent: false,
        error: "SMTP nicht konfiguriert",
      });
      continue;
    }

    try {
      await sendDunningEmail({
        to: email,
        customerName: data.customerName as string,
        userId: data.userId as string,
        invoiceNumber: data.invoiceNumber as string,
        orderNumber: data.orderNumber as string,
        total: formatEuro(data.total as number),
        dueDate: dueAt.toLocaleDateString("de-AT"),
        reminderLevel: targetLevel,
        reminderLabel: REMINDER_LABELS[targetLevel] || "Mahnung",
        iban: company.iban,
        bic: company.bic,
        bankName: company.bankName,
      });

      await doc.ref.update({
        reminderLevel: targetLevel,
        lastReminderAt: FieldValue.serverTimestamp(),
      });

      results.push({ invoiceId: doc.id, level: targetLevel, sent: true });
    } catch (err) {
      results.push({
        invoiceId: doc.id,
        level: targetLevel,
        sent: false,
        error: err instanceof Error ? err.message : "E-Mail fehlgeschlagen",
      });
    }
  }

  return {
    processed: results.length,
    sent: results.filter((r) => r.sent).length,
    results,
    checkedAt: now.toDate().toISOString(),
  };
}

export async function sendManualReminder(invoiceId: string, adminUserId: string) {
  const db = getAdminFirestore();
  const doc = await db.collection("invoices").doc(invoiceId).get();
  if (!doc.exists) throw new Error("Rechnung nicht gefunden.");

  const data = doc.data()!;
  if (data.status !== "sent") {
    throw new Error("Nur offene Rechnungen können gemahnt werden.");
  }

  const email = data.customerEmail as string;
  if (!email) throw new Error("Keine E-Mail-Adresse beim Kunden.");

  if (!isEmailConfigured()) {
    throw new Error("E-Mail-Versand nicht konfiguriert (SMTP).");
  }

  const currentLevel = Math.min(((data.reminderLevel as number) || 0) + 1, 3);
  const dueAt = data.dueAt?.toDate?.() as Date;
  const company = await getCompanySettingsServer();

  await sendDunningEmail({
    to: email,
    customerName: data.customerName as string,
    userId: data.userId as string,
    invoiceNumber: data.invoiceNumber as string,
    orderNumber: data.orderNumber as string,
    total: formatEuro(data.total as number),
    dueDate: dueAt?.toLocaleDateString("de-AT") || "–",
    reminderLevel: currentLevel,
    reminderLabel: REMINDER_LABELS[currentLevel] || "Mahnung",
    iban: company.iban,
    bic: company.bic,
    bankName: company.bankName,
  });

  await doc.ref.update({
    reminderLevel: currentLevel,
    lastReminderAt: FieldValue.serverTimestamp(),
    lastReminderBy: adminUserId,
  });

  return { invoiceId, reminderLevel: currentLevel };
}
