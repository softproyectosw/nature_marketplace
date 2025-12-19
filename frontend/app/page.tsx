'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FallingLeaves } from '@/components/effects/FallingLeaves';
import { CartButton } from '@/components/cart';
import { UserMenu } from '@/components/auth';

/**
 * Landing Page - Welcome to Nature Marketplace
 * 
 * Design based on the original Stitch mockups with:
 * - Full-screen hero with forest background image
 * - Falling leaves effect
 * - Clear CTAs (Explore + Sign In/Sign Up)
 * - Tree growing animation on scroll
 */
export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const treeRef = useRef<HTMLDivElement>(null);

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
        
        {/* Infinite Product Carousel */}
        <div className="w-full max-w-6xl mx-auto overflow-hidden mt-4">
          <p className="text-center text-white/50 text-sm mb-4">Explore our products</p>
          <div className="relative">
            <div className="flex animate-scroll gap-4">
              {/* First set of products */}
              {[
                { id: 1, title: 'Roble Andino', price: 49, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA57d8-crjcjBcF7YSMwpjlCwOgxjuIMr_-ft7LPHaYWNRZFBtgEyVb6ik914ymF0nlxS0sy3CpfzfuzEg6n1aIgHgZ73mAfGBEHFE5i6ILJCiFjSG582VjSgeNDxH2kRfEKNmuhxFJDH9pQ4jzrpUX3QdM6tdqCNMk-prHTFJ3M52-0YSf8X78H3lFF1fPMb2GeFHr-gQpLKK9qDfefwoYzzcKoXYY0qSipZsvnaY8HN_il1xJdV5q7wirCuBPxSOFwN0EIh4aPV4w', slug: 'trees/roble-andino' },
                { id: 2, title: 'Ceiba Sagrada', price: 79, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc1vS64gPJ7mXS0GZZ4J9GV3_vtbWnbqLpusdOe_mhtvKZl9800EWClKpEZdAlyu3an5ggEVNg7N47tWtonYYZ8DmGfRsPJxg0ciMgo7upHpfxUxlArq869hYXzEpwQLC8Uzu2y87lPyuSkSXOHREny1z0SNoRC7BiCi8FS6cOWljPP1Fz_GAVL2S0UTtXUxcLoAZ7YDvoBokf-hWw6QOmnSzCmTLX4xmCnwJ_sCpwPySc0wos40KisRYa9s7E7kq3z9ZHt-09Nghy', slug: 'trees/ceiba-sagrada' },
                { id: 3, title: 'Bosque Andino', price: 299, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX4GrNj0sPqAN5xJxaK64uqZpTTEKtSygiiYRmXrZxt4JO1G2-xrHV9g9UNTrwj6087J-dT1TcDXjVvl_uGkXDHj3PTVYgO3CY80SS3Y9jwNPu0bu9BrI3ouI1PJJKYWdOZ25Jbhwev1RIldC_gsZoj8zZEHYsrOLOpaqJBVxN_S_irVlY3NdiYbDtH9TwvmsrbnX9ZVCbvg7r8PJpb1Z8puza8b7nV2J5tQ4s-I_BcPTbVrDW10_XQ8aRtshGzZI-yYRXQhGqYfsy', slug: 'forests/hectarea-bosque-andino' },
                { id: 4, title: 'Laguna Guatavita', price: 149, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb7qaFmCmW_aGhTbq42JWuifGkh94nQpfJmiA9_F7aE8mZuTVw1S2ZtiDI9B-5jU0vLKt5IKaOtya60cBgZj2wKfJ3j4IsKyEeBlu1TPRyskyshIO7j0j_BxGAd7hYkVPPU7FTpDe-STzCv0orJsz-2tY9VRCRpR1lvmaocHMDNtF3VpyzQfbrLD7ATHv2_gmJKdZZR6lIv6ypEojiay4KM3doCIohLK-JXcU-pINVpOCYB--Fz29aHoLH9qeX1Teo5j7JmZcnb07j', slug: 'lagoons/laguna-guatavita' },
                { id: 5, title: 'Retiro Bienestar', price: 850, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-6GUNZKUR7_k_ZGZ0RbbevuXmvn9LOA0ukszskzKq8Qu9DAcS9RnbeRMCxxsDilRqpucyAIDDsCW0VhAIoXYPZY2imaFkgPFz2r5wammp0aiUc_pV6nBF4EpzpYMnoTR9par3UGszUC9mdx5Nfeee2UrRzkdNKqzzvz-N_HZNKBu2me2QX3-WBzBTL9irFLpr6fbBD8cPxjRc2mAWYdNquWY53gmbKoXckcMcyXc7M3OrNBHvmm5DBw_tAB74cN4BB1tFvBUSvJG3', slug: 'experiences/retiro-bienestar-3-dias' },
                { id: 6, title: 'Baño de Bosque', price: 120, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACuKLVH_fV5X9Ba3rRSCI596oYq9gIAJwfZwaCPJLLvQL38TK2lAk4eXqWihfG9oxG4RHjkiBsZkS8vPB0_DsMoBLSm1R75Z1z-jR1dOawiERZxvG33EqxE3JZpPxhZCoIwTirc1Y9f4xZjfrH8nEEYIOaszbaKxU8AOu-fD_qFXYquavFTeu6NBBQ7DPtJK92GpPJqW5Wqq16dSMhjUWGgcC5iIvA79Um_d-aBeiiih1ft8qT8Lvkf5I4nkzZT5espv4ybCSlTvRq', slug: 'experiences/bano-bosque-guiado' },
              ].map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="flex-shrink-0 w-40 group"
                >
                  <div 
                    className="w-40 h-40 rounded-xl bg-cover bg-center mb-2 group-hover:scale-105 transition-transform duration-300 ring-2 ring-transparent group-hover:ring-primary/50"
                    style={{ backgroundImage: `url("${product.image}")` }}
                  />
                  <p className="text-white text-sm font-medium truncate group-hover:text-primary transition-colors">{product.title}</p>
                  <p className="text-primary text-sm font-bold">${product.price}</p>
                </Link>
              ))}
              {/* Duplicate for infinite scroll effect */}
              {[
                { id: 7, title: 'Roble Andino', price: 49, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA57d8-crjcjBcF7YSMwpjlCwOgxjuIMr_-ft7LPHaYWNRZFBtgEyVb6ik914ymF0nlxS0sy3CpfzfuzEg6n1aIgHgZ73mAfGBEHFE5i6ILJCiFjSG582VjSgeNDxH2kRfEKNmuhxFJDH9pQ4jzrpUX3QdM6tdqCNMk-prHTFJ3M52-0YSf8X78H3lFF1fPMb2GeFHr-gQpLKK9qDfefwoYzzcKoXYY0qSipZsvnaY8HN_il1xJdV5q7wirCuBPxSOFwN0EIh4aPV4w', slug: 'trees/roble-andino' },
                { id: 8, title: 'Ceiba Sagrada', price: 79, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc1vS64gPJ7mXS0GZZ4J9GV3_vtbWnbqLpusdOe_mhtvKZl9800EWClKpEZdAlyu3an5ggEVNg7N47tWtonYYZ8DmGfRsPJxg0ciMgo7upHpfxUxlArq869hYXzEpwQLC8Uzu2y87lPyuSkSXOHREny1z0SNoRC7BiCi8FS6cOWljPP1Fz_GAVL2S0UTtXUxcLoAZ7YDvoBokf-hWw6QOmnSzCmTLX4xmCnwJ_sCpwPySc0wos40KisRYa9s7E7kq3z9ZHt-09Nghy', slug: 'trees/ceiba-sagrada' },
                { id: 9, title: 'Bosque Andino', price: 299, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX4GrNj0sPqAN5xJxaK64uqZpTTEKtSygiiYRmXrZxt4JO1G2-xrHV9g9UNTrwj6087J-dT1TcDXjVvl_uGkXDHj3PTVYgO3CY80SS3Y9jwNPu0bu9BrI3ouI1PJJKYWdOZ25Jbhwev1RIldC_gsZoj8zZEHYsrOLOpaqJBVxN_S_irVlY3NdiYbDtH9TwvmsrbnX9ZVCbvg7r8PJpb1Z8puza8b7nV2J5tQ4s-I_BcPTbVrDW10_XQ8aRtshGzZI-yYRXQhGqYfsy', slug: 'forests/hectarea-bosque-andino' },
                { id: 10, title: 'Laguna Guatavita', price: 149, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb7qaFmCmW_aGhTbq42JWuifGkh94nQpfJmiA9_F7aE8mZuTVw1S2ZtiDI9B-5jU0vLKt5IKaOtya60cBgZj2wKfJ3j4IsKyEeBlu1TPRyskyshIO7j0j_BxGAd7hYkVPPU7FTpDe-STzCv0orJsz-2tY9VRCRpR1lvmaocHMDNtF3VpyzQfbrLD7ATHv2_gmJKdZZR6lIv6ypEojiay4KM3doCIohLK-JXcU-pINVpOCYB--Fz29aHoLH9qeX1Teo5j7JmZcnb07j', slug: 'lagoons/laguna-guatavita' },
                { id: 11, title: 'Retiro Bienestar', price: 850, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-6GUNZKUR7_k_ZGZ0RbbevuXmvn9LOA0ukszskzKq8Qu9DAcS9RnbeRMCxxsDilRqpucyAIDDsCW0VhAIoXYPZY2imaFkgPFz2r5wammp0aiUc_pV6nBF4EpzpYMnoTR9par3UGszUC9mdx5Nfeee2UrRzkdNKqzzvz-N_HZNKBu2me2QX3-WBzBTL9irFLpr6fbBD8cPxjRc2mAWYdNquWY53gmbKoXckcMcyXc7M3OrNBHvmm5DBw_tAB74cN4BB1tFvBUSvJG3', slug: 'experiences/retiro-bienestar-3-dias' },
                { id: 12, title: 'Baño de Bosque', price: 120, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACuKLVH_fV5X9Ba3rRSCI596oYq9gIAJwfZwaCPJLLvQL38TK2lAk4eXqWihfG9oxG4RHjkiBsZkS8vPB0_DsMoBLSm1R75Z1z-jR1dOawiERZxvG33EqxE3JZpPxhZCoIwTirc1Y9f4xZjfrH8nEEYIOaszbaKxU8AOu-fD_qFXYquavFTeu6NBBQ7DPtJK92GpPJqW5Wqq16dSMhjUWGgcC5iIvA79Um_d-aBeiiih1ft8qT8Lvkf5I4nkzZT5espv4ybCSlTvRq', slug: 'experiences/bano-bosque-guiado' },
              ].map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="flex-shrink-0 w-40 group"
                >
                  <div 
                    className="w-40 h-40 rounded-xl bg-cover bg-center mb-2 group-hover:scale-105 transition-transform duration-300 ring-2 ring-transparent group-hover:ring-primary/50"
                    style={{ backgroundImage: `url("${product.image}")` }}
                  />
                  <p className="text-white text-sm font-medium truncate group-hover:text-primary transition-colors">{product.title}</p>
                  <p className="text-primary text-sm font-bold">${product.price}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <Link
          href="/register"
          className="mt-8 btn-primary text-lg px-8 py-4 inline-flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">park</span>
          Adopt Your First Tree
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
      <footer className="py-8 px-6 border-t border-white/10">
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
    </div>
  );
}
