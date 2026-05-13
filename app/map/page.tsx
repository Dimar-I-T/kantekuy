"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type Stall = {
    stall_id: string;
    owner_id: string;
    block_id: string | number;
    name: string;
    phone_number: string;
    description: string;
    picture_url: string | null;
    rating_avg: number | 0;
    is_open: boolean;
    min_price: number | 0;
    max_price: number | 0;
};

type Slot = {
    id: string;
    label: string;
    blockId: number;
};

const slots: Slot[] = [
    { id: "a1", label: "A1", blockId: 1 },
    { id: "a2", label: "A2", blockId: 2 },
    { id: "a3", label: "A3", blockId: 3 },
    { id: "a4", label: "A4", blockId: 4 },
    { id: "b1", label: "B1", blockId: 5 },
    { id: "b2", label: "B2", blockId: 6 },
    { id: "b3", label: "B3", blockId: 7 },
    { id: "b4", label: "B4", blockId: 8 },
];

export default function MapPage() {
    const [stalls, setStalls] = useState<Stall[]>([]);
    const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadStalls() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/stalls?semua=true');
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Gagal mengambil data');
                }
                setStalls(data.data ?? []);
            } catch (err: any) {
                setError(err.message || 'Terjadi kesalahan');
            } finally {
                setLoading(false);
            }
        }

        loadStalls();
    }, []);

    const mappedSlots = slots.map((slot) => {
        const stall = stalls.find((item) => Number(item.block_id) === slot.blockId) ?? null;
        return { ...slot, stall };
    });

    return (
        <div className="min-h-screen w-full text-black">
            <Image
                width={1920}
                height={1080}
                alt="bg"
                src={'/bg.png'}
                className="absolute top-0 z-0 object-cover w-screen"
            />
            <div className=" h-20"/>
            <main className="relative flex flex-col items-center px-4 py-8">
                <section className="relative w-full max-w-4xl overflow-hidden rounded-4xl px-10 bg-gray-200">
                    <div className="relative z-10 flex flex-col gap-6">
                        {
                            !loading && !error && (
                                <div className="flex flex-row items-center text-center gap-2">
                                    <div className="w-60"/>
                                    <span className="font-semibold uppercase w-40 pt-2 pb-4 border-x-2 border-b-2 border-gray-300 rounded-b-3xl">Entrance</span>
                                </div>
                            )
                        }

                        <div className="grid gap-4 md:grid-cols-4">
                            {
                                loading && (
                                <div className="flex col-span-full rounded-3xl h-96 p-10 justify-center items-center">
                                    Memuat data stall...
                                </div>
                                )
                            }

                            {
                                error && (
                                    <div className="flex col-span-full rounded-3xl h-96 p-10 justify-center items-center text-red-500">
                                        {error}
                                    </div>
                                )
                            }

                            {!loading && !error && mappedSlots.map((slot) => {
                                const stall = slot.stall;
                                return (
                                    <button
                                        key={slot.id}
                                        onClick={() => setSelectedStall(stall)}
                                        className={`group relative overflow-hidden rounded-3xl border-2 not-hover:border-dashed border-gray-300 p-5 text-left transition-all duration-300 hover:bg-gray-300`}
                                    >
                                        <div className="flex flex-row-reverse">
                                            <div className={`rounded-full p-2 w-3 ${stall?.is_open ? 'bg-green-500' : ''}`}>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center mt-10 mb-15 w-full h-fit">
                                            <p className="text-lg font-bold">{slot.label}</p>
                                            <p className="line-clamp-2 text-sm leading-6">{stall ? stall.name : 'Empty Slot'}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {
                            !loading && !error && (
                                <div className="flex flex-row items-center text-center gap-2">
                                    <div className="w-60"/>
                                    <span className="font-semibold uppercase w-40 pb-2 pt-4 border-x-2 border-t-2 border-gray-300 rounded-t-3xl">Seating area</span>
                                </div>
                            )
                        }
                    </div>
                </section>

                {selectedStall && (
                    <section className="absolute mt-5 w-full max-w-xl rounded-3xl bg-gray-100 shadow-xl shadow-black/30 z-30">
                        <button
                            onClick={() => setSelectedStall(null)}
                            className="absolute top-3 right-5 rounded-full bg-gray-200 px-2 pb-1 text-2xl text-gray-700 transition hover:bg-gray-600 hover:text-white font-bold"
                        >
                            ×
                        </button>
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center max-h-52 justify-center overflow-hidden rounded-t-3xl bg-gray-400">
                                {selectedStall.picture_url ? (
                                    <img
                                        src={selectedStall.picture_url}
                                        alt={selectedStall.name}
                                        className=" w-auto object-cover"
                                    />
                                ) : (
                                    <div className="flex h-56 items-center justify-center bg-slate-700 text-slate-400">Tidak ada gambar</div>
                                )}
                            </div>

                            <div className="flex flex-col mx-7 my-2">
                                <div className="flex flex-row items-start justify-between mb-5">
                                    <div className="">
                                        <h3 className="text-2xl font-bold mb-2">{selectedStall.name}</h3>
                                        <p className="text-sm ">{selectedStall.description}</p>
                                    </div>
                                    <div className={`flex border px-4 py-1 rounded-lg font-bold ${selectedStall.rating_avg >= 2.5 ? "border-yellow-300/50 bg-yellow-200/30 text-amber-800" : "border-red-500/50 bg-red-400/30 text-red-800"}`}>
                                        ⭐ {selectedStall.rating_avg}
                                    </div>
                                </div>

                                <div className="flex flex-row gap-5 w-full py-4 border-y border-gray-300">
                                    <div className="w-1/2  p-4">
                                        <p className="text-xs italic">Telepon</p>
                                        <p className="mt-3 text-base font-medium">{selectedStall.phone_number}</p>
                                    </div>
                                    <div className="w-1/2 p-4">
                                        <p className="text-xs italic">Harga</p>
                                        <p className="mt-3 text-base font-medium">{selectedStall.min_price ? `Rp ${selectedStall.min_price.toLocaleString()}` : "Rp 0"} - {selectedStall.max_price ? `Rp ${selectedStall.max_price.toLocaleString()}` : "Rp 0"}</p>
                                    </div>
                                </div>

                                <div className="flex flex-row w-full justify-center py-5">
                                    <Link href={`../stalls/${selectedStall.stall_id}`} className="w-3/4">
                                        <div className="rounded-2xl bg-black hover:bg-gray-500 p-4 transition-colors duration-300">
                                            <p className="text-center text-white font-bold">Lihat Menu Lengkap</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <div className=" h-20"/>
            <footer className="fixed bottom-0 flex flex-row items-center justify-center bg-black border-t border-gray-100 w-screen h-fit gap-5 py-2 z-50">
                <div className="flex flex-row items-center justify-center gap-2">
                    <div className="rounded-full w-3 h-3 border border-white bg-green-400"/>
                    <p className="text-white"> Buka </p>
                </div>
                <div className="flex flex-row items-center justify-center gap-2">
                    <div className="rounded-full w-3 h-3 border border-white"/>
                    <p className="text-white"> Tutup </p>
                </div>
            </footer>
        </div>
    );
}