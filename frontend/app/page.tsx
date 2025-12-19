'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FallingLeaves } from '@/components/effects/FallingLeaves';
import { CartButton } from '@/components/cart';
import { UserMenu } from '@/components/auth';
import { getProducts, Product } from '@/lib/api/products';
import { BottomNav } from '@/components/ui';

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
              <CartButton />
              <UserMenu />
            </div>
          </div>
        </div>
        
        {/* Content at bottom */}
        <div className="relative z-10 flex flex-col flex-grow justify-end px-4 pb-8 pt-[50vh]">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-white tracking-tight text-4xl md:text-5xl font-bold leading-tight mb-3">
              Reconnect with Nature
            </h1>
            <p className="text-white/80 text-base md:text-lg font-normal leading-normal">
              Discover retreats, adopt a tree, and find natural remedies to bring nature closer to you.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 pt-10 max-w-md mx-auto w-full">
            <Link
              href="/products"
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 w-full bg-primary text-background-dark text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-all active:scale-95"
            >
              <span className="truncate">Explore the Marketplace</span>
            </Link>
            
            <div className="flex gap-3">
              <Link
                href="/login"
                className="flex-1 flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-transparent text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-white/10 transition-all"
              >
                <span className="truncate">Sign In</span>
              </Link>
              
              <Link
                href="/register"
                className="flex-1 flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-white/10 border border-white/20 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-white/20 transition-all"
              >
                <span className="truncate">Sign Up</span>
              </Link>
            </div>
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
          className="relative transition-all duration-150 ease-out"
          style={{
            transform: `scale(${0.2 + scrollProgress * 1.2})`,
            opacity: 0.3 + scrollProgress * 0.7,
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
            Watch Your Impact Grow
          </h2>
          <p className="text-white/70 text-lg mb-6">
            Every tree you adopt absorbs CO₂ and helps restore ecosystems. 
            Track your tree&apos;s growth in real-time.
          </p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-6 text-white/60 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {Math.round(scrollProgress * 45)}kg
              </div>
              <div className="text-sm">CO₂ Absorbed</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {(scrollProgress * 4.5).toFixed(1)}m
              </div>
              <div className="text-sm">Height</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {Math.round(scrollProgress * 24)}
              </div>
              <div className="text-sm">Months</div>
            </div>
          </div>
        </div>
        
        {/* Product Carousel */}
        {products.length > 0 && (
          <div className="w-full max-w-4xl mx-auto mt-8 px-4">
            <p className="text-center text-white/50 text-sm mb-6">Productos destacados</p>
            <div className="relative">
              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={nextSlide}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
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
                        ${product.price}{product.pricing_type === 'annual' ? '/año' : ''}
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
          Explorar Todos los Productos
        </Link>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-6 bg-[#1A3123]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            What You Can Do
          </h2>
          <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
            From adopting trees to booking wellness retreats, make a positive impact on the planet.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-background-dark/50 rounded-2xl p-6 text-center border border-white/10 hover:border-primary/30 transition-all">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">park</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Tree Adoptions</h3>
              <p className="text-white/60">
                Adopt a tree and receive updates as it grows. Visit it anytime.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-background-dark/50 rounded-2xl p-6 text-center border border-white/10 hover:border-primary/30 transition-all">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">spa</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Wellness Retreats</h3>
              <p className="text-white/60">
                Book immersive experiences in nature. Forest bathing, yoga, and more.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-background-dark/50 rounded-2xl p-6 text-center border border-white/10 hover:border-primary/30 transition-all">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">eco</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Natural Products</h3>
              <p className="text-white/60">
                Discover sustainable, eco-friendly products that make a difference.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Impact Stats */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">
            Our Collective Impact
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-white/60">Trees Adopted</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-white/60">Tons CO₂ Offset</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">2K+</div>
              <div className="text-white/60">Active Sponsors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-white/60">Retreat Locations</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-t from-[#1A3123] to-background-dark">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start?
          </h2>
          <p className="text-white/60 mb-8">
            Join thousands making a positive impact on the planet.
          </p>
          
          <div className="flex flex-col gap-3">
            <Link
              href="/register"
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 w-full bg-primary text-background-dark text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-all active:scale-95"
            >
              Create Free Account
            </Link>
            <Link
              href="/products"
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 w-full bg-transparent border border-white/20 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-white/10 transition-all"
            >
              Browse Products
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
            © 2024 Nature Marketplace. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
