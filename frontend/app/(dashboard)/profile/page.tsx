'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/ui';
import { PhotoUpload } from '@/components/profile';

/**
 * Profile Page - Based on Stitch design
 */

interface UserProfile {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  level: string;
  current_points: number;
  total_points_earned: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ACCESS_TOKEN_KEY = 'nature_access_token';

// Mock data - will be fetched from API
const adoptedTrees = [
  {
    id: 1,
    name: 'Oakley',
    adoptedDate: 'Adopted June 25',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA57d8-crjcjBcF7YSMwpjlCwOgxjuIMr_-ft7LPHaYWNRZFBtgEyVb6ik914ymF0nlxS0sy3CpfzfuzEg6n1aIgHgZ73mAfGBEHFE5i6ILJCiFjSG582VjSgeNDxH2kRfEKNmuhxFJDH9pQ4jzrpUX3QdM6tdqCNMk-prHTFJ3M52-0YSf8X78H3lFF1fPMb2GeFHr-gQpLKK9qDfefwoYzzcKoXYY0qSipZsvnaY8HN_il1xJdV5q7wirCuBPxSOFwN0EIh4aPV4w',
  },
  {
    id: 2,
    name: 'Piney',
    adoptedDate: 'Adopted Jan 23',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX4GrNj0sPqAN5xJxaK64uqZpTTEKtSygiiYRmXrZxt4JO1G2-xrHV9g9UNTrwj6087J-dT1TcDXjVvl_uGkXDHj3PTVYgO3CY80SS3Y9jwNPu0bu9BrI3ouI1PJJKYWdOZ25Jbhwev1RIldC_gsZoj8zZEHYsrOLOpaqJBVxN_S_irVlY3NdiYbDtH9TwvmsrbnX9ZVCbvg7r8PJpb1Z8puza8b7nV2J5tQ4s-I_BcPTbVrDW10_XQ8aRtshGzZI-yYRXQhGqYfsy',
  },
];

const upcomingRetreats = [
  {
    id: 1,
    name: 'Mountain Mindfulness',
    date: 'Oct 15 - 18, 2024',
    location: 'Aspen, CO',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb7qaFmCmW_aGhTbq42JWuifGkh94nQpfJmiA9_F7aE8mZuTVw1S2ZtiDI9B-5jU0vLKt5IKaOtya60cBgZj2wKfJ3j4IsKyEeBlu1TPRyskyshIO7j0j_BxGAd7hYkVPPU7FTpDe-STzCv0orJsz-2tY9VRCRpR1lvmaocHMDNtF3VpyzQfbrLD7ATHv2_gmJKdZZR6lIv6ypEojiay4KM3doCIohLK-JXcU-pINVpOCYB--Fz29aHoLH9qeX1Teo5j7JmZcnb07j',
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats from profile
  const stats = {
    treesAdopted: 0, // TODO: fetch from API
    retreatsBooked: 0,
    totalOrders: 0,
    points: profile?.current_points || 0,
    level: profile?.level || 'Seed',
  };

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    
    if (token) {
      loadProfile();
    } else if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated]);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      console.log('[Profile] Loading profile with token:', token ? 'exists' : 'missing');
      if (!token) return;

