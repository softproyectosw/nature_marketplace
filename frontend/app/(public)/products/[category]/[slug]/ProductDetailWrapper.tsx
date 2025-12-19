'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from './ProductDetailClient';
import { getProductBySlug, Product } from '@/lib/api/products';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductDetailWrapperProps {
  slug: string;
  category: string;
}

export function ProductDetailWrapper({ slug, category }: ProductDetailWrapperProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { locale } = useLanguage();

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      try {
        const data = await getProductBySlug(slug);
        setProduct(data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [slug, locale]); // Re-fetch when language changes

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/10" />
          <div className="h-4 w-32 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    notFound();
  }

  return <ProductDetailClient product={product} category={category} />;
}
