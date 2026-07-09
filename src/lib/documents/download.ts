import {
  getCompanySettings,
  getInvoice,
  getOrder,
  getDeliveryNote,
} from "../firestore";
import {
  generateInvoicePdf,
  generateInvoicePdfBlob,
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

export async function printInvoicePdf(invoiceId: string) {
  const [invoice, company] = await Promise.all([
    getInvoice(invoiceId),
    getCompanySettings(),
  ]);
  if (!invoice) throw new Error("Rechnung nicht gefunden");

  const blob = generateInvoicePdfBlob(invoice, company);
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.src = url;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    }, 2000);
  };
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
