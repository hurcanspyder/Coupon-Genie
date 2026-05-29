'use client';

import React, { useState } from 'react';
import { Copy, Check, Bookmark, BookmarkCheck, Calendar, Sparkles } from 'lucide-react';
import { Coupon, useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface CouponCardProps {
  coupon: Coupon;
  showStore?: boolean;
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, showStore = false }) => {
  const { isAuthenticated, savedCoupons, saveCoupon, unsaveCoupon } = useAuth();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const isSaved = savedCoupons.some((c) => c.id === coupon.id);
  const isExpired = new Date(coupon.expiryDate) < new Date();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.couponCode);
      setCopied(true);
      toast.success(`Coupon code ${coupon.couponCode} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code to clipboard.');
    }
  };

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('You must log in to save coupons!');
      return;
    }

    try {
      if (isSaved) {
        await unsaveCoupon(coupon.id);
        toast.info('Coupon removed from bookmarks');
      } else {
        await saveCoupon(coupon.id);
        toast.success('Coupon bookmarked successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle coupon save state');
    }
  };

  // Format Discount String
  const formatDiscount = () => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}% OFF`;
    }
    return `$${coupon.discountValue} OFF`; // Or currency depending on context
  };

  return (
    <div className={`relative glass-card-interactive flex flex-col justify-between overflow-hidden p-6 bg-card-bg border border-border-color ${isExpired ? 'opacity-65' : ''}`}>
      {/* Decorative Shimmer for High Trending Reveals */}
      {coupon.revealCount > 200 && !isExpired && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500/10 to-transparent w-24 h-24 pointer-events-none transform rotate-45" />
      )}

      {/* Top Header Card: Title, Bookmark Icon */}
      <div>
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-1.5">
            {showStore && coupon.store && (
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 self-start">
                {coupon.store.name}
              </span>
            )}
            <span className="text-2xl font-black text-white bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              {formatDiscount()}
            </span>
          </div>

          <button
            onClick={handleSaveToggle}
            className={`p-2 rounded-xl transition-all border cursor-pointer ${
              isSaved
                ? 'bg-primary/20 text-primary border-primary/30'
                : 'bg-white/5 text-gray-400 border-white/5 hover:text-white hover:border-white/10'
            }`}
            title={isSaved ? 'Remove Bookmark' : 'Bookmark Coupon'}
          >
            {isSaved ? <BookmarkCheck className="h-4.5 w-4.5" /> : <Bookmark className="h-4.5 w-4.5" />}
          </button>
        </div>

        {/* Title and Description */}
        <h4 className="text-sm font-bold text-white mt-3 line-clamp-1 leading-snug">
          {coupon.title}
        </h4>
        <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
          {coupon.description || 'No description provided.'}
        </p>

        {/* Stats and Expiry Info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-[10px] text-gray-500 font-medium">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {isExpired ? 'Expired' : `Expires: ${new Date(coupon.expiryDate).toLocaleDateString()}`}
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            {coupon.revealCount} reveals
          </span>
        </div>
      </div>

      {/* Expiry / Copy Footer */}
      <div className="mt-5 pt-4 border-t border-white/5 flex gap-2">
        <div className="flex-grow py-2 px-3 rounded-xl bg-black/40 border border-white/5 text-center text-xs font-mono font-bold text-gray-300 tracking-wider flex items-center justify-center">
          {coupon.couponCode}
        </div>
        
        <button
          onClick={handleCopy}
          disabled={isExpired}
          className={`px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all cursor-pointer ${
            copied
              ? 'btn-success'
              : isExpired
              ? 'bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
