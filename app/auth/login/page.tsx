'use strict';
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-5 right-5 z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-3 rounded-xl shadow-lg font-bold text-xs md:text-sm flex items-center gap-2 transition-all`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.message || 'Login gagal. Periksa kembali kredensial Anda.', 'error');
        setLoading(false);
        return;
      }

      localStorage.setItem('kantekuy_user', username);
      window.dispatchEvent(new Event('auth-change'));
      showToast('Login berhasil!', 'success');
      router.push('/');
    } catch (err) {
      showToast('Terjadi kesalahan pada server.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col justify-between font-sans text-[#1E293B]">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src="/background.png" 
          alt="Background" 
          className="w-full h-full object-cover filter blur-md scale-105 brightness-50"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <main className="relative z-10 flex-grow flex items-center justify-center p-4 md:p-6">
        <div className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-[2rem] p-6 md:p-8 shadow-2xl flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="text-center space-y-1 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A]">Selamat Datang</h1>
              <p className="text-xs md:text-sm text-gray-500">Silakan masuk untuk mengeksplorasi Kantin Teknik!</p>
            </div>

            <div className="flex border-b border-gray-200 mb-6">
              <div className="flex-1 pb-3 text-center text-xs md:text-sm font-bold border-b-2 border-[#0F172A] text-[#0F172A]">
                Login
              </div>
              <Link href="/auth/register" className="flex-1 pb-3 text-center text-xs md:text-sm font-medium text-gray-400 hover:text-[#0F172A] transition-colors">
                Register
              </Link>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] md:text-xs font-bold text-gray-700">
                  Username
                </label>
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username" 
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:ring-2 focus:ring-[#0F172A] focus:border-[#0F172A] outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] md:text-xs font-bold text-gray-700">
                  Password
                </label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:ring-2 focus:ring-[#0F172A] focus:border-[#0F172A] outline-none transition-all"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#0F172A] text-white py-3 rounded-xl font-bold text-xs md:text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Masuk ke KanteKuy'}
                </button>
              </div>
            </form>
          </div>

          <div className="pt-6 border-t border-gray-100 mt-6 space-y-3">
            <p className="text-center text-[11px] md:text-xs text-gray-500">
              Belum punya akun? <br />
              <Link href="/auth/register" className="text-[#0F172A] font-bold hover:underline">
                Daftar sekarang gratis pada tombol Register!
              </Link>
            </p>

            <div className="text-center">
              <Link href="/" className="text-[11px] md:text-xs font-bold text-[#0F172A] hover:underline">
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-4 text-center text-[10px] md:text-xs text-white/80 bg-black/20 backdrop-blur-sm">
        &copy; 2026 KanteKuy Auth System. Secure & Fast.
      </footer>
    </div>
  );
}