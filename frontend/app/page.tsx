'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FallingLeaves } from '@/components/effects/FallingLeaves';
import { CartButton } from '@/components/cart';
import { UserMenu } from '@/components/auth';
import { getProducts, Product } from '@/lib/api/products';
import { BottomNav, LanguageSelector } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';

// Helper to get product image
function getProductImage(product: Product): string {
  if (product.primary_image) return product.primary_image;
  const primaryImage = product.gallery?.find(img => img.is_primary);
  if (primaryImage?.url) return primaryImage.url;
  if (product.gallery?.[0]?.url) return product.gallery[0].url;
  return '/images/placeholder-product.jpg';
}

// Helper to get category slug
function getCategorySlug(product: Product): string {
  return product.category?.slug || product.category_slug || 'products';
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const treeRef = useRef<HTMLDivElement>(null);

  // Load featured products
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts({ is_featured: true });
        setProducts(data.results?.slice(0, 8) || []);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / (docHeight * 0.5), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Carousel navigation
  const itemsPerView = 4;
  const maxIndex = Math.max(0, products.length - itemsPerView);
  const nextSlide = () => setCarouselIndex(prev => prev >= maxIndex ? 0 : prev + 1);
  const prevSlide = () => setCarouselIndex(prev => prev <= 0 ? maxIndex : prev - 1);

  // Auto-play carousel
  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setCarouselIndex(prev => prev >= maxIndex ? 0 : prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [products.length, maxIndex]);

  return (
    <div className="min-h-[200vh] bg-background-dark font-display">
      {/* Hero Section - Full Screen with Forest Image */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDGJ2EHp_b9TsnrJTCV-qAj3gRsfWcFBcK2LhUvsPOEk6MDZ8r1e36sq06GCmQdVMYzctaJCAFd-v4bSuQsYsPmu_d6NytOSM7G9-3R7YPg5KAd6Wk17ZunBDPlY9bzK6aFMBvTP8-T_ERvhOhD1LzsrO5SPV9qKSvw048exJzTj1PLOv3kc6BYkrKHIunH1YIjYvn0AhgVOwdjovX19uOlJFX8OJ4WUg0xD-W4g0EhqKebAozk1VI2bELxwkgz1NuYULihB6jfr01w')`,
          }}
        />
        
        {/* Falling Leaves Effect */}
        <FallingLeaves count={20} />
        
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/30 to-transparent pointer-events-none" />
        
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">eco</span>
              <span className="font-bold text-white">Nature</span>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <CartButton />
              <UserMenu />
            </div>
          </div>
        </div>
        
        {/* Content at bottom */}
        <div className="relative z-10 flex flex-col flex-grow justify-end px-4 pb-8 pt-[50vh]">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-white tracking-tight text-4xl md:text-5xl font-bold leading-tight mb-3">
              {t.landing.hero.title}
            </h1>
            <p className="text-white/80 text-base md:text-lg font-normal leading-normal">
              {t.landing.hero.subtitle}
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 pt-10 max-w-md mx-auto w-full">
            <Link
              href="/products"
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 w-full bg-primary text-background-dark text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-all active:scale-95"
            >
              <span className="truncate">{t.landing.cta.exploreMarketplace}</span>
            </Link>
            
            {!isAuthenticated && (
              <div className="flex gap-3">
                <Link
                  href="/login"
                  className="flex-1 flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-transparent text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-white/10 transition-all"
                >
                  <span className="truncate">{t.common.login}</span>
                </Link>
                
                <Link
                  href="/register"
                  className="flex-1 flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-white/10 border border-white/20 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-white/20 transition-all"
                >
                  <span className="truncate">{t.common.register}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <span className="material-symbols-outlined text-white/60 text-2xl">
            keyboard_arrow_down
          </span>
        </div>
      </section>
      
      {/* Tree Growing Section with Product Carousel */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
        {/* Growing Lush Tree SVG */}
        <div 
          ref={treeRef}
          className="relative transition-all duration-100 ease-out"
          style={{
            transform: `scale(${0.3 + Math.min(scrollProgress * 2.5, 1) * 0.9})`,
            opacity: 0.4 + Math.min(scrollProgress * 2.5, 1) * 0.6,
          }}
        >
          <svg 
            width="280" 
            height="350" 
            viewBox="0 0 280 350" 
            className="drop-shadow-2xl"
          >
            {/* Tree trunk with branches */}
            <path 
              d="M130 350 L130 200 Q120 180 100 170 M130 200 L130 180 Q140 160 160 150 M130 220 Q115 200 95 195 M130 240 Q145 220 165 215"
              stroke="#6B4423"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
            />
            <rect x="118" y="200" width="24" height="150" fill="#8B5A2B" rx="4" />
            
            {/* Lush foliage - multiple overlapping circles for fullness */}
            <circle cx="140" cy="120" r="65" fill="#1B5E20" />
            <circle cx="90" cy="140" r="50" fill="#2E7D32" />
            <circle cx="190" cy="140" r="50" fill="#2E7D32" />
            <circle cx="140" cy="80" r="55" fill="#388E3C" />
            <circle cx="100" cy="100" r="45" fill="#43A047" />
            <circle cx="180" cy="100" r="45" fill="#43A047" />
            <circle cx="140" cy="50" r="40" fill="#4CAF50" />
            <circle cx="110" cy="70" r="35" fill="#66BB6A" />
            <circle cx="170" cy="70" r="35" fill="#66BB6A" />
            <circle cx="140" cy="30" r="30" fill="#81C784" />
            
            {/* Highlight spots */}
            <circle cx="120" cy="60" r="12" fill="#A5D6A7" opacity="0.7" />
            <circle cx="160" cy="90" r="10" fill="#A5D6A7" opacity="0.6" />
            <circle cx="100" cy="120" r="8" fill="#C8E6C9" opacity="0.5" />
          </svg>
        </div>
        
        {/* Text content */}
        <div className="text-center mt-8 max-w-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t.landing.tree.title}
          </h2>
          <p className="text-white/70 text-lg mb-6">
            {t.landing.tree.subtitle}
          </p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-6 text-white/60 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {Math.round(Math.min(scrollProgress * 2.5, 1) * 45)}kg
              </div>
              <div className="text-sm">{t.landing.tree.co2Absorbed}</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {(Math.min(scrollProgress * 2.5, 1) * 4.5).toFixed(1)}m
              </div>
              <div className="text-sm">{t.landing.tree.height}</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {Math.round(Math.min(scrollProgress * 2.5, 1) * 24)}
              </div>
              <div className="text-sm">{t.landing.tree.months}</div>
            </div>
          </div>
          
          {/* Adopt Me Button - appears when tree is fully grown */}
          <div 
            className={`transition-all duration-500 ${
              scrollProgress >= 0.4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Link
              href="/products?category=bosque-vivo"
              className="inline-flex items-center gap-2 bg-primary text-background-dark font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/30 text-lg"
            >
              <span className="material-symbols-outlined">park</span>
              {t.landing.tree.adoptMe}
            </Link>
          </div>
        </div>
        
        {/* Product Carousel */}
        {products.length > 0 && (
          <div className="w-full max-w-4xl mx-auto mt-8 px-4">
            <p className="text-center text-white/50 text-sm mb-6">{t.landing.featuredProducts}</p>
            <div className="relative">
              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={nextSlide}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>

              {/* Carousel Container */}
              <div className="overflow-hidden">
                <div 
                  className="flex gap-4 transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${carouselIndex * 200}px)` }}
                >
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${getCategorySlug(product)}/${product.slug}`}
                      className="flex-shrink-0 w-44 group"
                    >
                      <div 
                        className="w-44 h-44 rounded-xl bg-cover bg-center mb-3 group-hover:scale-105 transition-transform duration-300 ring-2 ring-white/10 group-hover:ring-primary/50"
                        style={{ backgroundImage: `url("${getProductImage(product)}")` }}
                      />
                      <p className="text-white text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {product.title}
                      </p>
                      <p className="text-primary text-sm font-bold">
                        ${product.price}{product.pricing_type === 'annual' ? t.products.perYear : ''}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Dots indicator */}
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === carouselIndex ? 'bg-primary' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* CTA - Explorar Productos */}
        <Link
          href="/products"
          className="mt-8 btn-primary text-lg px-8 py-4 inline-flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">eco</span>
          {t.landing.cta.exploreAllProducts}
        </Link>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-6 bg-[#1A3123]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            {t.landing.features.title}
          </h2>
          <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
            {t.landing.features.subtitle}
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Link
              href="/products?category=bosque-vivo"
              className="bg-background-dark/50 rounded-2xl p-6 text-center border border-white/10 hover:border-primary/30 transition-all"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">forest</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t.products.bosqueVivo}</h3>
              <p className="text-white/60">({t.landing.features.bosqueVivoDescription})</p>
            </Link>

            <Link
              href="/products?category=guardianes-del-agua"
              className="bg-background-dark/50 rounded-2xl p-6 text-center border border-white/10 hover:border-primary/30 transition-all"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">water</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t.products.guardianesDelAgua}</h3>
              <p className="text-white/60">({t.landing.features.guardianesDelAguaDescription})</p>
            </Link>

            <Link
              href="/products?category=economia-del-corazon"
              className="bg-background-dark/50 rounded-2xl p-6 text-center border border-white/10 hover:border-primary/30 transition-all"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">volunteer_activism</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t.products.economiaDelCorazon}</h3>
              <p className="text-white/60">({t.landing.features.economiaDelCorazonDescription})</p>
            </Link>

            <Link
              href="/products?category=micro-retreats"
              className="bg-background-dark/50 rounded-2xl p-6 text-center border border-white/10 hover:border-primary/30 transition-all"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">hiking</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t.products.microRetreats}</h3>
              <p className="text-white/60">({t.landing.features.microRetreatsDescription})</p>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Impact Stats */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">
            {t.landing.impact.title}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-white/60">{t.landing.impact.treesAdopted}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-white/60">{t.landing.impact.co2Offset}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">2K+</div>
              <div className="text-white/60">{t.landing.impact.activeSponsors}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-white/60">{t.landing.impact.retreatLocations}</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-t from-[#1A3123] to-background-dark">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t.landing.finalCta.title}
          </h2>
          <p className="text-white/60 mb-8">
            {t.landing.finalCta.subtitle}
          </p>
          
          <div className="flex flex-col gap-3">
            <Link
              href="/register"
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 w-full bg-primary text-background-dark text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-all active:scale-95"
            >
              {t.landing.cta.createAccount}
            </Link>
            <Link
              href="/products"
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 w-full bg-transparent border border-white/20 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-white/10 transition-all"
            >
              {t.landing.cta.viewProducts}
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 pb-28">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">eco</span>
            <span className="font-semibold text-white">Nature Marketplace</span>
          </div>
          <p className="text-white/40 text-sm">
            © 2024 Nature Marketplace. {t.footer.rights}.
          </p>
        </div>
      </footer>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
