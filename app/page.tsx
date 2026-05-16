'use strict';

import Link from 'next/link';
import { ArrowDown, MapPin, Star } from 'lucide-react';

interface Stall {
  stall_id: string;
  name: string;
  description: string;
  picture_url: string;
  rating_avg: number;
  min_price: number;
  is_open: boolean;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Stall[];
}

async function getTopStalls(): Promise<Stall[]> {
  try {
    const res = await fetch('http://localhost:3000/api/stalls?by_rating=true', {
      cache: 'no-store',
    });
    
    if (!res.ok) return [];

    const json: ApiResponse = await res.json();
    return json.data.slice(0, 5);
  } catch (error) {
    return [];
  }
}

export default async function LandingPage() {
  const topStalls = await getTopStalls();

  const formatRp = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col relative font-sans text-[#1E293B]">
      <section className="relative w-full h-[calc(100vh-65px)] flex flex-col justify-between overflow-hidden pt-12 md:pt-20 pb-6">
        <div className="absolute inset-0 z-0">
          <img 
            src="/background.png" 
            alt="Background Kantin" 
            className="w-full h-full object-cover filter blur-md scale-105 brightness-90"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto space-y-6 text-white my-auto w-full">
          <p className="text-xs md:text-sm font-medium tracking-widest text-[#84A59D] uppercase drop-shadow-md">
            Kantin Fakultas Teknik
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight drop-shadow-lg max-w-4xl mx-auto">
            Eksplorasi Rasa di <br />
            <span className="text-[#38BDF8]">Kantin Teknik</span>
          </h1>
          <p className="text-sm md:text-lg text-gray-100 max-w-xl mx-auto drop-shadow font-medium italic">
            Temukan booth favoritmu, cek menu terbaru, dan pesan tanpa antre. Solusi cerdas untuk perut mahasiswa yang sibuk.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/map" 
              className="w-full sm:w-auto bg-[#0F172A] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-slate-800 transition-all text-center border border-slate-700"
            >
              Lihat Denah
            </Link>
            <Link 
              href="/stalls" 
              className="w-full sm:w-auto bg-white text-[#0F172A] px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-center"
            >
              Cari Makan
            </Link>
          </div>
        </div>

        <div className="relative z-10 text-center text-gray-200 mt-auto flex flex-col items-center gap-1">
          <span className="text-sm md:text-base font-medium tracking-wide drop-shadow">
            Lebih Banyak Pilihan Di Bawah Ini!
          </span>
          <ArrowDown className="w-5 h-5 animate-bounce drop-shadow" />
        </div>
      </section>

      <section className="bg-white border-y border-[#E2E8F0] py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">Ingin Melihat Stall yang Tersedia?</h2>
            <p className="text-xs md:text-sm text-gray-500">Klik pada area denah untuk melihat profil booth!</p>
          </div>
          
          <Link href="/map" className="block">
            <div className="relative bg-[#F8FAFC] rounded-2xl md:rounded-3xl p-4 md:p-8 border border-dashed border-[#E2E8F0] min-h-[250px] md:h-[400px] flex items-center justify-center overflow-hidden group cursor-pointer hover:border-slate-400 transition-all">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-6 w-full h-full opacity-60">
                <div className="bg-[#E2E8F0] rounded-xl h-40 sm:h-auto"></div>
                <div className="bg-[#E2E8F0] rounded-xl h-40 sm:h-auto"></div>
                <div className="bg-[#E2E8F0] rounded-xl h-40 sm:h-auto"></div>
                <div className="bg-[#84A59D]/40 rounded-xl h-40 sm:h-auto"></div>
                <div className="bg-[#E2E8F0] rounded-xl h-40 sm:h-auto hidden sm:block"></div>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[1px]">
                <span className="text-sm md:text-lg font-bold text-[#0F172A] group-hover:scale-105 transition-transform flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#0F172A] inline-block shrink-0" /> Buka Peta Interaktif
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 md:px-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold">Cobalah Stall-Stall Populer Ini!</h2>
            <p className="text-xs md:text-sm text-gray-500">Ikuti pilihan pertama para mahasiswa pada minggu ini.</p>
          </div>
          <Link 
            href="/stalls" 
            className="inline-block bg-white border border-[#E2E8F0] text-[#0F172A] text-xs md:text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-50 transition-colors text-center self-start sm:self-auto shadow-sm"
          >
            Lihat Semua Stall
          </Link>
        </div>

        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topStalls.slice(0, 3).map((stall) => (
              <div key={stall.stall_id} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="h-48 bg-[#F1F5F9] relative overflow-hidden">
                  <img 
                    src={stall.picture_url || "/placeholder-stall.jpg"} 
                    alt={stall.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-yellow-600 flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-current text-yellow-500 shrink-0" /> {stall.rating_avg}
                  </div>
                  <div className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${stall.is_open ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                    {stall.is_open ? 'Open' : 'Closed'}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#84A59D] mb-1">
                      <span className={`w-2 h-2 rounded-full ${stall.is_open ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      {stall.name}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{stall.description}</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex justify-end">
                    <span className="text-xs font-bold text-[#0F172A]">{formatRp(stall.min_price)}+</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {topStalls.length > 3 && (
            <>
              <div className="w-full border-b-2 border-dashed border-gray-200 my-2 hidden lg:block"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
                {topStalls.slice(3, 5).map((stall) => (
                  <div key={stall.stall_id} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <div className="h-48 bg-[#F1F5F9] relative overflow-hidden">
                      <img 
                        src={stall.picture_url || "/placeholder-stall.jpg"} 
                        alt={stall.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-yellow-600 flex items-center gap-1 shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-current text-yellow-500 shrink-0" /> {stall.rating_avg}
                      </div>
                      <div className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${stall.is_open ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                        {stall.is_open ? 'Open' : 'Closed'}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#84A59D] mb-1">
                          <span className={`w-2 h-2 rounded-full ${stall.is_open ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {stall.name}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">{stall.description}</p>
                      </div>
                      <div className="pt-2 border-t border-gray-100 flex justify-end">
                        <span className="text-xs font-bold text-[#0F172A]">{formatRp(stall.min_price)}+</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <footer className="mt-auto bg-[#0F172A] text-white py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/10 pb-10 mb-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-xl font-bold tracking-tight">KanteKuy</span>
            </div>
            <p className="text-white/60 text-xs max-w-xs">
              The Guide for your Hungry Self. Sistem Informasi Kantin Teknik Universitas.
            </p>
          </div>
          <div className="flex gap-12 text-xs">
            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-white/40">Layanan</p>
              <ul className="space-y-2 text-white/80">
                <li><Link href="/stalls" className="hover:text-white transition-colors">Cari Stall</Link></li>
                <li><Link href="/map" className="hover:text-white transition-colors">Peta Kantin</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-white/40">Author</p>
              <ul className="space-y-2 text-white/80">
                <li><Link href="https://www.instagram.com/dimar_tamara?igsh=dDN5aTZ3NmdlYTk4&utm_source=qr" className="hover:text-white transition-colors">Dimar</Link></li>
                <li><Link href="https://www.instagram.com/nopalowcortisol?igsh=MTRtNW56ampmYTdscA==" className="hover:text-white transition-colors">Naufal</Link></li>
                <li><Link href="https://instagram.com/malikprasetyo_" className="hover:text-white transition-colors">Malik</Link></li>
                <li><Link href="https://www.instagram.com/raihanmunaf?igsh=MXRseTg5ZmYyeHc4bg==" className="hover:text-white transition-colors">Raihan</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center text-white/40 text-xs">
          &copy; 2026 KanteKuy Team. All rights reserved.
        </div>
      </footer>
    </div>
  );
}