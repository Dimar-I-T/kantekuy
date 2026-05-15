"use client";

import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

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

export default function EditStall() {
    const router = useRouter();

    const [stall, setStall] = useState<Stall | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        block_id: "1",
        phone_number: "",
    });
    
    const [picture, setPicture] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function loadStall() {
            setLoading(true);
            try {
                const authRes = await axios.get(`/api/auth/me`);
                const authData = authRes.data;

                if (authData.success && authData.data.stall_id) {
                    const stallRes = await axios.get(`/api/stalls/${authData.data.stall_id}`);
                    const stallData = stallRes.data;
                    
                    if (stallData.success) {
                        const fetchedStall: Stall = stallData.data;
                        setStall(fetchedStall);
                        
                        setFormData({
                            name: fetchedStall.name || "",
                            description: fetchedStall.description || "",
                            block_id: fetchedStall.block_id ? fetchedStall.block_id.toString() : "1",
                            phone_number: fetchedStall.phone_number || "",
                        });
                        setPreview(fetchedStall.picture_url || null);
                    }
                }
            } catch (err: any) {
                console.warn(err);
                setErrorMsg("Gagal memuat data profil stall.");
            } finally {
                setLoading(false);
            }
        }

        loadStall();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPicture(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleDelete = async () => {
        if(!stall) return;

        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            const response = await axios.delete(`/api/stalls/${stall.stall_id}`);
            if (response.data.success) {
                setSuccessMsg(response.data.message);
                setStall(response.data.data);
            }
        } catch (err:any) {
            console.error("Error update stall:", err);
            setErrorMsg(err.response?.data?.message || "Gagal menghapus profil stall.");
        } finally {
            setLoading(false);
            router.push("/");
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stall) return;

        setIsSubmitting(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('description', formData.description);
            payload.append('block_id', formData.block_id);
            payload.append('phone_number', formData.phone_number);
            
            if (picture) {
                payload.append('file', picture);
            } else if (stall.picture_url) {
                payload.append('picture_url', stall.picture_url);
            }

            const response = await axios.put(`/api/stalls/${stall.stall_id}`, payload, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

            if (response.data.success) {
                setSuccessMsg(response.data.message);
                setStall(response.data.data);
                router.push('/dashboard'); 
            }
        } catch (err: any) {
            console.error("Error update stall:", err);
            setErrorMsg(err.response?.data?.message || "Gagal memperbarui profil stall.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-slate-500 font-medium text-sm">
                Memuat form edit profil...
            </div>
        );
    }

    if (!stall) {
        return (
            <div className="flex justify-center items-center h-64 text-red-500 font-medium text-sm">
                Data stall tidak ditemukan atau Anda belum memiliki stall.
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-100 mt-6">
            <div className="mb-8 border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-bold text-slate-900">Edit Profil Stall</h2>
                <p className="text-sm text-slate-500 mt-1">Perbarui informasi toko Anda agar mahasiswa mudah menemukan Anda.</p>
            </div>

            {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium">
                    {errorMsg}
                </div>
            )}
            
            {successMsg && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-sm rounded-xl font-medium">
                    {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                <div className="flex flex-col md:flex-row gap-5">
                    <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-slate-800">Nama Stall</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Contoh: Warung S"
                            className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors"
                        />
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-slate-800">Nomor WhatsApp</label>
                        <input
                            type="text"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            required
                            placeholder="0812xxxxxx"
                            className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-800">Nomor Blok</label>
                    <select
                        name="block_id"
                        value={formData.block_id}
                        onChange={handleInputChange}
                        className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white md:w-1/2"
                    >
                        <option value="1">Blok 1</option>
                        <option value="2">Blok 2</option>
                        <option value="3">Blok 3</option>
                        <option value="4">Blok 4</option>
                        <option value="5">Blok 5</option>
                        <option value="6">Blok 6</option>
                        <option value="7">Blok 7</option>
                        <option value="8">Blok 8</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-800">Deskripsi Singkat</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        placeholder="Ceritakan tentang menu unggulan atau spesialisasi stall Anda..."
                        className="border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none transition-colors"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-800">Foto Banner / Profil</label>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden group relative"
                    >
                        {preview ? (
                            <>
                                <img src={preview} alt="Preview Banner" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-sm font-bold px-4 py-2 border-2 border-white rounded-lg">Ubah Foto</span>
                                </div>
                            </>
                        ) : (
                            <span className="text-sm font-medium text-slate-500">Klik untuk upload gambar baru</span>
                        )}
                    </div>
                    <input 
                        type="file" 
                        accept="image/*"
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Kosongkan jika tidak ingin mengubah foto profil stall Anda.</p>
                </div>

                <div className="flex justify-between gap-4 mt-6 border-t border-slate-100 pt-6">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-800 text-white text-sm font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Berhenti Berjualan
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#0F172A] hover:bg-slate-800 text-white text-sm font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>

            </form>
        </div>
    );
}