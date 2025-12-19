import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/contexts/CartContext';
import { CartDrawer } from '@/components/cart';

/**
 * Root Layout for Nature Marketplace
 * 
 * This is the top-level layout that wraps all pages.
 * It includes global fonts, metadata, and providers.
 */

// Configure Plus Jakarta Sans font
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

// Global metadata for SEO
export const metadata: Metadata = {
  title: {
    default: 'Nature Marketplace | Eco-Luxury Wellness & Sustainability',
    template: '%s | Nature Marketplace',
  },
  description:
    'Book immersive wellness retreats, adopt trees, and shop sustainable products. Healing for you. Healing for the planet.',
  keywords: [
    'wellness',
    'retreats',
    'organic',
    'reforestation',
    'tree adoption',
    'sustainable',
    'eco-friendly',
    'yoga',
    'mindfulness',
  ],
  authors: [{ name: 'Nature Marketplace' }],
  creator: 'Nature Marketplace',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'es_ES',
    siteName: 'Nature Marketplace',
    title: 'Nature Marketplace | Eco-Luxury Wellness & Sustainability',
    description:
      'Book immersive wellness retreats, adopt trees, and shop sustainable products.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nature Marketplace',
    description: 'Healing for you. Healing for the planet.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Material Symbols for icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${plusJakartaSans.variable} font-display`}>
        <CartProvider>
          {/* Main content */}
          <main className="min-h-screen">{children}</main>
          {/* Cart Drawer */}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
