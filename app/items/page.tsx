"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { X, ShoppingBag } from 'lucide-react';

type Items = {
    item_id: string;
    stall_id: string;
    category: string;
    name: string;
    stall_name: string;
    description: string | null;
    price: number | null;
    rating_avg: number | null;
    picture_url: string | null;
    status: string;
};

const STATUS_COLOR: Record<string, string> = {
    tersedia: "bg-green-500",
    tutup: "bg-gray-700",
    kosong: "bg-red-500",
};

export default function ItemsPage() {
    const [items, setItems] = useState<Items[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sort, setSort] = useState<"Rating" | "Harga" | "">("");

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("search") ?? "");
    const [selectedItem, setSelectedItem] = useState<Items | null>(null);

    useEffect(() => {
        async function loadItems() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch("/api/items");
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || "Gagal mengambil data");
                }
                const responseCategories = await fetch("/api/categories");
                const category = await responseCategories.json();
                if (!responseCategories.ok) {
                    throw new Error(category.message || "Gagal mengambil kategori");
                }
                setCategories(category.data.map((c: { category_id: string; name: string }) => c.name));
                setItems(data.data ?? []);
            } catch (err: any) {
                setLoading(false);
                setError(err.message || "Terjadi kesalahan");
            } finally {
                setLoading(false);
            }
        }

        loadItems();
    }, []);

    useEffect(() => {
        setSearch(searchParams.get("search") ?? "");
    }, [searchParams]);


    function toggleCategory(category: string) {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    }

    function getDisplayedItems(): Items[] {
        const searchLower = search.toLowerCase().trim();

        const searched = searchLower
            ? items.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchLower) ||
                    item.stall_name.toLowerCase().includes(searchLower) ||
                    item.category.toLowerCase().includes(searchLower)
            )
            : items;

        const filtered =
            selectedCategories.length === 0
                ? searched
                : searched.filter((item) => selectedCategories.includes(item.category));

        if (sort === "Rating") {
            return [...filtered].sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0));
        }
        if (sort === "Harga") {
            return [...filtered].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        }
        return filtered;
    }

    function formatPrice(price: number): string {
        if (price >= 1000) return `Rp${Math.round(price / 1000)}k`;
        return `Rp${price}`;
    }

    async function handleOrder(item: Items) {
        const stall = await fetch(`/api/stalls/${item.stall_id}`)
        const data = await stall.json();
        const message = `Halo ${item.stall_name}, saya ingin memesan ${item.name} melalui KanteKuy.`;
        window.open(`https://wa.me/${data.data?.phone_number}?text=${encodeURIComponent(message)}`, '_blank');
    };

    useEffect(() => {
        document.body.style.overflow = selectedItem ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [selectedItem]);

    const displayedItems = getDisplayedItems();

    return (
        <div className="flex flex-col w-full min-h-screen bg-white">
            <header className="flex flex-col min-h-1/4 py-15 px-10 max-md:px-5 max-md:py-10 border-b">
                <h1 className="text-4xl font-bold">Item Explorer</h1>
                <div className="flex flex-row justify-between items-center max-md:items-start max-md:flex-col">
                    <h3 className="mt-3">
                        Temukan menu spesifik dari seluruh stall di Kantin Teknik.
                    </h3>
                    <div className="flex flex-row items-center gap-5 max-md:gap-3 mt-3">
                        <div className="flex flex-row items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500 border" />
                            <p>Tersedia</p>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-700 border" />
                            <p>Tutup</p>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 border" />
                            <p>Kosong</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex flex-row max-md:flex-col w-full flex-1 max-md:justify-center">
                <div className="flex flex-col w-1/5 bg-gray-300/80 border-r max-md:w-full max-md:z-10 max-md:bg-white max-md:justify-center max-md:items-start max-md:py-0">
                    <div className="block md:hidden py-4 px-8">
                        <h4 className="font-semibold text-xl mb-3 mt-0">Kategori</h4>
                        <div className="relative w-full">
                            <select
                                className="w-full border pr-6 text-[13px] border-gray-300 rounded-md px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedCategories.length === 0 ? "" : selectedCategories[0]}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedCategories(val === "" ? [] : [val]);
                                }}
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat} className="capitalize">
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="hidden md:block py-10 px-8">
                        <h4 className="font-semibold text-xl mb-3 mt-0">Kategori</h4>

                        <div className="flex items-center mb-1">
                            <input
                                type="checkbox"
                                id="cat-all"
                                checked={selectedCategories.length === 0}
                                onChange={() => setSelectedCategories([])}
                                className="mr-2"
                            />
                            <label htmlFor="cat-all" className="text-gray-700">
                                Semua Kategori
                            </label>
                        </div>

                        {categories.map((cat) => (
                            <div key={cat} className="flex items-center mb-1">
                                <input
                                    type="checkbox"
                                    id={`cat-${cat}`}
                                    checked={selectedCategories.includes(cat)}
                                    onChange={() => toggleCategory(cat)}
                                    className="mr-2"
                                />
                                <label htmlFor={`cat-${cat}`} className="text-gray-700 capitalize">
                                    {cat}
                                </label>
                            </div>
                        ))}
                    </div>

                    <div className="block md:hidden py-4 px-8">
                        <h4 className="font-semibold text-xl mb-3 mt-0">Urutkan</h4>
                        <div className="relative w-full">
                            <select
                                className="w-full border pr-4 text-[13px] border-gray-300 rounded-md px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={sort}
                                onChange={(e) => setSort(e.target.value as "" | "Rating" | "Harga")}
                            >
                                <option value="">Default</option>
                                <option value="Rating">Rating Tertinggi</option>
                                <option value="Harga">Harga Terendah</option>
                            </select>
                        </div>
                    </div>

                    <div className="hidden md:flex flex-col px-8 gap-2">
                        <h4 className="font-semibold text-xl mb-1">Urutkan</h4>
                        <button
                            onClick={() => setSort(sort === "Rating" ? "" : "Rating")}
                            className={`text-start py-2 px-3 rounded-lg ${sort === "Rating" ? "border-2 border-gray-700" : ""
                                }`}
                        >
                            Rating Tertinggi
                        </button>
                        <button
                            onClick={() => setSort(sort === "Harga" ? "" : "Harga")}
                            className={`text-start py-2 px-3 rounded-lg ${sort === "Harga" ? "border-2 border-gray-700" : ""
                                }`}
                        >
                            Harga Terendah
                        </button>
                    </div>
                </div>

                <div className="w-4/5 p-6 max-md:px-2 max-md:py-0 flex justify-center max-md:w-full">
                    {loading && (
                        <div className="flex justify-center items-center h-full mt-40 text-gray-500">
                            Memuat data item...
                        </div>
                    )}

                    {error && (
                        <div className="flex justify-center items-center h-full mt-40 text-red-500">
                            {error}
                        </div>
                    )}

                    {!loading && !error && displayedItems.length === 0 && (
                        <div className="flex justify-center items-center h-full mt-40 text-gray-500">
                            Tidak ada item yang tersedia.
                        </div>
                    )}

                    {!loading && !error && displayedItems.length > 0 && (
                        <div className="grid grid-cols-3 max-md:grid-cols-2 w-full max-sm:grid-cols-1 gap-4 content-start px-20 py-10 max-md:px-5 max-md:py-8">
                            {displayedItems.map((item) => (
                                <div
                                    key={item.item_id}
                                    className="flex flex-col bg-white rounded-xl border shadow-sm overflow-hidden"
                                >
                                    <div className="relative">
                                        {item.picture_url ? (
                                            <img
                                                src={item.picture_url}
                                                alt={item.name}
                                                className="w-full h-44 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                                                Tidak ada gambar
                                            </div>
                                        )}
                                        <span className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-0.5 text-xs font-semibold flex items-center gap-1 shadow-sm">
                                            <span className="text-yellow-400">★</span>
                                            {item.rating_avg?.toFixed(1) ?? "-"}
                                        </span>
                                    </div>

                                    <div className="p-4 flex flex-col gap-1">
                                        <div className="flex flex-row justify-between items-start">
                                            <h3 className="font-bold text-sm leading-tight">{item.name}</h3>
                                            <span className="font-bold text-sm ml-2 shrink-0">
                                                {item.price != null ? formatPrice(item.price) : "-"}
                                            </span>
                                        </div>

                                        <div className="flex flex-row py-2 gap-2 items-center">
                                            <div className={`w-3 h-3 rounded-full shrink-0 ${STATUS_COLOR[item.status] ?? "bg-gray-400"}`} />
                                            <span className="font-semibold text-xs">{item.stall_name}</span>
                                        </div>

                                        {item.description && (
                                            <p className="text-xs italic text-gray-600 line-clamp-2 pb-3 border-b border-gray-200">
                                                {item.description}
                                            </p>
                                        )}

                                        <div className="flex flex-row justify-between items-center pt-2">
                                            <span className="text-xs text-gray-500 capitalize">{item.category}</span>
                                            <button onClick={() => { setSelectedItem(item) }} className="text-xs font-semibold text-gray-700 hover:underline">
                                                Detail Item
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {
                    selectedItem &&
                    (
                        <div onClick={() => setSelectedItem(null)} className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg bg-black/30 px-4">
                            <div onClick={(e) => e.stopPropagation()} className="bg-white border border-[#E2E8F0] rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="absolute top-6 right-6 w-10 h-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"
                                >
                                    <X className="w-5 h-5 text-[#0F172A]" />
                                </button>
                                <div className="h-72 bg-gray-100 w-full overflow-hidden">
                                    {selectedItem.picture_url ? (
                                        <img src={selectedItem.picture_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                            Tidak ada gambar
                                        </div>
                                    )}
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-3xl font-bold text-[#0F172A]">{selectedItem.name}</h2>
                                            <p className="text-[#38BDF8] font-bold text-xl mt-1">{selectedItem.price != null ? `Rp${selectedItem.price.toLocaleString('id-ID')}` : "-"}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 leading-relaxed italic">{selectedItem.description}</p>
                                    <div className="pt-6 border-t border-gray-100">
                                        <button
                                            onClick={() => handleOrder(selectedItem)}
                                            className="w-full bg-[#0F172A] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl cursor-pointer"
                                        >
                                            <ShoppingBag className="w-5 h-5" />
                                            Pesan Item Ini Sekarang
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </main>
        </div>
    );
}