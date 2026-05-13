'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, User } from 'lucide-react';

interface UserData {
  username: string;
  role: string;
}

export default function ClientNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const json = await res.json();
      
      if (json.success) {
        setCurrentUser({
          username: json.data.username,
          role: json.data.role
        });
        localStorage.setItem('kantekuy_user', json.data.username);
      } else {
        setCurrentUser(null);
        localStorage.removeItem('kantekuy_user');
      }
    } catch (err) {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    setMounted(true);
    checkAuth();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {}
    localStorage.removeItem('kantekuy_user');
    setCurrentUser(null);
    router.push('/');
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (!mounted) return null;

  return (
    <nav 
      className={`sticky top-0 z-50 px-6 py-3 flex items-center justify-between transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/70 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm' 
          : 'bg-white border-b border-transparent'
      }`}
    >
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img 
            src="/makara-ftui.png" 
            alt="Logo" 
            className="w-8 h-8 object-contain" 
          />
          <span className="text-xl font-bold tracking-tight text-[#0F172A]">KanteKuy</span>
        </Link>
        <form 
          onSubmit={handleSearch}
          className="hidden lg:flex items-center bg-[#F8FAFC] px-3 py-1.5 rounded-full border border-black w-80"
        >
          <Search className="text-gray-400 w-4 h-4 mr-2" />
          <input 
            type="text" 
            placeholder="Cari menu favoritmu..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none text-[#1E293B]"
          />
        </form>
      </div>
      
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link href="/stalls" className="text-[#1E293B] hover:text-[#84A59D] transition-colors hidden md:block">Stalls</Link>
        <Link href="/items" className="text-[#1E293B] hover:text-[#84A59D] transition-colors hidden md:block">Items</Link>
        <Link href="/map" className="text-[#1E293B] hover:text-[#84A59D] transition-colors hidden md:block">Map</Link>
        <div className="h-4 w-px bg-[#E2E8F0] mx-2 hidden md:block"></div>
        
        {currentUser ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[#0F172A]">
              <User className="w-4 h-4 fill-current" />
              <span className="font-bold">{currentUser.username}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-red-600 font-bold hover:text-red-700 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="text-[#1E293B] hover:text-[#84A59D] transition-colors font-bold">
            Login
          </Link>
        )}
        
        <Link 
          href={currentUser?.role === 'seller' ? '/dashboard' : '/stalls/register'}
          className="bg-[#0F172A] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-bold cursor-pointer shadow-sm"
        >
          {currentUser?.role === 'seller' ? 'Dashboard' : 'Buka Toko'}
        </Link>
      </div>
    </nav>
  );
}