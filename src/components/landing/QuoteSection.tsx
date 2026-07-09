import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LANDING_IMAGES } from "@/lib/marketing-images";

export default function QuoteSection() {
  return (
    <section className="relative py-32 md:py-40 overflow-hidden">
      <Image
        src={LANDING_IMAGES.quoteNature}
        alt="Naturdetail"
        fill
        className="object-cover"
        sizes="100vw"
        unoptimized
      />
      <div className="absolute inset-0 bg-wood-dark/80" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="ornament-line mb-12 max-w-xs mx-auto">
          <span className="text-wheat/60 text-lg">✦</span>
        </div>
        <blockquote className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-linen leading-snug italic mb-10">
          „Was von Hand gemacht wird, trägt die Wärme der Hände, die es formten —
          lange nachdem es unser Haus verlassen hat.“
        </blockquote>
        <p className="text-wheat/70 text-sm tracking-[0.2em] uppercase">
          Kevin · Gründer &amp; Handwerker
        </p>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="py-28 md:py-36 bg-forest text-linen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <p className="section-label text-sage mb-6">Ein Stück Heimat</p>
        <h2 className="font-display text-4xl md:text-5xl font-light mb-6 leading-tight">
          Bringen Sie das Schneebergland
          <br />
          <span className="italic">nach Hause</span>
        </h2>
        <p className="text-linen/60 leading-relaxed mb-10 max-w-lg mx-auto">
          Entdecken Sie unsere handgefertigte Kollektion — jedes Stück ein
          Unikat, gefertigt mit Sorgfalt und Liebe zum Detail.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-3 bg-linen text-wood-dark px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium hover:bg-linen-dark transition-colors duration-300"
        >
          Zur Kollektion
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
