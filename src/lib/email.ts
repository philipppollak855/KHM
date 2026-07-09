import nodemailer from "nodemailer";

export function isEmailConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

export async function sendInvoiceEmail(options: {
  to: string;
  customerName: string;
  invoiceNumber: string;
  orderNumber: string;
  total: string;
  pdfBuffer: Buffer;
}) {
  if (!isEmailConfigured()) {
    throw new Error(
      "E-Mail-Versand nicht konfiguriert (SMTP_HOST, SMTP_USER, SMTP_PASS)."
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from =
    process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@khm-handmade.at";

  await transporter.sendMail({
    from: `KHM <${from}>`,
    to: options.to,
    subject: `Ihre Rechnung ${options.invoiceNumber} – KHM`,
    html: `
      <p>Sehr geehrte/r ${options.customerName},</p>
      <p>vielen Dank für Ihren Einkauf bei Kevin's Handmade Manufactur.</p>
      <p>Bestellung: <strong>${options.orderNumber}</strong><br>
      Rechnung: <strong>${options.invoiceNumber}</strong><br>
      Betrag: <strong>${options.total}</strong></p>
      <p>Im Anhang finden Sie Ihre Rechnung als PDF.</p>
      <p>Herzliche Grüße aus dem Schneebergland,<br>Ihr KHM-Team</p>
    `,
    attachments: [
      {
        filename: `Rechnung_${options.invoiceNumber}.pdf`,
        content: options.pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

export async function sendDunningEmail(options: {
  to: string;
  customerName: string;
  invoiceNumber: string;
  orderNumber: string;
  total: string;
  dueDate: string;
  reminderLevel: number;
  reminderLabel: string;
  iban: string;
  bic: string;
  bankName: string;
}) {
  if (!isEmailConfigured()) {
    throw new Error(
      "E-Mail-Versand nicht konfiguriert (SMTP_HOST, SMTP_USER, SMTP_PASS)."
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from =
    process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@khm-handmade.at";

  const urgency =
    options.reminderLevel >= 3
      ? "Wir bitten Sie dringend, den offenen Betrag umgehend zu begleichen."
      : options.reminderLevel >= 2
        ? "Bitte begleichen Sie den offenen Betrag innerhalb von 7 Tagen."
        : "Bitte überweisen Sie den offenen Betrag zeitnah.";

  await transporter.sendMail({
    from: `KHM <${from}>`,
    to: options.to,
    subject: `${options.reminderLabel}: Rechnung ${options.invoiceNumber} – KHM`,
    html: `
      <p>Sehr geehrte/r ${options.customerName},</p>
      <p><strong>${options.reminderLabel}</strong></p>
      <p>zu Ihrer Bestellung <strong>${options.orderNumber}</strong> ist die Rechnung
      <strong>${options.invoiceNumber}</strong> über <strong>${options.total}</strong>
      mit Fälligkeit am <strong>${options.dueDate}</strong> noch offen.</p>
      <p>${urgency}</p>
      <p><strong>Bankverbindung:</strong><br>
      ${options.bankName}<br>
      IBAN: ${options.iban}<br>
      BIC: ${options.bic}<br>
      Verwendungszweck: <strong>${options.invoiceNumber}</strong></p>
      <p>Bei Fragen erreichen Sie uns unter dieser E-Mail-Adresse.</p>
      <p>Herzliche Grüße,<br>Ihr KHM-Team</p>
    `,
  });
}
