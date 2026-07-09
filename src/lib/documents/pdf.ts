import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { CompanySettings, Order, Invoice, DeliveryNote, OrderItem, TaxBreakdownLine } from "../types";
import { formatPrice, formatDate } from "../firestore";

const FOREST: [number, number, number] = [61, 79, 50];
const WOOD: [number, number, number] = [44, 33, 24];
const MUTED: [number, number, number] = [120, 110, 100];

function fmt(n: number) {
  return formatPrice(n);
}

function drawLetterhead(doc: jsPDF, company: CompanySettings, docTitle: string, docNumber: string) {
  const w = doc.internal.pageSize.getWidth();

  doc.setFillColor(...FOREST);
  doc.rect(0, 0, w, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...WOOD);
  doc.text(company.name, 20, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(company.tagline, 20, 28);
  doc.text(
    `${company.street} · ${company.zip} ${company.city} · ${company.country}`,
    20,
    33
  );
  doc.text(
    `${company.email} · ${company.phone} · UID: ${company.uid}`,
    20,
    38
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...FOREST);
  doc.text(docTitle, w - 20, 22, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(docNumber, w - 20, 28, { align: "right" });
  doc.text(formatDate(new Date()), w - 20, 33, { align: "right" });

  doc.setDrawColor(...FOREST);
  doc.setLineWidth(0.3);
  doc.line(20, 44, w - 20, 44);
}

function drawAddressBlock(
  doc: jsPDF,
  label: string,
  name: string,
  street: string,
  zip: string,
  city: string,
  country: string,
  x: number,
  y: number
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(label, x, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...WOOD);
  doc.text(name, x, y + 6);
  doc.text(street, x, y + 12);
  doc.text(`${zip} ${city}`, x, y + 18);
  doc.text(country, x, y + 24);
}

function itemTableBody(items: OrderItem[]) {
  return items.map((i) => [
    i.name,
    String(i.quantity),
    fmt(i.price),
    `${i.taxRate} %`,
    fmt(i.netAmount),
    fmt(i.taxAmount),
    fmt(i.grossAmount),
  ]);
}

function drawTotals(
  doc: jsPDF,
  y: number,
  data: {
    subtotalNet: number;
    taxBreakdown: TaxBreakdownLine[];
    shipping: number;
    total: number;
  }
) {
  const w = doc.internal.pageSize.getWidth();
  const x = w - 80;

  doc.setFontSize(9);
  doc.setTextColor(...WOOD);

  let cy = y;
  doc.text("Netto:", x, cy);
  doc.text(fmt(data.subtotalNet), w - 20, cy, { align: "right" });
  cy += 6;

  for (const line of data.taxBreakdown) {
    doc.text(`USt. ${line.rate} %:`, x, cy);
    doc.text(fmt(line.tax), w - 20, cy, { align: "right" });
    cy += 6;
  }

  if (data.shipping > 0) {
    doc.text("Versand:", x, cy);
    doc.text(fmt(data.shipping), w - 20, cy, { align: "right" });
    cy += 6;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Gesamt (brutto):", x, cy);
  doc.text(fmt(data.total), w - 20, cy, { align: "right" });

  doc.setFont("helvetica", "normal");
}

function drawFooter(doc: jsPDF, company: CompanySettings) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...FOREST);
  doc.line(20, h - 22, w - 20, h - 22);
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(
    `${company.name} · ${company.bankName} · IBAN: ${company.iban} · BIC: ${company.bic}`,
    w / 2,
    h - 16,
    { align: "center" }
  );
  if (company.firmenbuch) {
    doc.text(company.firmenbuch, w / 2, h - 11, { align: "center" });
  }
}

function downloadPdf(doc: jsPDF, filename: string) {
  doc.save(filename);
}

export function buildInvoicePdfDocument(
  invoice: Invoice,
  company: CompanySettings
): jsPDF {
  const doc = new jsPDF();
  drawLetterhead(doc, company, "RECHNUNG", invoice.invoiceNumber);

  drawAddressBlock(
    doc,
    "Rechnungsempfänger",
    invoice.customerName,
    invoice.shippingAddress.street,
    invoice.shippingAddress.zip,
    invoice.shippingAddress.city,
    invoice.shippingAddress.country,
    20,
    56
  );

  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`Bestellung: ${invoice.orderNumber}`, 20, 92);
  doc.text(`Fällig am: ${formatDate(invoice.dueAt)}`, 20, 97);

  autoTable(doc, {
    startY: 104,
    head: [["Artikel", "Menge", "EP (brutto)", "USt.", "Netto", "USt.-Betrag", "Brutto"]],
    body: itemTableBody(invoice.items),
    theme: "plain",
    headStyles: { fillColor: FOREST, textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: WOOD },
    margin: { left: 20, right: 20 },
  });

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  drawTotals(doc, finalY, {
    subtotalNet: invoice.subtotalNet,
    taxBreakdown: invoice.taxBreakdown,
    shipping: invoice.shipping,
    total: invoice.total,
  });

  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    "Vielen Dank für Ihren Einkauf bei KHM.",
    20,
    finalY + 30
  );

  drawFooter(doc, company);
  return doc;
}

