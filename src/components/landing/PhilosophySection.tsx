import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PhilosophySection() {
  return (
    <section className="py-28 md:py-36 bg-linen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1456418334949-335f95ebda59?w=800&q=85"
                alt="Handwerkskunst in der Werkstatt"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 border border-wheat/30 -z-10 hidden md:block" />
            <div className="absolute -top-4 -left-4 w-full h-full border border-forest/10 -z-10" />
          </div>

          <div>
            <p className="section-label text-bark mb-5">Unsere Philosophie</p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-wood-dark leading-tight mb-8">
              Langsam gemacht.
              <br />
              <span className="italic">Mit Bedacht.</span>
            </h2>
            <div className="space-y-5 text-stone leading-relaxed">
              <p>
                Kevin&apos;s Handmade Manufactur steht für eine Rückbesinnung auf
                echtes Handwerk. Inmitten des Schneeberglandes fertigen wir
                Produkte, die Zeit, Geduld und Respekt vor dem Material
                verdienen.
              </p>
              <p>
                Keine Massenproduktion, keine Eile — nur die ruhige Arbeit der
                Hände, die Holz, Wolle und Naturmaterialien in etwas
                Bleibendes verwandeln.
              </p>
            </div>
            <div className="mt-10 pt-8 border-t border-wood/10 flex items-center justify-between">
              <div>
                <p className="font-display text-3xl text-forest font-light">2018</p>
                <p className="text-xs tracking-widest uppercase text-stone mt-1">
                  Gegründet im Schneebergland
                </p>
              </div>
              <Link
                href="/ueber-uns"
                className="inline-flex items-center gap-2 text-sm tracking-wider uppercase text-forest hover:text-forest-light transition-colors"
              >
                Mehr erfahren
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
