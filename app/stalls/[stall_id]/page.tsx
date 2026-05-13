'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, MapPin, X, ShoppingBag, Navigation, Send } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

interface Stall {
  stall_id: string;
  name: string;
  description: string;
  picture_url: string;
  rating_avg: number;
  phone_number: string;
  block_id: number;
  is_open: boolean;
}

interface Item {
  item_id: string;
  name: string;
  price: number;
  picture_url: string;
  description: string;
}

interface Review {
  username: string;
  comment: string;
  rating: number;
  created_at: string;
}

function StallDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] animate-pulse">
      <div className="h-80 bg-gray-200 w-full" />
      <main className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-16">
          <div className="h-32 bg-white rounded-[2.5rem] border border-[#E2E8F0]" />
          <div className="space-y-8">
            <div className="h-8 w-48 bg-gray-200 rounded-lg" />
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-white border border-[#E2E8F0] rounded-[2rem]" />
              ))}
            </div>
          </div>
        </div>
        <div className="h-80 bg-white border border-[#E2E8F0] rounded-[2.5rem] sticky top-24" />
      </main>
    </div>
  );
}

export default function StallDetailPage() {
  const { stall_id } = useParams();
  const [stall, setStall] = useState<Stall | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [stallRes, itemsRes, reviewRes] = await Promise.all([
        fetch(`/api/stalls/${stall_id}`),
        fetch(`/api/items?stall_id=${stall_id}`),
        fetch(`/api/reviews?stall_id=${stall_id}`)
      ]);

      const stallJson = await stallRes.json();
      const itemsJson = await itemsRes.json();
      const reviewJson = await reviewRes.json();

      if (stallJson.success) setStall(stallJson.data);
      if (itemsJson.success) setItems(itemsJson.data);
      if (reviewJson.success) setReviews(reviewJson.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [stall_id]);

  const postReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stall_id, 
          item_id: null,
          comment: newComment, 
          rating: newRating 
        }),
      });
      if (res.ok) {
        setNewComment('');
        setIsReviewFormOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrder = (itemName: string) => {
    const message = `Halo ${stall?.name}, saya ingin memesan ${itemName} melalui KanteKuy.`;
    window.open(`https://wa.me/${stall?.phone_number}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) return <StallDetailSkeleton />;
  if (!stall) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="h-80 bg-gray-200 w-full relative">
        <img src={stall.picture_url} alt={stall.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto flex items-end justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-3xl border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
               <img src={stall.picture_url} className="w-full h-full object-cover" />
            </div>
            <div className="text-white space-y-2">
              <h1 className="text-4xl font-bold">{stall.name}</h1>
              <div className="flex items-center gap-4 text-sm font-semibold">
                 <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-400 fill-current" /> {stall.rating_avg} ({reviews.length} ulasan)</span>
                 <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#84A59D]" /> Blok {stall.block_id}</span>
                 <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${stall.is_open ? 'bg-[#22C55E]' : 'bg-rose-600'}`}>
                    {stall.is_open ? 'Open' : 'Closed'}
                 </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-16">
          <section className="space-y-4 bg-white p-8 rounded-[2.5rem] border border-[#E2E8F0] shadow-sm">
            <h2 className="text-2xl font-bold text-[#0F172A]">Tentang Stall</h2>
            <p className="text-gray-500 leading-relaxed italic">{stall.description}</p>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-bold text-[#0F172A]">Katalog Menu</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {items.map((item) => (
                <div 
                  key={item.item_id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white border border-[#E2E8F0] rounded-[2rem] p-4 flex gap-5 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                >
                  <div className="w-28 h-28 bg-gray-100 rounded-2xl flex-shrink-0 overflow-hidden">
                    <img src={item.picture_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-[#0F172A] group-hover:text-[#38BDF8] transition-colors">{item.name}</h3>
                        <span className="text-[#0F172A] font-bold text-sm shrink-0">Rp{item.price.toLocaleString('id-ID')}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#0F172A]">Ulasan Pengunjung</h2>
              <button 
                onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                className="text-[#0F172A] font-bold text-sm hover:underline cursor-pointer"
              >
                Tulis Ulasan
              </button>
            </div>

            {isReviewFormOpen && (
              <form onSubmit={postReview} className="bg-white p-6 rounded-3xl border border-[#E2E8F0] space-y-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-[#0F172A]">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${newRating >= star ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ceritakan pengalamanmu di stall ini..."
                  className="w-full p-4 rounded-2xl border border-gray-200 focus:border-[#0F172A] outline-none text-sm h-28 transition-all text-[#0F172A] placeholder:text-gray-400 bg-white"
                  required
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReviewFormOpen(false)}
                    className="px-6 py-2 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#0F172A] text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-6">
              {reviews.map((rev, i) => (
                <div key={i} className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#0F172A]/5 flex items-center justify-center text-[#0F172A] font-bold border border-[#0F172A]/10">
                        {rev.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#0F172A]">{rev.username}</p>
                        <p className="text-[10px] text-gray-400 font-semibold">{formatDate(rev.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className={`w-3.5 h-3.5 ${idx < rev.rating ? 'text-yellow-500 fill-current' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 italic leading-relaxed">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-white border border-[#E2E8F0] rounded-[2.5rem] p-8 shadow-xl shadow-gray-100 sticky top-24">
            <h3 className="text-xl font-bold text-[#0F172A] mb-6">Pesan Sekarang</h3>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed italic">Saat ini pemesanan hanya dapat dilakukan melalui WhatsApp untuk memastikan ketersediaan stok.</p>
            <button
              onClick={() => handleOrder("Menu")}
              className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-green-200 cursor-pointer"
            >
              <FontAwesomeIcon icon={faWhatsapp} size="xl" className="text-white" />
              Pesan via WhatsApp
            </button>

            <div className="mt-8 pt-8 border-t border-gray-50 space-y-8">
               <div className="space-y-4">
                 <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Navigasi Cepat</h4>
                 <button 
                  onClick={() => window.location.href = '/map'}
                  className="w-full bg-white border border-gray-200 text-[#0F172A] py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all cursor-pointer"
                 >
                    <Navigation className="w-4 h-4 fill-current rotate-0" />
                    Tampilkan di Denah
                 </button>
               </div>
            </div>
          </div>
        </div>
      </main>

      {selectedItem && (
        <div className="fixed inset-0 z-[100] bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-[#E2E8F0] rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button 
              onClick={() => setSelectedItem(null)} 
              className="absolute top-6 right-6 w-10 h-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"
            >
              <X className="w-5 h-5 text-[#0F172A]" />
            </button>
            <div className="h-72 bg-gray-100 w-full overflow-hidden">
               <img src={selectedItem.picture_url} className="w-full h-full object-cover" />
            </div>
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-[#0F172A]">{selectedItem.name}</h2>
                  <p className="text-[#38BDF8] font-bold text-xl mt-1">Rp{selectedItem.price.toLocaleString('id-ID')}</p>
                </div>
              </div>
              <p className="text-gray-500 leading-relaxed italic">{selectedItem.description}</p>
              <div className="pt-6 border-t border-gray-100">
                <button 
                  onClick={() => handleOrder(selectedItem.name)}
                  className="w-full bg-[#0F172A] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Pesan Item Ini Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}