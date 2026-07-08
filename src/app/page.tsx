import Link from "next/link";
import { ArrowRight, Leaf, Heart, Mountain } from "lucide-react";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/shop/ProductCard";
import { getActiveProducts } from "@/lib/firestore";

export default async function HomePage() {
  let featuredProducts: Awaited<ReturnType<typeof getActiveProducts>> = [];
  try {
    const products = await getActiveProducts();
    featuredProducts = products.filter((p) => p.featured).slice(0, 3);
    if (featuredProducts.length === 0) {
      featuredProducts = products.slice(0, 3);
    }
  } catch {
    // Firestore may not be ready yet
  }

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🌲</div>
          <div className="absolute bottom-20 right-20 text-6xl">🍂</div>
          <div className="absolute top-1/2 left-1/3 text-5xl">🌿</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-2xl">
            <p className="text-wheat text-sm font-medium tracking-widest uppercase mb-4">
              Schneebergland · Niederösterreich
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-cream leading-tight mb-6">
              Handgemacht mit Herz &amp; Holz
            </h1>
            <p className="text-cream/80 text-lg md:text-xl leading-relaxed mb-8">
              Willkommen bei Kevin&apos;s Handmade Manufactur. Jedes Stück wird
              mit Liebe zum Detail in unserer Werkstatt im Schneebergland
              gefertigt – aus regionalen Materialien und nach alter Tradition.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop">
                <Button size="lg" variant="secondary">
                  Zum Shop
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/ueber-uns">
                <Button size="lg" variant="outline" className="border-cream text-cream hover:bg-cream hover:text-wood-dark">
                  Unsere Geschichte
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-wood-dark mb-4">
              Was uns ausmacht
            </h2>
            <p className="text-wood/60 max-w-xl mx-auto">
              Qualität, die man sieht und fühlt – verwurzelt in der Natur
              unserer Heimat.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: "Natürliche Materialien",
                text: "Wir verwenden ausschließlich regionale und nachhaltige Rohstoffe aus dem Schneebergland.",
              },
              {
                icon: Heart,
                title: "Mit Liebe gefertigt",
                text: "Jedes Produkt ist ein Unikat – handgefertigt in unserer kleinen Manufaktur.",
              },
              {
                icon: Mountain,
                title: "Heimatverbunden",
                text: "Inspiriert von der Schönheit und Tradition unserer bergigen Heimat.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="text-center p-8 rounded-2xl bg-cream-dark/50 border border-wood/10 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-forest/10 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-forest" />
                </div>
                <h3 className="font-display text-xl font-semibold text-wood-dark mb-3">
                  {title}
                </h3>
                <p className="text-wood/60 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-cream-dark/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl font-bold text-wood-dark mb-2">
                  Unsere Empfehlungen
                </h2>
                <p className="text-wood/60">Beliebte handgemachte Produkte</p>
              </div>
              <Link
                href="/shop"
                className="hidden sm:flex items-center gap-1 text-forest font-medium hover:underline"
              >
                Alle Produkte <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 hero-gradient">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cream mb-4">
            Bereit für etwas Besonderes?
          </h2>
          <p className="text-cream/70 mb-8 text-lg">
            Entdecken Sie unsere handgefertigten Produkte und bringen Sie ein
            Stück Schneebergland in Ihr Zuhause.
          </p>
          <Link href="/shop">
            <Button size="lg" variant="secondary">
              Jetzt einkaufen
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
