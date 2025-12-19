'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * Bottom Navigation component
 * Matches the Eco-Luxury design from frontend-base/
 */

interface NavItem {
  href: string;
  icon: string;
  label: string;
  fillOnActive?: boolean;
}

const navItems: NavItem[] = [
  { href: '/', icon: 'home', label: 'Inicio' },
  { href: '/products', icon: 'eco', label: 'Apadrinar' },
  { href: '/favorites', icon: 'favorite', label: 'Favoritos', fillOnActive: true },
  { href: '/profile', icon: 'person', label: 'Perfil' },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    if (path === '/products') return pathname.startsWith('/products');
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[88px] bg-white/90 dark:bg-background-dark/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-50">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1',
                active ? 'text-primary' : 'text-slate-500 dark:text-slate-400'
              )}
            >
              <span
                className="material-symbols-outlined"
                style={
                  active && item.fillOnActive
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                {item.icon}
              </span>
              <p className={cn('text-xs', active ? 'font-bold' : 'font-medium')}>
                {item.label}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
