'use client'
import axios from "axios";
import { useState, useEffect } from "react";
import TambahMenuModal from "./tambahMenu";
import EditMenuModal from "./editMenu";

type MenuItem = {
    category_id: number;
    item_id: string;
    stall_id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    status: 'tersedia' | 'tutup';
    picture_url: string | null;
}

type StallDetail = {
    stall_id: string;
    name: string;
    rating_avg: number;
    is_open: boolean;
    min_price: number | null;
    max_price: number | null;
}

type SellerDashboardProps = {
    stall_id: string;
}

export default function SellerDashboard({ stall_id }: SellerDashboardProps) {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [stall, setStall] = useState<StallDetail | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState("");
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [reviewCount, setReviewCount] = useState<number>(0);

    useEffect(() => {
        if (!stall_id) return;
        async function loadData() {
            try {
                const [stallRes, menuRes] = await Promise.all([
                    axios.get(`/api/stalls/${stall_id}`),
                    axios.get(`/api/items`, { params: { stall_id } }),
                ]);

                if (stallRes.data.success) {
                    setStall(stallRes.data.data);
                    setIsOpen(stallRes.data.data.is_open);
                }
                if (menuRes.data.success) {
                    setMenuItems(menuRes.data.data);
                }

            } catch (error) {
                console.error("Gagal memuat data dashboard:", error);
            } finally {
                setLoading(false);
            }
        }

        async function loadReviews() {
            try {
                const reviewRes = await axios.get(`/api/reviews`, { params: { stall_id } });
                if (reviewRes.data.success) {
                    const reviews = reviewRes.data.data || [];
                    setReviewCount(reviews.length);
                }
            } catch (error) {
                console.warn("Belum ada ulasan atau gagal memuat ulasan.");
                setReviewCount(0);
            }
        }

        loadReviews();
        loadData();
    }, [stall_id]);

    const handleToggleOpen = async () => {
        try {
            const next = !isOpen;
            await axios.patch(`/api/stalls/${stall_id}`, {
                is_open: next ? 'true' : 'false'
            });
            setIsOpen(next);
            await handleSuccessEdit();
        } catch (error) {
            console.error("Gagal mengubah status toko:", error);
        }
    };

    const handleSuccessEdit = async () => {
        const menuRes = await axios.get(`/api/items`, { params: { stall_id } });
        if (menuRes.data.success) setMenuItems(menuRes.data.data);
    };

    const handleToggleItemStatus = async (item: MenuItem) => {
        try {
            const nextStatus = item.status === 'tersedia' ? 'tutup' : 'tersedia';
            await axios.patch(`/api/items/${item.item_id}`, { status: nextStatus });
            setMenuItems(prev =>
                prev.map(m => m.item_id === item.item_id ? { ...m, status: nextStatus } : m)
            );
        } catch (error) {
            console.error("Gagal mengubah status item:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Memuat dashboard...
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Seller Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-0.5 not-lg:max-w-64">
                        Kelola menu dan profil kantin Anda dengan mudah.
                    </p>
                </div>
                <div className="flex not-md:flex-col-reverse items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-full px-3 py-1.5 bg-white">
                        <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-green-500" : "bg-red-400"}`} />
                        Status: {isOpen ? "Open" : "Closed"}
                    </span>
                    <button onClick={() => setShowModal("tambah menu")} className="flex items-center gap-1.5 bg-[#0F172A] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                        <span className="text-base leading-none">+</span> Tambah Item
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <p className="text-xs text-slate-500 font-medium mb-2">Total Menu</p>
                    <p className="text-3xl font-bold text-slate-900">{menuItems.length}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <p className="text-xs text-slate-500 font-medium mb-2">Rating Rata-rata</p>
                    <p className="text-3xl font-bold text-slate-900">
                        {stall?.rating_avg?.toFixed(1) ?? "0.0"}
                    </p>
                    <p className="text-xs text-green-500 font-semibold mt-1">{reviewCount} Ulasan</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <p className="text-xs text-slate-500 font-medium mb-2">Status Toko</p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleToggleOpen}
                            className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 ${
                                isOpen ? "bg-green-500 text-white" : "bg-slate-200 text-slate-600"
                            }`}
                        >
                            {!isOpen && <span className="w-5 h-5 rounded-full bg-white shadow-sm" />}
                            {isOpen ? "Buka" : "Tutup"}
                            {isOpen && <span className="w-5 h-5 rounded-full bg-white shadow-sm" />}
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Terlihat di Peta</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800 text-sm">Daftar Menu</h2>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-xs text-slate-400 font-medium border-b border-slate-100">
                            <th className="px-5 py-3">Item</th>
                            <th className="px-5 py-3">Kategori</th>
                            <th className="px-5 py-3">Harga</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {menuItems.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center text-slate-400 py-10 text-xs">
                                    Belum ada menu. Tambahkan item pertama Anda!
                                </td>
                            </tr>
                        ) : (
                            menuItems.map((item) => (
                                <tr key={item.item_id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3">
                                        <p className="font-semibold text-slate-800">{item.name}</p>
                                        <p className="text-xs text-slate-400">{item.description}</p>
                                    </td>
                                    <td className="px-5 py-3 text-slate-600 capitalize">{item.category}</td>
                                    <td className="px-5 py-3 text-slate-800 font-medium">
                                        Rp{item.price.toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-5 py-3">
                                        <button
                                            onClick={() => handleToggleItemStatus(item)}
                                            className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
                                                item.status === 'tersedia' ? "text-green-500" : "text-red-400"
                                            }`}
                                        >
                                            <span>●</span>
                                            {item.status === 'tersedia' ? "Tersedia" : "Kosong"}
                                        </button>
                                    </td>
                                    <td className="px-5 py-3">
                                        <button onClick={() => {
                                            setShowModal("edit menu")
                                            setSelectedItem(item)
                                        }} className="text-slate-400 hover:text-slate-700 transition-colors">
                                            ✎
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {showModal === "tambah menu" && (
                <TambahMenuModal
                    onClose={() => setShowModal("")}
                    onSuccess={handleSuccessEdit}
                />
            )}
            {showModal === "edit menu" && selectedItem && (
                <EditMenuModal
                    onClose={() => setShowModal("")}
                    onSuccess={handleSuccessEdit}
                    item={selectedItem}
                />
            )}
        </div>
    );
}