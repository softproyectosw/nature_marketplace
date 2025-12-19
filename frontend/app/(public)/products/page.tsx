import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BottomNav } from '@/components/ui';
import { ProductsGrid } from '@/components/products';
import { Header } from '@/components/layout';
import { ProductsHero } from './ProductsHero';

export const metadata: Metadata = {
  title: 'Apadrinar | Nature Marketplace',
  description:
    'Explora nuestra colección de retiros de bienestar y árboles para apadrinar.',
  openGraph: {
    title: 'Apadrinar | Nature Marketplace',
    description: 'Descubre árboles y experiencias que te conectan con la naturaleza.',
  },
};

function ProductsGridFallback() {
  return (
    <div className="px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="glass-card p-4 animate-pulse">
            <div className="aspect-square rounded-xl bg-white/10 mb-4" />
            <div className="h-4 bg-white/10 rounded mb-2 w-1/3" />
            <div className="h-5 bg-white/10 rounded mb-2" />
            <div className="h-4 bg-white/10 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background-dark pb-[100px]">
      {/* Header with Cart */}
      <Header />

      {/* Hero */}
      <ProductsHero />

      {/* Products Grid with Filters */}
      <Suspense fallback={<ProductsGridFallback />}>
        <ProductsGrid />
      </Suspense>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
