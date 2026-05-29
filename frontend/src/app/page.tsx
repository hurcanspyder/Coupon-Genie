'use client';

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Flame, HelpCircle, Gift } from 'lucide-react';
import { api } from '../utils/api';
import { Store, Coupon, useAuth } from '../context/AuthContext';
import { StoreCard } from '../components/StoreCard';
import { CouponCard } from '../components/CouponCard';
import Link from 'next/link';

export default function HomePage() {
  const { recentlyViewed } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [trendingCoupons, setTrendingCoupons] = useState<Coupon[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debouncing search
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const res = await api.get<{ stores: any[] }>(`/stores/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.stores || []);
      } catch (err) {
        console.error('Error searching stores:', err);
      }
    };

    const timer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load stores and trending coupons on mount
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        // Get stores
        const storesRes = await api.get<{ stores: Store[] }>('/stores');
        setStores(storesRes.stores || []);

        // Get trending coupons
        const couponsRes = await api.get<{ coupons: Coupon[] }>('/stores/trending');
        setTrendingCoupons(couponsRes.coupons || []);
      } catch (err: any) {
        console.error('Error loading home data:', err);
        setError('Failed to fetch store details. The backend server might be offline.');
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleExampleClick = (name: string) => {
    setSearchQuery(name);
    setShowSuggestions(true);
  };

  const popularExamples = ['Amazon', 'Flipkart', 'Myntra', 'Swiggy', 'Zomato'];

  return (
    <div className="w-full relative py-12 md:py-20 flex flex-col justify-start">
      
      {/* Decorative Floating Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        {/* --- HERO SECTION --- */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-bold mb-4 uppercase tracking-wider animate-pulse">
            <Sparkles className="h-4 w-4" />
            <span>Smart Shopping Companion</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
            Grant Your Savings <br />
            <span className="text-gradient">With Coupon Genie</span>
          </h1>
          <p className="text-gray-400 mt-4 text-base sm:text-lg max-w-xl leading-relaxed">
            Search for your favorite brands, reveal hidden discount codes instantly, and save on every order. Simple, fast, and 100% verified.
          </p>

          {/* Large Hero Search bar with Live Autocomplete Suggestions */}
          <div className="w-full max-w-2xl mt-8 relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-gray-500 h-5 w-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search for a store (e.g. Amazon, Zomato)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full py-4 pl-12 pr-4 text-sm sm:text-base text-white glass-panel bg-card-bg border border-border-color focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/15 rounded-2xl placeholder-gray-500 shadow-xl transition-all"
              />
            </div>

            {/* Live Search Suggestions Dropdown */}
            {showSuggestions && searchQuery.trim() && (
              <>
                {/* Overlay back to close suggestions */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowSuggestions(false)}
                />
                
                <div className="absolute top-full left-0 right-0 z-20 mt-2 p-2 rounded-2xl glass-panel bg-[#121222] border border-border-color shadow-2xl flex flex-col gap-1 max-h-[300px] overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((store) => (
                      <Link
                        key={store.id}
                        href={`/store/${store.slug}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center p-1.5 overflow-hidden">
                            {store.logo ? (
                              <img src={store.logo} alt="" className="object-contain h-full w-full rounded" />
                            ) : (
                              <span className="text-xs uppercase text-gray-400 font-bold">{store.name[0]}</span>
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-white">{store.name}</span>
                            <span className="text-[10px] text-gray-500 block">{store.category}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                          {store.couponCount} Active
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="py-8 px-4 text-center text-xs text-gray-500">
                      No stores found matching &ldquo;{searchQuery}&rdquo;.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Quick Example Tags */}
          <div className="flex flex-wrap justify-center items-center gap-2 mt-4 text-xs">
            <span className="text-gray-500 font-medium">Examples:</span>
            {popularExamples.map((ex) => (
              <button
                key={ex}
                onClick={() => handleExampleClick(ex)}
                className="py-1 px-3 rounded-lg bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/20 text-gray-400 hover:text-primary transition-all cursor-pointer font-medium"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* --- OFFLINE/ERROR NOTIFICATION STATE --- */}
        {error && (
          <div className="mt-12 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/25 max-w-3xl mx-auto flex items-center gap-4 text-rose-400">
            <HelpCircle className="h-6 w-6 shrink-0" />
            <div className="text-xs sm:text-sm font-medium">
              {error} <br />
              <span className="text-gray-500 font-normal">
                To try the app, start the Express Backend by running <code className="bg-black/30 px-1 py-0.5 rounded text-rose-300">npm run dev</code> inside the <code className="bg-black/30 px-1 py-0.5 rounded text-rose-300">/backend</code> folder and database connection.
              </span>
            </div>
          </div>
        )}

        {/* --- RECENTLY VIEWED STORES --- */}
        {recentlyViewed.length > 0 && (
          <div className="mt-16 sm:mt-24">
            <div className="flex items-center gap-2 mb-6">
              <Gift className="h-5 w-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-black text-white">Recently Viewed</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyViewed.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </div>
        )}

        {/* --- POPULAR STORES --- */}
        <div className="mt-16 sm:mt-24">
          <div className="flex justify-between items-end mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-black text-white">Popular Stores</h2>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="h-28 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : stores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/5 border border-white/5 rounded-2xl text-sm text-gray-500 font-medium">
              No stores loaded. Run backend database seeds to populate.
            </div>
          )}
        </div>

        {/* --- TRENDING COUPONS --- */}
        <div className="mt-16 sm:mt-24">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="h-5 w-5 text-orange-500 animate-bounce" />
            <h2 className="text-xl sm:text-2xl font-black text-white">Trending Coupons</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="h-48 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : trendingCoupons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingCoupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} showStore={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/5 border border-white/5 rounded-2xl text-sm text-gray-500 font-medium">
              No trending coupons found. Reveal coupons on store pages to trigger analytics rankings.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
