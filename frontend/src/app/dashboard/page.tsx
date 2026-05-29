'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { StoreCard } from '../../components/StoreCard';
import { CouponCard } from '../../components/CouponCard';
import { Bookmark, User, Clock, AlertCircle, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { isAuthenticated, loading, user, savedCoupons, recentlyViewed } = useAuth();
  const router = useRouter();

  // Route guard
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 w-full flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Entering your secure dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="w-full relative py-12 md:py-16">
      
      {/* Ambient gradient */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        {/* --- DASHBOARD HEADER --- */}
        <div className="glass-panel p-8 rounded-3xl bg-card-bg border border-border-color flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center p-3 text-white">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Savers Control Room
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                Greetings, <strong className="text-white">{user?.name}</strong>! Email: {user?.email}
              </p>
            </div>
          </div>

          <div className="shrink-0 py-2 px-4 rounded-xl bg-white/5 border border-white/5 text-center text-xs font-semibold text-gray-300">
            Savers Joined: {new Date(user?.createdAt || '').toLocaleDateString()}
          </div>
        </div>

        {/* --- BOOKMARKED SAVED COUPONS --- */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Bookmark className="h-5 w-5 text-emerald-400 fill-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white">Your Bookmarked Coupons ({savedCoupons.length})</h2>
          </div>

          {savedCoupons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCoupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} showStore={true} />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-12 text-center rounded-3xl border border-white/5 bg-card-bg max-w-xl mx-auto">
              <AlertCircle className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No bookmarked coupons yet</h3>
              <p className="text-xs text-gray-500 mt-1">
                Bookmarks help you store the best flat-off codes for future orders. Try browsing stores and click the bookmark icon on any card!
              </p>
              <Link href="/" className="mt-6 inline-flex btn-primary py-2 px-4 rounded-xl text-xs font-bold">
                Browse Stores
              </Link>
            </div>
          )}
        </div>

        {/* --- RECENTLY VIEWED STORES --- */}
        <div className="mt-16">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-black text-white">Recently Viewed Stores ({recentlyViewed.length})</h2>
          </div>

          {recentlyViewed.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyViewed.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-12 text-center rounded-3xl border border-white/5 bg-card-bg max-w-xl mx-auto">
              <ShoppingBag className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No viewed stores history</h3>
              <p className="text-xs text-gray-500 mt-1">
                Your recently viewed stores are compiled here for quick access. Go explore some store lists!
              </p>
              <Link href="/" className="mt-6 inline-flex btn-primary py-2 px-4 rounded-xl text-xs font-bold">
                Explore Stores
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
