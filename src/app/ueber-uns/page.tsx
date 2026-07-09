import Link from "next/link";
import { Mountain, Heart, Hammer, ArrowRight } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader
        label="Unsere Geschichte"
        title="Aus dem Herzen des Schneeberglandes"
        description="Kevin's Handmade Manufactur entstand aus der Liebe zur Handwerkskunst und der Verbundenheit mit unserer Heimat."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          { icon: Mountain, title: "Verwurzelt", text: "Inspiriert von den Bergen, Wäldern und Traditionen unserer Region." },
          { icon: Hammer, title: "Handwerklich", text: "Jedes Stück von Hand gefertigt — kein Fließband, sondern echtes Handwerk." },
          { icon: Heart, title: "Nachhaltig", text: "Regionale Materialien, vor allem Holz aus heimischen Wäldern." },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="text-center p-6 bg-linen border border-wood/10">
            <div className="w-12 h-12 mx-auto mb-4 border border-forest/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-forest" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-xl font-light text-wood-dark mb-2">{title}</h2>
            <p className="text-sm text-stone leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      <div className="bg-wood-dark text-linen p-10 text-center">
        <h2 className="font-display text-2xl font-light mb-4">Besuchen Sie unsere Werkstatt</h2>
        <p className="text-linen/60 max-w-lg mx-auto mb-6">
          Erleben Sie, wie unsere Produkte entstehen. Vereinbaren Sie einen Termin über unsere Kontaktseite.
        </p>
        <Link href="/kontakt" className="inline-flex items-center gap-2 text-sm tracking-wider uppercase text-wheat hover:text-linen transition-colors">
          Kontakt aufnehmen <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
