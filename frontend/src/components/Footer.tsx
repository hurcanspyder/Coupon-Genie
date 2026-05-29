import React from 'react';
import Link from 'next/link';
import { Gift, Mail, Heart, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto w-full border-t border-white/5 bg-[#08080f]/80 backdrop-blur-md relative z-10">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Logo & Slogan */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-tr from-primary to-indigo-500 rounded-lg">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 via-indigo-200 to-emerald-400 bg-clip-text text-transparent">
                Coupon Genie
              </span>
            </div>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
              Your instant companion for verified shopping discounts, massive food cashbacks, and lifestyle savings. Just click, reveal, and save!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Popular Store Categories</h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/" className="hover:text-primary transition-colors">E-Commerce Shopping</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Food Ordering & Delivery</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Fashion & Apparel</Link></li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-200">Connect with the Genie</h3>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-white/5 border border-white/5 hover:border-primary/30 rounded-xl text-gray-400 hover:text-white transition-all">
                <Mail className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-white/5 border border-white/5 hover:border-primary/30 rounded-xl text-gray-400 hover:text-white transition-all" aria-label="GitHub">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>
              <a href="#" className="p-2 bg-white/5 border border-white/5 hover:border-primary/30 rounded-xl text-gray-400 hover:text-white transition-all">
                <Globe className="h-4 w-4" />
              </a>
            </div>
            <p className="text-[10px] text-gray-600">
              © {new Date().getFullYear()} Coupon Genie. Built for maximum savings.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-500 flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> for smart savers worldwide.
          </p>
          <div className="flex gap-6 text-[10px] text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Robots Info</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
