import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from './ProductDetailClient';

// Use internal Docker network URL for server-side fetches
const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';

interface ProductPageProps {
  params: {
    category: string;
    slug: string;
  };
}

// Fetch product from API
async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/products/${slug}/`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);
  
  if (!product) {
    return {
      title: 'Producto no encontrado | Nature Marketplace',
    };
  }

  return {
    title: `${product.title} | Nature Marketplace`,
    description: product.short_description || product.description?.slice(0, 160),
    openGraph: {
      title: `${product.title} | Nature Marketplace`,
      description: product.short_description,
      images: product.gallery?.[0]?.url ? [product.gallery[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} category={params.category} />;
}
