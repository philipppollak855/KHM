import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/firestore";
import ProductDetailClient from "@/components/shop/ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.active) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
