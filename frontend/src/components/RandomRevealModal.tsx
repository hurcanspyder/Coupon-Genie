'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Copy, Check, Calendar, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';
import { Coupon } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface RandomRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon | null;
  storeName: string;
}

export const RandomRevealModal: React.FC<RandomRevealModalProps> = ({ isOpen, onClose, coupon, storeName }) => {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && coupon) {
      // Fire confetti burst!
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // Fire confetti from two positions
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen, coupon]);

  if (!isOpen || !coupon) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.couponCode);
      setCopied(true);
      toast.success(`Coupon code ${coupon.couponCode} copied successfully!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const formatDiscount = () => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}% OFF`;
    }
    return `$${coupon.discountValue} OFF`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur overlay */}
      <div 
        className="absolute inset-0 bg-[#07070d]/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal card content */}
      <div className="relative w-full max-w-lg glass-panel bg-card-bg border border-primary/30 p-8 rounded-3xl shadow-2xl animate-modal overflow-hidden max-h-[90vh] flex flex-col justify-between">
        
        {/* Floating purple glow background decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 border border-white/5 hover:border-white/10 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal body */}
        <div className="text-center relative z-10">
          <div className="inline-flex p-3 bg-gradient-to-tr from-primary/20 to-indigo-500/20 border border-primary/30 rounded-2xl mb-4 text-primary animate-pulse">
            <Sparkles className="h-8 w-8" />
          </div>

          <h2 className="text-2xl font-black text-white leading-tight">
            Magical Reveal Successful! 🎉
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            The Genie has revealed a secret discount code for <strong className="text-white">{storeName}</strong>!
          </p>

          {/* Large revealed code container */}
          <div className="mt-8 p-6 rounded-2xl bg-black/50 border border-white/5 shadow-inner">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
              DISCOUNT DETAILS
            </span>
            <span className="text-4xl font-extrabold text-white block bg-gradient-to-r from-emerald-400 via-teal-200 to-indigo-300 bg-clip-text text-transparent">
              {formatDiscount()}
            </span>
            <span className="text-lg font-bold text-gray-200 block mt-2 line-clamp-1">
              {coupon.title}
            </span>

            {/* Revealed Code Display Box */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="flex-grow py-3 px-4 rounded-xl bg-background border border-white/10 text-xl font-mono font-black text-center text-primary tracking-widest shadow-lg flex items-center justify-center">
                {coupon.couponCode}
              </div>

              <button
                onClick={handleCopy}
                className={`py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all cursor-pointer ${
                  copied ? 'btn-success' : 'btn-primary'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Expiry and Metadata */}
          <div className="flex justify-center gap-6 mt-6 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-600" />
              Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              {coupon.revealCount + 1} total reveals
            </span>
          </div>

          {/* Terms & Conditions Collapse Section */}
          {coupon.terms && (
            <div className="mt-6 border-t border-white/5 pt-4 text-left">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold mb-1">
                <AlertCircle className="h-3.5 w-3.5 text-primary" />
                <span>Terms and Conditions</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                {coupon.terms}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
