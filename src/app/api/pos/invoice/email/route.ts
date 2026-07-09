import { NextRequest, NextResponse } from "next/server";
import { requireModuleWrite } from "@/lib/admin-auth";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { getCompanySettingsServer } from "@/lib/company-server";
import { invoicePdfToBuffer } from "@/lib/documents/pdf";
import { fetchBrandingImageData } from "@/lib/branding-image";
import { sendInvoiceEmail, isEmailConfigured } from "@/lib/email";
import { handleRouteError, parseJsonBody } from "@/lib/api-route";
import type { Invoice } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModuleWrite(req, "pos");
    if ("error" in auth && auth.error) return auth.error;

    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: "E-Mail-Versand nicht konfiguriert (SMTP-Variablen fehlen)." },
        { status: 503 }
      );
    }

    const body = await parseJsonBody(req);
    if (body instanceof NextResponse) return body;

    const invoiceId = String(body.invoiceId || "").trim();
    const email = String(body.email || "").trim();
    if (!invoiceId || !email) {
      return NextResponse.json(
        { error: "Rechnung und E-Mail erforderlich." },
        { status: 400 }
      );
    }

    const snap = await getAdminFirestore().collection("invoices").doc(invoiceId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Rechnung nicht gefunden." }, { status: 404 });
    }

    const data = snap.data()!;
    const invoice: Invoice = {
      id: snap.id,
      ...data,
      issuedAt: data.issuedAt?.toDate?.() || new Date(),
      dueAt: data.dueAt?.toDate?.() || new Date(),
      paidAt: data.paidAt?.toDate?.(),
    } as Invoice;

    const company = await getCompanySettingsServer();
    const logo = await fetchBrandingImageData(company.logoUrl);
    const pdfBuffer = await invoicePdfToBuffer(invoice, company, logo);

    await sendInvoiceEmail({
      to: email,
      customerName: invoice.customerName,
      userId: invoice.userId,
      invoiceNumber: invoice.invoiceNumber,
      orderNumber: invoice.orderNumber,
      total: formatEuro(invoice.total),
      pdfBuffer,
      companyName: company.name,
      logoUrl: company.logoUrl,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError(err, "pos/invoice/email POST");
  }
}
