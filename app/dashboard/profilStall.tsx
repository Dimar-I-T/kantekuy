"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { Star, MapPin, Tag, Pen } from "lucide-react";
import Link from "next/link";

type Stall = {
    stall_id: string;
    block_id: number;
    name: string;
    phone_number: string;
    description: string;
    picture_url: string;
    is_open: boolean;
    rating_avg: number;
    min_price: number;
    max_price: number;
    created_at: string;
}

type ProfileProps = {
    stall_id: string;
}

export default function ProfileStall({ stall_id }: ProfileProps) {
    const [stall, setStall] = useState<Stall | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!stall_id) return;
        
        async function loadStall() {
            setLoading(true);
            try {
                const response = await axios.get(`/api/stalls/${stall_id}`);
                const data = response.data;
                if (data.success) {
                    setStall(data.data);
                }
            } catch (error) {
                console.error("Error fetching stall data:", error);
            } finally {
                setLoading(false);
            }
        }
        loadStall();
    }, [stall_id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Memuat profil stall...
            </div>
        );
    }

    if (!stall) {
        return (
            <div className="flex w-full h-64 justify-center items-center text-slate-500 text-sm font-medium">
                Stall tidak ditemukan.
            </div>
        );
    }

    return (
        <main className="flex flex-col gap-6 w-full max-w-4xl mx-auto py-8 px-4 md:px-0">
            
            <div className="w-full h-64 md:h-80 relative rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-100">
                {stall.picture_url ? (
                    <img
                        src={stall.picture_url}
                        alt={`Foto dari ${stall.name}`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        Belum ada foto stall
                    </div>
                )}
                
                <div className="absolute top-4 right-4">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-2 ${stall.is_open ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        <span className="w-2 h-2 rounded-full bg-white shadow-sm"></span>
                        {stall.is_open ? 'Buka' : 'Tutup'}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-5 px-2">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-6">
                    
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">{stall.name}</h1>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm font-medium text-slate-600">
                            <span className="flex items-center gap-1.5 text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-lg">
                                <Star size={16} className="fill-yellow-500 text-yellow-500" />
                                {stall.rating_avg > 0 ? stall.rating_avg.toFixed(1) : "Belum ada rating"}
                            </span>
                            
                            <span className="flex items-center gap-1.5">
                                <MapPin size={16} className="text-slate-400" />
                                Blok {stall.block_id}
                            </span>
                            
                            <span className="flex items-center gap-1.5 text-green-600">
                                <Tag size={16} />
                                {stall.max_price > stall.min_price ? `Rp ${stall.min_price?.toLocaleString("id-ID") || 0} - Rp ${stall.max_price?.toLocaleString("id-ID") || 0}` : `Rp ${stall.min_price?.toLocaleString("id-ID") || 0}+`}
                            </span>
                        </div>
                    </div>
                    
                    <Link 
                        href="/dashboard/edit-stall"
                        className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-colors whitespace-nowrap"
                    >
                        <Pen size={18} fill="currentColor" />
                        Edit
                    </Link>
                </div>

                <div className="mt-2">
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Tentang Stall</h2>
                    <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                        {stall.description || "Stall ini belum menambahkan deskripsi."}
                    </p>
                </div>
            </div>
        </main>
    );
}