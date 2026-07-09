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

function printPdfBlob(blob: Blob, title = "Dokument"): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);

    const popup = window.open(url, "_blank", "noopener,noreferrer");
    if (popup) {
      let printed = false;
      const triggerPrint = () => {
        if (printed) return;
        printed = true;
        try {
          popup.focus();
          popup.print();
          setTimeout(() => URL.revokeObjectURL(url), 120_000);
          resolve();
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err instanceof Error ? err : new Error("Drucken fehlgeschlagen"));
        }
      };

      popup.addEventListener("load", triggerPrint, { once: true });
      setTimeout(triggerPrint, 1000);
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.setAttribute("title", title);
    iframe.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;border:none;z-index:99999;background:#fff";
    iframe.src = url;

    iframe.onload = () => {
      try {
        const win = iframe.contentWindow;
        if (!win) throw new Error("Druckvorschau nicht verfügbar");
        win.focus();
        win.print();

        const cleanup = () => {
          URL.revokeObjectURL(url);
          iframe.remove();
          resolve();
        };

        win.addEventListener("afterprint", cleanup, { once: true });
        setTimeout(cleanup, 120_000);
      } catch (err) {
        URL.revokeObjectURL(url);
        iframe.remove();
        reject(err instanceof Error ? err : new Error("Drucken fehlgeschlagen"));
      }
    };

    iframe.onerror = () => {
      URL.revokeObjectURL(url);
      iframe.remove();
      reject(new Error("PDF konnte nicht geladen werden"));
    };

    document.body.appendChild(iframe);
  });
}

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

  const blob = generateInvoicePdfBlob(invoice, company, { autoPrint: true });
  try {
    await printPdfBlob(blob, `Rechnung ${invoice.invoiceNumber}`);
  } catch {
    generateInvoicePdf(invoice, company);
    throw new Error(
      "Druckdialog konnte nicht geöffnet werden. PDF wurde heruntergeladen – bitte dort drucken."
    );
  }
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
