'use client';

import { useTranslation } from '@/contexts/LanguageContext';

export function ProductsHero() {
  const { t } = useTranslation();

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t.products.title}
        </h1>
        <p className="text-white/60 max-w-2xl mx-auto">
          {t.products.subtitle}
        </p>
      </div>
    </section>
  );
}
