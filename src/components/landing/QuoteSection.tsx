import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import StyledText from "@/components/content/StyledText";
import type { HomePageContent } from "@/lib/site-content";

interface QuoteProps {
  content: HomePageContent["quote"];
}

export default function QuoteSection({ content }: QuoteProps) {
  return (
    <section className="relative py-32 md:py-40 overflow-hidden">
      <Image
        src={content.imageUrl}
        alt={content.imageAlt}
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
          {content.text}
        </blockquote>
        <p className="text-wheat/70 text-sm tracking-[0.2em] uppercase">
          {content.attribution}
        </p>
      </div>
    </section>
  );
}

interface CtaProps {
  content: HomePageContent["cta"];
}

export function CtaSection({ content }: CtaProps) {
  return (
    <section className="py-28 md:py-36 bg-forest text-linen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <p className="section-label text-sage mb-6">{content.label}</p>
        <h2 className="font-display text-4xl md:text-5xl font-light mb-6 leading-tight">
          <StyledText text={content.title} italicClassName="italic" />
        </h2>
        <p className="text-linen/60 leading-relaxed mb-10 max-w-lg mx-auto">{content.body}</p>
        <Link
          href={content.button.href}
          className="inline-flex items-center gap-3 bg-linen text-wood-dark px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium hover:bg-linen-dark transition-colors duration-300"
        >
          {content.button.label}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
