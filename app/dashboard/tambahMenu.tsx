'use client'
import axios from "axios";
import { useState, useEffect, useRef } from "react";

type Category = {
    category_id: number;
    name: string;
}

type TambahMenuModalProps = {
    onClose: () => void;
    onSuccess: () => void;
}

export default function TambahMenuModal({ onClose, onSuccess }: TambahMenuModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [form, setForm] = useState({
        name: "",
        price: "",
        category_id: "",
        description: "",
    });
    const [picture, setPicture] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
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
            if (picture) formData.append("file", picture);

            await axios.post("/api/items", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message ?? "Gagal menyimpan menu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-5">
                <h2 className="text-lg font-bold text-slate-900">Tambah Menu Baru</h2>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-600">Nama Item</label>
                    <input
                        type="text"
                        placeholder="Contoh: Ayam Bakar Madu"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                </div>

                <div className="flex gap-3">
                    <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-xs font-medium text-slate-600">Harga (Rp)</label>
                        <input
                            type="number"
                            placeholder="20000"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-xs font-medium text-slate-600">Kategori</label>
                        <select
                            value={form.category_id}
                            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                            className="capitalize border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white"
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

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-600">Deskripsi Singkat</label>
                    <textarea
                        placeholder="Jelaskan keunikan menu ini..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-600">Foto Menu</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 rounded-lg h-28 flex items-center justify-center cursor-pointer hover:border-slate-400 transition-colors overflow-hidden"
                    >
                        {preview ? (
                            <img src={preview} alt="preview" className="h-full w-full object-cover" />
                        ) : (
                            <p className="text-xs text-slate-400">Klik untuk upload gambar</p>
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
                    <p className="text-xs text-red-500 font-medium">{error}</p>
                )}

                <div className="flex gap-3 pt-1">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-[#0F172A] text-white text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Menyimpan..." : "Simpan Menu"}
                    </button>
                </div>
            </div>
        </div>
    );
}