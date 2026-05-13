'use strict';
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight, Search, CheckSquare, Square } from 'lucide-react';

interface Stall {
  stall_id: string;
  name: string;
  description: string;
  picture_url: string;
  rating_avg: number;
  min_price: number;
  is_open: boolean;
}

export default function StallsPage() {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [sortByRating, setSortByRating] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchStalls = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('semua', showAll ? 'true' : 'false');
      if (sortByRating) params.append('by_rating', 'true');
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/stalls?${params.toString()}`);
      const json = await res.json();
      if (json.success) setStalls(json.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStalls();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, showAll, sortByRating]);

  const formatRp = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-[#1E293B]">
      <header className="px-6 py-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-black">Eksplorasi Stall</h1>
            <p className="text-gray-500 max-w-xl text-sm md:text-base">
              Temukan berbagai pilihan kuliner terbaik di Kantin Teknik. Urutkan berdasarkan rating untuk menemukan pilihan rasa terbaik.
            </p>
          </div>
          
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Cari stall yang diinginkan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-full border border-black focus:outline-none focus:ring-1 focus:ring-black text-sm placeholder:text-gray-400"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-gray-100 pt-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 group cursor-pointer"
            >
              {showAll ? (
                <CheckSquare className="w-5 h-5 text-black" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
              <span className={`text-sm font-bold ${showAll ? 'text-black' : 'text-gray-400'}`}>Semua</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00FFAB]"></div>
              <span className="text-sm font-bold text-black">Buka</span>
            </div>

            {showAll && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="w-3 h-3 rounded-full bg-[#FF0000]"></div>
                <span className="text-sm font-bold text-black">Tutup</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-500">Urutkan:</span>
            <div className="relative">
              <select
                value={sortByRating ? 'rating' : 'default'}
                onChange={(e) => setSortByRating(e.target.value === 'rating')}
                className="appearance-none bg-white border border-black rounded-lg px-4 py-2 pr-10 text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="rating">Rating Tertinggi</option>
                <option value="default">Terbaru</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight className="w-4 h-4 rotate-90 text-black" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-20 w-full">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-gray-50 animate-pulse rounded-[2rem] border border-gray-200"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stalls.length > 0 ? stalls.map((stall) => (
              <Link
                href={`/stalls/${stall.stall_id}`}
                key={stall.stall_id}
                className={`group bg-white border border-gray-400 rounded-[2rem] overflow-hidden transition-all hover:shadow-lg ${!stall.is_open ? 'opacity-70 bg-gray-50' : ''}`}
              >
                <div className="h-52 bg-gray-100 relative overflow-hidden">
                  <img
                    src={stall.picture_url || "/placeholder-stall.jpg"}
                    alt={stall.name}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!stall.is_open ? 'grayscale brightness-50' : ''}`}
                  />
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-yellow-600 flex items-center gap-1 shadow-sm border border-yellow-100">
                    <Star className="w-3 h-3 fill-current" /> {stall.rating_avg || 0}
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${stall.is_open ? 'bg-[#00FFAB]' : 'bg-[#FF0000]'}`}></div>
                      <h3 className="text-lg font-bold text-black truncate">{stall.name}</h3>
                    </div>
                    <span className="text-xs font-bold text-black shrink-0">
                      {stall.min_price ? formatRp(stall.min_price) + '+' : 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 italic line-clamp-1">
                    {stall.description}
                  </p>
                </div>
              </Link>
            )) : (
              <div className="col-span-full text-center py-20 text-gray-400 font-medium">
                Tidak ada stall yang ditemukan...
              </div>
            )}
          </div>
        )}

        <div className="mt-16 flex justify-center items-center gap-3">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5 text-black" />
          </button>
          
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl border text-sm font-bold transition-all ${
                  currentPage === page 
                    ? 'border-2 border-black text-black bg-white' 
                    : 'border-gray-300 text-gray-400 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-300 bg-black hover:opacity-90 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </main>
    </div>
  );
}