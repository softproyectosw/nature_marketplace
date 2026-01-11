'use client';

import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background-dark font-display p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="flex items-center justify-center rounded-xl h-10 px-3 bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {t.common.back}
          </Link>
          <h1 className="text-white text-2xl font-bold">{t.profile.accountSettings}</h1>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
          <p>{t.profile.accountSettings}</p>
        </div>
      </div>
    </div>
  );
}
