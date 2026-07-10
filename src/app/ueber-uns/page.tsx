import Link from "next/link";
import { Mountain, Heart, Hammer, ArrowRight } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { AboutExtraBlocks, AboutGallery } from "@/components/content/AboutContentBlocks";
import { getSiteContentServer } from "@/lib/site-content-server";

const CARD_ICONS = [Mountain, Hammer, Heart];

export default async function AboutPage() {
  const { about } = await getSiteContentServer();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader
        label={about.header.label}
        title={about.header.title}
        description={about.header.description}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {about.cards.map(({ id, title, text }, index) => {
          const Icon = CARD_ICONS[index % CARD_ICONS.length];
          return (
            <div key={id} className="text-center p-6 bg-linen border border-wood/10">
              <div className="w-12 h-12 mx-auto mb-4 border border-forest/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-forest" strokeWidth={1.5} />
              </div>
              <h2 className="font-display text-xl font-light text-wood-dark mb-2">{title}</h2>
              <p className="text-sm text-stone leading-relaxed">{text}</p>
            </div>
          );
        })}
      </div>

      <AboutGallery images={about.galleryImages} />
      <AboutExtraBlocks blocks={about.extraBlocks} />

      <div className="bg-wood-dark text-linen p-10 text-center">
        <h2 className="font-display text-2xl font-light mb-4">{about.workshopCta.title}</h2>
        <p className="text-linen/60 max-w-lg mx-auto mb-6">{about.workshopCta.text}</p>
        <Link
          href={about.workshopCta.button.href}
          className="inline-flex items-center gap-2 text-sm tracking-wider uppercase text-wheat hover:text-linen transition-colors"
        >
          {about.workshopCta.button.label} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
