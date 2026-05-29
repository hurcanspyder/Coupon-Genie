'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sparkles, Calendar, Tag, ChevronLeft, Gift, AlertCircle, HelpCircle } from 'lucide-react';
import { api } from '../../../utils/api';
import { Coupon, Store, useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { CouponCard } from '../../../components/CouponCard';
import { RandomRevealModal } from '../../../components/RandomRevealModal';
import Link from 'next/link';

interface StoreDetailResponse {
  store: {
    id: string;
    name: string;
    slug: string;
    logo: string;
    description: string;
    category: string;
    couponCount: number;
    coupons: Coupon[];
  };
}

export default function StoreDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const toast = useToast();
  const { addToRecentlyViewed } = useAuth();

  const [store, setStore] = useState<StoreDetailResponse['store'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reveal Modal States
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [revealedCoupon, setRevealedCoupon] = useState<Coupon | null>(null);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const loadStoreDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get<StoreDetailResponse>(`/stores/${slug}`);
        setStore(res.store);

        // Add to recently viewed list
        if (res.store) {
          addToRecentlyViewed({
            id: res.store.id,
            name: res.store.name,
            slug: res.store.slug,
            logo: res.store.logo,
            category: res.store.category,
            couponCount: res.store.couponCount,
          });
        }
      } catch (err: any) {
        console.error('Error fetching store detail:', err);
        setError(err.message || 'Failed to load store information');
      } finally {
        setLoading(false);
      }
    };

    loadStoreDetails();
  }, [slug]);

  const handleRevealCoupon = async () => {
    if (!store) return;
    try {
      setRevealing(true);
      const res = await api.post<{ coupon: Coupon }>(`/stores/${store.slug}/reveal`, {});
      
      setRevealedCoupon(res.coupon);
      setRevealModalOpen(true);

      // Increment analytics count locally for the coupon if it exists in current coupon list
      setStore((prev) => {
        if (!prev) return null;
        const updatedCoupons = prev.coupons.map((c) => {
          if (c.id === res.coupon.id) {
            return { ...c, revealCount: c.revealCount + 1 };
          }
          return c;
        });
        return { ...prev, coupons: updatedCoupons };
      });
    } catch (err: any) {
      toast.error(err.message || 'Too many reveal requests. Slow down!');
    } finally {
      setRevealing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 w-full flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Summoning store coupons from the database...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 w-full flex-grow flex flex-col justify-center items-center text-center">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 mb-6">
          <HelpCircle className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-black text-white">Genie Spell Failed!</h2>
        <p className="text-gray-400 mt-2 text-sm max-w-md leading-relaxed">
          {error || 'The requested store details could not be retrieved. Ensure the slug is typed correctly.'}
        </p>
        <Link href="/" className="mt-8 btn-secondary py-2.5 px-6 rounded-xl text-sm font-semibold flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full relative py-12">
      {/* Dynamic Confetti Modal Popover */}
      <RandomRevealModal 
        isOpen={revealModalOpen} 
        onClose={() => setRevealModalOpen(false)} 
        coupon={revealedCoupon} 
        storeName={store.name} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        {/* Breadcrumb / Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> BACK TO HOME
        </Link>

        {/* --- STORE HEADER CARD --- */}
        <div className="glass-panel p-8 rounded-3xl bg-card-bg border border-border-color flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
          
          {/* Logo container */}
          <div className="h-24 w-24 sm:h-32 sm:w-32 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-3 overflow-hidden">
            {store.logo ? (
              <img src={store.logo} alt={`${store.name} Logo`} className="object-contain h-full w-full rounded-xl" />
            ) : (
              <span className="text-4xl font-extrabold uppercase text-gray-400">{store.name[0]}</span>
            )}
          </div>

          {/* Details */}
          <div className="flex-grow text-center md:text-left">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
              {store.category}
            </span>
            
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-2">
              {store.name} Promo Codes
            </h1>

            <p className="text-sm text-gray-400 mt-2 max-w-2xl leading-relaxed">
              {store.description}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-4 text-xs text-gray-500 font-semibold">
              <span className="flex items-center gap-1">
                <Tag className="h-4 w-4 text-primary" />
                {store.couponCount} Coupons Available
              </span>
            </div>
          </div>

          {/* --- REVEAL RANDOM ACTION CARD --- */}
          <div className="shrink-0 w-full md:w-auto p-6 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center text-center self-stretch md:self-auto min-w-[200px]">
            <div className="p-2 bg-primary/10 rounded-xl mb-3 text-primary animate-pulse">
              <Gift className="h-6 w-6" />
            </div>
            
            <h3 className="text-sm font-bold text-white leading-tight">Feeling Lucky?</h3>
            <p className="text-[10px] text-gray-500 mt-1 max-w-[150px] leading-relaxed">
              Let the Genie pick a verified random offer for you!
            </p>
            
            <button
              onClick={handleRevealCoupon}
              disabled={revealing || store.coupons.length === 0}
              className={`w-full mt-4 py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                store.coupons.length === 0
                  ? 'bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {revealing ? (
                <>
                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Revealing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  <span>Reveal Coupon</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* --- COUPONS LIST SECTION --- */}
        <div className="mt-12 sm:mt-16">
          <h2 className="text-xl sm:text-2xl font-black text-white mb-6">
            All Available Coupons ({store.coupons.length})
          </h2>

          {store.coupons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {store.coupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-12 text-center rounded-3xl border border-white/5 bg-card-bg max-w-xl mx-auto">
              <AlertCircle className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No active coupons available</h3>
              <p className="text-xs text-gray-500 mt-1">
                This store has no active coupon codes right now. Please check back later or check our other popular stores!
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
