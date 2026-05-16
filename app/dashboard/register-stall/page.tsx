"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';

export default function RegisterStall() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        block_id: '1',
        phone_number: '',
    });

    const [picture, setPicture] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);


    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const blok = [1, 2, 3, 4, 5, 6, 7, 8];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPicture(file);
            const fileUrl = URL.createObjectURL(file);
            setPreview(fileUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('description', formData.description);
            payload.append('block_id', formData.block_id);
            payload.append('phone_number', formData.phone_number);

            if (picture) {
                payload.append('file', picture, picture.name);
            } else {
                throw new Error("Foto banner stall wajib diisi");
            }

            const response = await fetch('/api/stalls', {
                method: 'POST',
                credentials: 'include',
                body: payload,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Backend error response:", errorData);
                throw new Error(errorData.message || 'Gagal mendaftarkan stall');
            }

            setSuccessMsg('Stall berhasil didaftarkan!');
            window.location.href = '/dashboard';

        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">

            <div className="absolute inset-0 -z-10">
                <Image
                    src="/bg_reg_stall.png"
                    alt="Background Register Stall"
                    fill
                    priority
                    className="object-cover"
                />
            </div>

            <div className="bg-white z-10 w-full max-w-[1000px] rounded-3xl flex flex-col md:flex-row overflow-hidden border relative">

                <div className="w-full md:w-[45%] p-10 lg:p-12 border-r border-gray-100 flex flex-col bg-white">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-4">
                            Mulai Bisnismu di Kantin Teknik
                        </h1>
                        <p className="text-gray-600 text-sm leading-relaxed mb-8">
                            Bergabunglah dengan puluhan seller lainnya dan jangkau ribuan mahasiswa setiap harinya melalui platform digital kami.
                        </p>

                        <div className="flex flex-col gap-6 pl-10">
                            <div className="flex items-start gap-4">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Visibilitas Tinggi</h3>
                                    <p className="text-xs text-gray-500">Booth Anda tampil di peta interaktif.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Dashboard Seller</h3>
                                    <p className="text-xs text-gray-500">Kelola menu dan lihat ulasan pelanggan.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Integrasi WhatsApp</h3>
                                    <p className="text-xs text-gray-500">Pemesanan langsung ke nomor Anda.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex items-center gap-3">
                        <div className="flex -space-x-3">
                            <div className="w-8 h-8 rounded-full border-2 bg-white"></div>
                            <div className="w-8 h-8 rounded-full border-2 bg-white"></div>
                            <div className="w-8 h-8 rounded-full border-2 bg-white"></div>
                        </div>
                        <span className="text-xs font-medium text-gray-600">Daftar bersama 24 seller lainnya</span>
                    </div>
                </div>

                <div className="w-full md:w-[55%] p-10 lg:p-12 bg-white">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Daftarkan Stall Anda</h2>
                    <p className="text-sm text-gray-500 mb-6">Lengkapi data di bawah untuk membuat profil stall.</p>

                    {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{errorMsg}</div>}
                    {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">{successMsg}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-900 mb-1.5">Nama Stall</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                                placeholder="Contoh: Ayam Geprek FT"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-900 mb-1.5">Deskripsi Singkat</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows={3}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors resize-none"
                                placeholder="Ceritakan sedikit tentang stall Anda..."
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-900 mb-1.5">Nomor Blok</label>
                                <select
                                    name="block_id"
                                    value={formData.block_id}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white"
                                >
                                    {
                                        blok.map((block) => (
                                            <option key={block} value={`${block}`}>
                                                Blok {block}
                                            </option>
                                        )
                                        )
                                    }
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-900 mb-1.5">Nomor WhatsApp</label>
                                <input
                                    type="text"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                                    placeholder="08..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-900 mb-1.5">Foto Banner Stall</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-2xl h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden"
                            >
                                {preview ? (
                                    <img src={preview} alt="Preview Banner" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <svg className="w-8 h-8 text-[#1A237E] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        <span className="text-xs font-bold text-gray-900">Klik untuk upload gambar</span>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black text-white font-bold text-sm py-3.5 rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-400 mt-4"
                        >
                            {isLoading ? 'Mendaftarkan...' : 'Daftarkan Sekarang'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}