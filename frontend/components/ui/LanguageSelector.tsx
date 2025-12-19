'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { Locale, localeNames, localeFlags } from '@/i18n';

export function LanguageSelector() {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-sm"
        aria-label="Select language"
      >
        <span>{localeFlags[locale]}</span>
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <span className="material-symbols-outlined text-sm">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-background-dark border border-white/20 rounded-lg shadow-xl z-50 overflow-hidden">
          {(Object.keys(localeNames) as Locale[]).map((loc) => (
            <button
              key={loc}
              onClick={() => handleSelect(loc)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                locale === loc ? 'bg-primary/20 text-primary' : 'text-white'
              }`}
            >
              <span>{localeFlags[loc]}</span>
              <span>{localeNames[loc]}</span>
              {locale === loc && (
                <span className="material-symbols-outlined text-sm ml-auto">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
