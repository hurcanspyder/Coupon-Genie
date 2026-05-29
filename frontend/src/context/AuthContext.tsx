'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  storeId: string;
  couponCode: string;
  title: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  expiryDate: string;
  active: boolean;
  terms?: string;
  revealCount: number;
  createdAt: string;
  store?: {
    id: string;
    name: string;
    slug: string;
    logo: string;
  };
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo: string;
  category: string;
  couponCount: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  savedCoupons: Coupon[];
  fetchSavedCoupons: () => Promise<void>;
  saveCoupon: (couponId: string) => Promise<void>;
  unsaveCoupon: (couponId: string) => Promise<void>;
  recentlyViewed: Store[];
  addToRecentlyViewed: (store: Store) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [savedCoupons, setSavedCoupons] = useState<Coupon[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Store[]>([]);

  useEffect(() => {
    // Initial load
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('coupon_genie_token');
        if (storedToken) {
          setToken(storedToken);
          // Get user profile
          const res = await api.get<{ user: User }>('/auth/profile');
          setUser(res.user);
          
          // Get saved coupons
          const savedRes = await api.get<{ coupons: Coupon[] }>('/auth/saved');
          setSavedCoupons(savedRes.coupons || []);
        }
      } catch (err) {
        console.error('Failed to load profile on mount:', err);
        // Clear corrupt token
        localStorage.removeItem('coupon_genie_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Load recently viewed stores from localStorage
    const storedHistory = localStorage.getItem('coupon_genie_history');
    if (storedHistory) {
      try {
        setRecentlyViewed(JSON.parse(storedHistory));
      } catch (e) {
        console.error(e);
      }
    }

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
      localStorage.setItem('coupon_genie_token', res.token);
      setToken(res.token);
      setUser(res.user);

      // Fetch saved coupons immediately on login
      const savedRes = await api.get<{ coupons: Coupon[] }>('/auth/saved');
      setSavedCoupons(savedRes.coupons || []);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: User }>('/auth/register', { name, email, password });
      localStorage.setItem('coupon_genie_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setSavedCoupons([]);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('coupon_genie_token');
    setToken(null);
    setUser(null);
    setSavedCoupons([]);
  };

  const fetchSavedCoupons = async () => {
    try {
      const res = await api.get<{ coupons: Coupon[] }>('/auth/saved');
      setSavedCoupons(res.coupons || []);
    } catch (err) {
      console.error('Failed to fetch saved coupons:', err);
    }
  };

  const saveCoupon = async (couponId: string) => {
    if (!user) throw new Error('You must be logged in to save coupons');
    try {
      await api.post('/auth/save', { couponId });
      await fetchSavedCoupons();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const unsaveCoupon = async (couponId: string) => {
    if (!user) return;
    try {
      await api.post('/auth/unsave', { couponId });
      await fetchSavedCoupons();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addToRecentlyViewed = (store: Store) => {
    setRecentlyViewed((prev) => {
      // Filter out existing occurrence
      const filtered = prev.filter((s) => s.id !== store.id);
      // Put new store at the front of the list, limit to 6 stores
      const updated = [store, ...filtered].slice(0, 6);
      localStorage.setItem('coupon_genie_history', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        savedCoupons,
        fetchSavedCoupons,
        saveCoupon,
        unsaveCoupon,
        recentlyViewed,
        addToRecentlyViewed,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
