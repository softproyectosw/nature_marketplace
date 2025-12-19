import type { Metadata } from 'next';
import { BottomNav } from '@/components/ui';
import { ProductsGrid } from '@/components/products';
import { Header } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Apadrinar | Nature Marketplace',
  description:
    'Explora nuestra colección de retiros de bienestar y árboles para apadrinar.',
  openGraph: {
    title: 'Apadrinar | Nature Marketplace',
    description: 'Descubre árboles y experiencias que te conectan con la naturaleza.',
  },
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background-dark pb-[100px]">
      {/* Header with Cart */}
      <Header />

      {/* Hero */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Apadrina y Genera Impacto
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto">
            Descubre retiros de bienestar y apadrina árboles que crecen contigo.
            Cada apadrinamiento crea un vínculo real con la naturaleza.
          </p>
        </div>
      </section>

      {/* Products Grid with Filters */}
      <ProductsGrid />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
