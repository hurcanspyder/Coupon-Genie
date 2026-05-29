'use client';

import React from 'react';
import Link from 'next/link';
import { Tag, ArrowRight } from 'lucide-react';
import { Store } from '../context/AuthContext';

interface StoreCardProps {
  store: Store;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  return (
    <Link 
      href={`/store/${store.slug}`}
      className="glass-card-interactive group block overflow-hidden p-6 w-full cursor-pointer bg-card-bg border border-border-color"
    >
      <div className="flex items-center gap-4">
        {/* Store Logo Placeholder / Actual Image */}
        <div className="relative h-16 w-16 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:border-primary/45 transition-colors overflow-hidden">
          {store.logo ? (
            <img 
              src={store.logo} 
              alt={`${store.name} Logo`}
              className="h-full w-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-xl font-bold text-gray-400 uppercase">{store.name[0]}</span>
          )}
        </div>

        {/* Store Name and Category */}
        <div className="flex-grow">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
            {store.category}
          </span>
          <h3 className="text-lg font-bold text-white mt-1 group-hover:text-primary transition-colors">
            {store.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
            <Tag className="h-3.5 w-3.5 text-primary" />
            <span>{store.couponCount} Active Coupons</span>
          </div>
        </div>

        {/* Arrow Button */}
        <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-primary group-hover:text-white transition-all text-gray-400">
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
