import { getActiveProducts } from "@/lib/firestore";
import { getSiteContentServer } from "@/lib/site-content-server";
import HeroSection from "@/components/landing/HeroSection";
import PhilosophySection from "@/components/landing/PhilosophySection";
import ValuesSection from "@/components/landing/ValuesSection";
import CraftSection from "@/components/landing/CraftSection";
import FeaturedSection from "@/components/landing/FeaturedSection";
import QuoteSection, { CtaSection } from "@/components/landing/QuoteSection";

export default async function HomePage() {
  const siteContent = await getSiteContentServer();
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

  const { home } = siteContent;

  return (
    <>
      <HeroSection content={home.hero} />
      <PhilosophySection content={home.philosophy} />
      <ValuesSection content={home.values} />
      <CraftSection content={home.craft} />
      <FeaturedSection products={featuredProducts} content={home.featured} />
      <QuoteSection content={home.quote} />
      <CtaSection content={home.cta} />
    </>
  );
}
