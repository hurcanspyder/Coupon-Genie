import type { Metadata } from 'next';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Coupon Genie - Discover Verified Store Discount Coupons',
    template: '%s | Coupon Genie'
  },
  description: 'Instantly search, discover, and copy discount coupons for Amazon, Flipkart, Myntra, Swiggy, and Zomato. Reveal secret coupon offers with one click!',
  keywords: ['coupons', 'discount codes', 'promo codes', 'shopping deals', 'cashback offers', 'Coupon Genie'],
  authors: [{ name: 'Coupon Genie Team' }],
  openGraph: {
    title: 'Coupon Genie - Unlock Ultimate Discount Savings',
    description: 'Find verified discount codes for top stores instantly. Try our magic random coupon reveal system for maximum savings.',
    type: 'website',
    locale: 'en_US',
    url: 'https://coupongenie.dev',
    siteName: 'Coupon Genie',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coupon Genie - Unlock Ultimate Discount Savings',
    description: 'Find verified discount codes for top stores instantly. Try our magic random coupon reveal system for maximum savings.',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Load Inter font dynamically */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="flex flex-col min-h-screen select-none antialiased">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-grow flex flex-col relative z-10">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
