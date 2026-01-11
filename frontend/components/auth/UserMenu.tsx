'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';

export function UserMenu() {
  const { user, isLoading, logout, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
    );
  }

  // Not logged in - show auth buttons
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="text-white/70 hover:text-white text-sm font-medium px-3 py-2"
        >
          {t.userMenu.signIn}
        </Link>
        <Link
          href="/register"
          className="bg-primary text-background-dark text-sm font-bold px-4 py-2 rounded-xl hover:bg-primary/90 transition-all"
        >
          {t.userMenu.signUp}
        </Link>
      </div>
    );
  }

  // Logged in - show user menu
  const initials = user.first_name && user.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : user.email[0].toUpperCase();

  const displayName = user.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user.email.split('@')[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/10 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-background-dark font-bold text-sm">
          {initials}
        </div>
        <span className="text-white text-sm font-medium hidden sm:block max-w-[120px] truncate">
          {displayName}
        </span>
        <span className="material-symbols-outlined text-white/60 text-sm">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-background-dark border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white font-medium truncate">{displayName}</p>
            <p className="text-white/50 text-sm truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">person</span>
              <span>{t.userMenu.myProfile}</span>
            </Link>
            <Link
              href="/favorites"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">favorite</span>
              <span>{t.userMenu.favorites}</span>
            </Link>
            <Link
              href="/my-trees"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">park</span>
              <span>{t.userMenu.myTrees}</span>
            </Link>
            <Link
              href="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">receipt_long</span>
              <span>{t.userMenu.orders}</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-white/10 py-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 w-full text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span>{t.userMenu.signOut}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
