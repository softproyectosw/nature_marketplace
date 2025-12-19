'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locales, Locale, defaultLocale, TranslationKeys } from '@/i18n';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCALE_KEY = 'nature_locale';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem(LOCALE_KEY) as Locale | null;
    
    if (savedLocale && locales[savedLocale]) {
      setLocaleState(savedLocale);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0] as Locale;
      if (locales[browserLang]) {
        setLocaleState(browserLang);
        localStorage.setItem(LOCALE_KEY, browserLang);
      }
    }
    setIsHydrated(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_KEY, newLocale);
  };

  const t = locales[locale];

  // Prevent hydration mismatch by using default locale on server
  if (!isHydrated) {
    return (
      <LanguageContext.Provider value={{ locale: defaultLocale, setLocale, t: locales[defaultLocale] }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Helper hook for translations
export function useTranslation() {
  const { t, locale, setLocale } = useLanguage();
  return { t, locale, setLocale };
}
