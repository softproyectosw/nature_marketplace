import Link from 'next/link';
import type { Metadata } from 'next';

/**
 * Welcome Page - Entry point for new users
 * SSR for SEO optimization
 */

export const metadata: Metadata = {
  title: 'Welcome | Nature Marketplace',
  description:
    'Discover retreats, adopt a tree, and find natural remedies to bring nature closer to you.',
  openGraph: {
    title: 'Welcome to Nature Marketplace',
    description: 'Reconnect with Nature. Healing for you. Healing for the planet.',
  },
};

export default function WelcomePage() {
  return (
    <div className="relative flex h-screen w-full flex-col font-display overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-center bg-no-repeat bg-cover"
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDGJ2EHp_b9TsnrJTCV-qAj3gRsfWcFBcK2LhUvsPOEk6MDZ8r1e36sq06GCmQdVMYzctaJCAFd-v4bSuQsYsPmu_d6NytOSM7G9-3R7YPg5KAd6Wk17ZunBDPlY9bzK6aFMBvTP8-T_ERvhOhD1LzsrO5SPV9qKSvw048exJzTj1PLOv3kc6BYkrKHIunH1YIjYvn0AhgVOwdjovX19uOlJFX8OJ4WUg0xD-W4g0EhqKebAozk1VI2bELxwkgz1NuYULihB6jfr01w")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-grow justify-end px-6 pb-12">
        <div className="text-center">
          <h1 className="text-white tracking-tight text-4xl font-bold leading-tight">
            Reconnect with Nature
          </h1>
          <p className="text-white/80 text-base font-normal leading-normal pt-4">
            Discover retreats, adopt a tree, and find natural remedies to bring
            nature closer to you.
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-10 w-full max-w-md mx-auto">
          <Link
            href="/products"
            className="flex w-full cursor-pointer items-center justify-center rounded-full h-14 px-5 bg-primary text-background-dark text-base font-bold leading-normal tracking-wide hover:bg-primary/90 transition-colors"
          >
            Explore the Marketplace
          </Link>

          <Link
            href="/login"
            className="flex w-full cursor-pointer items-center justify-center rounded-full h-14 px-5 bg-white/10 backdrop-blur-md text-white border border-white/20 text-base font-bold leading-normal tracking-wide hover:bg-white/20 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
