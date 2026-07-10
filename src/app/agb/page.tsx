import PageHeader from "@/components/layout/PageHeader";
import LegalDocumentView from "@/components/legal/LegalDocumentView";
import { getSiteContentServer } from "@/lib/site-content-server";

export default async function AgbPage() {
  const { legal } = await getSiteContentServer();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader title={legal.agbOnline.title} />
      <LegalDocumentView document={legal.agbOnline} />
    </div>
  );
}