export function invoicePdfToBuffer(
  invoice: Invoice,
  company: CompanySettings
): Buffer {
  const doc = buildInvoicePdfDocument(invoice, company);
  return Buffer.from(doc.output("arraybuffer"));
}

export function generateInvoicePdf(invoice: Invoice, company: CompanySettings) {
  const doc = buildInvoicePdfDocument(invoice, company);
  downloadPdf(doc, `Rechnung_${invoice.invoiceNumber}.pdf`);
}

export function generateInvoicePdfBlob(
  invoice: Invoice,
  company: CompanySettings
): Blob {
  const doc = buildInvoicePdfDocument(invoice, company);
  return doc.output("blob");
}

export function generateOrderConfirmationPdf(order: Order, company: CompanySettings) {
  const doc = new jsPDF();
  drawLetterhead(doc, company, "AUFTRAGSBESTÄTIGUNG", order.orderNumber);

  drawAddressBlock(
    doc,
    "Lieferadresse",
    order.customerName,
    order.shippingAddress.street,
    order.shippingAddress.zip,
    order.shippingAddress.city,
    order.shippingAddress.country,
    20,
    56
  );

  doc.setFontSize(9);
  doc.setTextColor(...WOOD);
  doc.text(`Sehr geehrte/r ${order.customerName},`, 20, 92);
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  const lines = doc.splitTextToSize(
    "vielen Dank für Ihre Bestellung. Wir bestätigen hiermit den Eingang und werden Ihren Auftrag schnellstmöglich bearbeiten.",
    170
  );
  doc.text(lines, 20, 100);

  autoTable(doc, {
    startY: 112,
    head: [["Artikel", "Menge", "EP (brutto)", "USt.", "Netto", "USt.-Betrag", "Brutto"]],
    body: itemTableBody(order.items),
    theme: "plain",
    headStyles: { fillColor: FOREST, textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: WOOD },
    margin: { left: 20, right: 20 },
  });

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  drawTotals(doc, finalY, {
    subtotalNet: order.subtotalNet,
    taxBreakdown: aggregateFromItems(order.items),
    shipping: order.shipping,
    total: order.total,
  });

  if (order.notes) {
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Anmerkung: ${order.notes}`, 20, finalY + 28);
  }

  drawFooter(doc, company);
  downloadPdf(doc, `Auftragsbestaetigung_${order.orderNumber}.pdf`);
}

export function generateDeliveryNotePdf(note: DeliveryNote, company: CompanySettings) {
  const doc = new jsPDF();
  drawLetterhead(doc, company, "LIEFERSCHEIN", note.deliveryNoteNumber);

  drawAddressBlock(
    doc,
    "Lieferadresse",
    note.customerName,
    note.shippingAddress.street,
    note.shippingAddress.zip,
    note.shippingAddress.city,
    note.shippingAddress.country,
    20,
    56
  );

  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`Bestellung: ${note.orderNumber}`, 20, 92);

  autoTable(doc, {
    startY: 100,
    head: [["Artikel", "Menge", "Bemerkung"]],
    body: note.items.map((i) => [i.name, String(i.quantity), ""]),
    theme: "plain",
    headStyles: { fillColor: FOREST, textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: WOOD },
    margin: { left: 20, right: 20 },
  });

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("Ware erhalten am: _________________________", 20, finalY);
  doc.text("Unterschrift: _________________________", 20, finalY + 12);

  drawFooter(doc, company);
  downloadPdf(doc, `Lieferschein_${note.deliveryNoteNumber}.pdf`);
}

function aggregateFromItems(items: OrderItem[]): TaxBreakdownLine[] {
  const map = new Map<number, TaxBreakdownLine>();
  for (const item of items) {
    const e = map.get(item.taxRate) ?? { rate: item.taxRate, net: 0, tax: 0, gross: 0 };
    e.net += item.netAmount;
    e.tax += item.taxAmount;
    e.gross += item.grossAmount;
    map.set(item.taxRate, e);
  }
  return Array.from(map.values());
}
