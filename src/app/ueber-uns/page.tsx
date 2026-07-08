import { Mountain, Heart, Hammer } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-14">
        <p className="text-forest text-sm font-medium tracking-widest uppercase mb-3">
          Unsere Geschichte
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-wood-dark mb-6">
          Aus dem Herzen des Schneeberglandes
        </h1>
        <p className="text-wood/70 text-lg leading-relaxed max-w-2xl mx-auto">
          Kevin&apos;s Handmade Manufactur entstand aus der Liebe zur Handwerkskunst
          und der Verbundenheit mit unserer Heimat. In unserer kleinen Werkstatt
          im Schneebergland fertigen wir jedes Stück mit Hingabe und Respekt vor
          der Natur.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          {
            icon: Mountain,
            title: "Verwurzelt",
            text: "Unsere Heimat im Schneebergland inspiriert jedes unserer Produkte – die Berge, Wälder und Traditionen der Region.",
          },
          {
            icon: Hammer,
            title: "Handwerklich",
            text: "Jedes Stück wird von Hand gefertigt. Keine Massenproduktion, sondern echtes Handwerk mit Liebe zum Detail.",
          },
          {
            icon: Heart,
            title: "Nachhaltig",
            text: "Wir verwenden regionale und nachhaltige Materialien – vor allem Holz aus heimischen Wäldern.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="text-center p-6 rounded-2xl bg-cream border border-wood/10"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-forest/10 flex items-center justify-center">
              <Icon className="w-7 h-7 text-forest" />
            </div>
            <h2 className="font-display text-xl font-semibold text-wood-dark mb-2">
              {title}
            </h2>
            <p className="text-sm text-wood/60 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      <div className="bg-wood-dark text-cream rounded-2xl p-10 text-center">
        <h2 className="font-display text-2xl font-bold mb-4">
          Besuchen Sie unsere Werkstatt
        </h2>
        <p className="text-cream/70 max-w-lg mx-auto">
          Gerne können Sie unsere Manufaktur im Schneebergland besuchen und
          sehen, wie unsere Produkte entstehen. Vereinbaren Sie einen Termin
          über unsere Kontaktseite.
        </p>
      </div>
    </div>
  );
}