      const res = await fetch(`${API_URL}/api/users/profile/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      console.log('[Profile] API Response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('[Profile] Profile data received:', data);
        console.log('[Profile] avatar_url:', data.avatar_url);
        console.log('[Profile] photo_url:', data.photo_url);
        setProfile(data);
      } else {
        const errorData = await res.text();
        console.error('[Profile] API Error:', errorData);
      }
    } catch (err) {
      console.error('[Profile] Error loading profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (newUrl: string) => {
    console.log('[Profile] Photo uploaded, new URL:', newUrl);
    if (profile) {
      setProfile({ ...profile, avatar_url: newUrl });
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Show loading while checking auth or loading profile
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <div className="animate-pulse text-white/60">Cargando perfil...</div>
      </div>
    );
  }

  // If no user and no profile, show nothing (redirect will happen in useEffect)
  if (!user && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <div className="animate-pulse text-white/60">Cargando...</div>
      </div>
    );
  }

  const displayName = profile?.display_name 
    || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '')
    || user?.email?.split('@')[0]
    || profile?.email?.split('@')[0]
    || 'Usuario';

  return (
    <div className="flex flex-col min-h-screen w-full bg-background-dark font-display text-white pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/" className="p-2">
          <span className="material-symbols-outlined text-white text-xl">chevron_left</span>
        </Link>
        <h1 className="text-lg font-bold">My Profile</h1>
        <Link href="/profile/edit" className="text-primary text-sm font-medium">
          Edit
        </Link>
      </div>

      {/* User Avatar & Name */}
      <div className="flex flex-col items-center px-6 mb-6">
        <PhotoUpload
          currentPhotoUrl={profile?.avatar_url}
          onUploadSuccess={handlePhotoUpload}
          onUploadError={(err) => setError(err)}
        />
        <h2 className="text-xl font-bold mb-1 mt-4">{displayName}</h2>
        <p className="text-primary text-sm">Nivel: {stats.level}</p>
        <p className="text-white/50 text-xs">{stats.points} puntos verdes</p>
        {error && (
          <p className="text-red-400 text-xs mt-2">{error}</p>
        )}
      </div>

      {/* Stats Grid - 2 columns + 1 full width */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-[#1a3a2a] rounded-xl p-4 text-center border border-primary/20">
            <span className="text-2xl font-bold text-primary block">{stats.treesAdopted}</span>
            <span className="text-xs text-white/60">Trees Adopted</span>
          </div>
          <div className="bg-[#1a3a2a] rounded-xl p-4 text-center border border-primary/20">
            <span className="text-2xl font-bold text-primary block">{stats.retreatsBooked}</span>
            <span className="text-xs text-white/60">Retreats Booked</span>
          </div>
        </div>
        <div className="bg-[#1a3a2a] rounded-xl p-4 text-center border border-primary/20">
          <span className="text-2xl font-bold text-primary block">{stats.totalOrders}</span>
          <span className="text-xs text-white/60">Total Orders</span>
        </div>
      </div>

      {/* My Adopted Trees */}
      <div className="px-4 mb-6">
        <h3 className="text-base font-bold mb-3">My Adopted Trees</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {adoptedTrees.map((tree) => (
            <div key={tree.id} className="flex-shrink-0 w-40">
              <div
                className="w-40 h-32 rounded-xl bg-cover bg-center mb-2"
                style={{ backgroundImage: `url("${tree.image}")` }}
              />
              <p className="text-white font-medium text-sm">{tree.name}</p>
              <p className="text-white/50 text-xs mb-2">{tree.adoptedDate}</p>
              <button className="w-full bg-primary text-background-dark text-xs font-bold py-2 rounded-lg hover:bg-primary/90 transition-all">
                Track Progress
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Retreats */}
      <div className="px-4 mb-6">
        <h3 className="text-base font-bold mb-3">Upcoming Retreats</h3>
        {upcomingRetreats.map((retreat) => (
          <div key={retreat.id} className="bg-[#1a3a2a] rounded-xl overflow-hidden border border-primary/20">
            <div
              className="w-full h-32 bg-cover bg-center"
              style={{ backgroundImage: `url("${retreat.image}")` }}
            />
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{retreat.name}</p>
                <p className="text-white/50 text-xs">{retreat.date} • {retreat.location}</p>
              </div>
              <button className="bg-primary text-background-dark text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-all">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Menu Options */}
      <div className="px-4 space-y-1">
        <Link href="/orders" className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined text-white/60">receipt_long</span>
          <span className="font-medium text-white/80 flex-1">Order History</span>
          <span className="material-symbols-outlined text-white/40 text-sm">chevron_right</span>
        </Link>
        <Link href="/settings" className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined text-white/60">settings</span>
          <span className="font-medium text-white/80 flex-1">Account Settings</span>
          <span className="material-symbols-outlined text-white/40 text-sm">chevron_right</span>
        </Link>
        <Link href="/payment-methods" className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined text-white/60">credit_card</span>
          <span className="font-medium text-white/80 flex-1">Payment Methods</span>
          <span className="material-symbols-outlined text-white/40 text-sm">chevron_right</span>
        </Link>
        <Link href="/help" className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined text-white/60">help</span>
          <span className="font-medium text-white/80 flex-1">Help & Support</span>
          <span className="material-symbols-outlined text-white/40 text-sm">chevron_right</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors text-left"
        >
          <span className="material-symbols-outlined text-red-400">logout</span>
          <span className="font-medium text-red-400 flex-1">Logout</span>
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
