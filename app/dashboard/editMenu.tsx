'use client'
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { Trash } from "lucide-react";

type Category = {
    category_id: number;
    name: string;
}

type Item = {
    item_id: string;
    name: string;
    price: number;
    category_id: number;
    description: string;
    status: string;
    picture_url: string;
}

type EditMenuModalProps = {
    item: Item;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditMenuModal({ item, onClose, onSuccess }: EditMenuModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [form, setForm] = useState({
        name: item.name || "",
        price: item.price ? item.price.toString() : "",
        category_id: item.category_id ? item.category_id.toString() : "",
        description: item.description || "",
        status: item.status || "tersedia",
        picture_url: item.picture_url || "",
    });
    
    const [picture, setPicture] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(item.picture_url || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await axios.get("/api/categories");
                if (res.data.success) setCategories(res.data.data);
            } catch {
                console.error("Gagal memuat kategori");
            }
        }
        loadCategories();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPicture(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!form.name || !form.price || !form.category_id) {
            setError("Nama, harga, dan kategori wajib diisi.");
            return;
        }
        setError(null);
        setLoading(true);
        
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("description", form.description);
            formData.append("price", form.price);
            formData.append("category_id", form.category_id);

            if (picture) {
                formData.append("file", picture);
            } else if (form.picture_url) {
                formData.append("picture_url", form.picture_url);
            }

            await axios.put(`/api/items/${item.item_id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });
            if (form.status !== item.status) {
                await axios.patch(`/api/items/${item.item_id}`, 
                    { status: form.status }, 
                    { withCredentials: true }
                );
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message ?? "Gagal menyimpan pergantian menu.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setError(null);
        setLoading(true);

        try{
            await axios.delete(`/api/items/${item.item_id}`, {
                withCredentials: true
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message ?? "Gagal menghapus menu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-8 flex flex-col gap-6">
                <div className="flex justify-between">
                    <h2 className="text-2xl font-extrabold text-[#1E293B]">Edit Menu</h2>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="text-white text-sm font-bold bg-red-600 mt-2 py-2 px-5 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <Trash size={20} strokeWidth={2}/>
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-sm font-bold text-[#1E293B]">Nama Item</label>
                        <input
                            type="text"
                            placeholder="Contoh: Ayam Geprek Level 3"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:border-[#1E293B]"
                        />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-sm font-bold text-[#1E293B]">Kategori</label>
                        <select
                            value={form.category_id}
                            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                            className="capitalize border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:border-[#1E293B] bg-white"
                        >
                            <option value="">Pilih kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.category_id} value={cat.category_id} className="capitalize">
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-sm font-bold text-[#1E293B]">Harga (Rp)</label>
                        <input
                            type="number"
                            placeholder="18000"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:border-[#1E293B]"
                        />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-sm font-bold text-[#1E293B]">Status Makanan</label>
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:border-[#1E293B] bg-white"
                        >
                            <option value="tersedia">Tersedia</option>
                            <option value="kosong">Kosong</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-[#1E293B]">Deskripsi Singkat</label>
                    <textarea
                        placeholder="Deskripsi item..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3}
                        className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:border-[#1E293B] resize-none"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-[#1E293B]">Foto Menu</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 rounded-xl h-36 flex items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors overflow-hidden"
                    >
                        {preview ? (
                            <img src={preview} alt="preview" className="h-full w-full object-cover" />
                        ) : (
                            <p className="text-sm text-[#1E293B] font-medium">Klik untuk upload gambar</p>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                {error && (
                    <p className="text-xs text-red-500 font-bold">{error}</p>
                )}

                <div className="flex items-center justify-center gap-6 mt-2">
                    <button
                        onClick={onClose}
                        className="text-sm w-2/5 font-bold text-[#1E293B] hover:text-slate-600 transition-colors px-4 py-2"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="py-3 w-3/5 rounded-xl bg-[#131B2B] text-white text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            </div>
        </div>
    );
}