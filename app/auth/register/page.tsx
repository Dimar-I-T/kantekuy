'use strict';
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-5 right-5 z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-3 rounded-xl shadow-lg font-bold text-xs md:text-sm flex items-center gap-2 transition-all`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1500);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('Password dan Konfirmasi Password tidak cocok.', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.message || 'Registrasi gagal dilakukan.', 'error');
        setLoading(false);
        return;
      }

      showToast('Registrasi berhasil! Silakan login.', 'success');
      router.push('/auth/login');
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
        <div className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-[2rem] p-6 md:p-8 shadow-2xl flex flex-col justify-between min-h-[550px]">
          <div>
            <div className="text-center space-y-1 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A]">Selamat Datang</h1>
              <p className="text-xs md:text-sm text-gray-500">Buatlah akun untuk mulai mengeksplorasi Kantin Teknik!</p>
            </div>

            <div className="flex border-b border-gray-200 mb-6">
              <Link href="/auth/login" className="flex-1 pb-3 text-center text-xs md:text-sm font-medium text-gray-400 hover:text-[#0F172A] transition-colors">
                Login
              </Link>
              <div className="flex-1 pb-3 text-center text-xs md:text-sm font-bold border-b-2 border-[#0F172A] text-[#0F172A]">
                Register
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] md:text-xs font-bold text-gray-700">
                  Username
                </label>
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username" 
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-xs md:text-sm focus:ring-2 focus:ring-[#0F172A] focus:border-[#0F172A] outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] md:text-xs font-bold text-gray-700">
                  E-Mail
                </label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan e-mail" 
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-xs md:text-sm focus:ring-2 focus:ring-[#0F172A] focus:border-[#0F172A] outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] md:text-xs font-bold text-gray-700">
                  Password
                </label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-xs md:text-sm focus:ring-2 focus:ring-[#0F172A] focus:border-[#0F172A] outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] md:text-xs font-bold text-gray-700">
                  Confirm Password
                </label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-xs md:text-sm focus:ring-2 focus:ring-[#0F172A] focus:border-[#0F172A] outline-none transition-all"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#0F172A] text-white py-3 rounded-xl font-bold text-xs md:text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Daftarkan ke KanteKuy'}
                </button>
              </div>
            </form>
          </div>

          <div className="pt-4 border-t border-gray-100 mt-4 text-center">
            <Link href="/" className="text-[11px] md:text-xs font-bold text-[#0F172A] hover:underline">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-4 text-center text-[10px] md:text-xs text-white/80 bg-black/20 backdrop-blur-sm">
        &copy; 2026 KanteKuy Auth System. Secure & Fast.
      </footer>
    </div>
  );
}