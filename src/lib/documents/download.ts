import {
  getCompanySettings,
  getInvoice,
  getOrder,
  getDeliveryNote,
} from "../firestore";
import {
  generateInvoicePdf,
  generateOrderConfirmationPdf,
  generateDeliveryNotePdf,
} from "./pdf";

export async function downloadInvoicePdf(invoiceId: string) {
  const [invoice, company] = await Promise.all([
    getInvoice(invoiceId),
    getCompanySettings(),
  ]);
  if (!invoice) throw new Error("Rechnung nicht gefunden");
  generateInvoicePdf(invoice, company);
}

export async function downloadOrderConfirmationPdf(orderId: string) {
  const [order, company] = await Promise.all([
    getOrder(orderId),
    getCompanySettings(),
  ]);
  if (!order) throw new Error("Bestellung nicht gefunden");
  generateOrderConfirmationPdf(order, company);
}

export async function downloadDeliveryNotePdf(noteId: string) {
  const [note, company] = await Promise.all([
    getDeliveryNote(noteId),
    getCompanySettings(),
  ]);
  if (!note) throw new Error("Lieferschein nicht gefunden");
  generateDeliveryNotePdf(note, company);
}
