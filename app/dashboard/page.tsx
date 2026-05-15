'use client'
import axios from "axios";
import { useState, useEffect } from "react";
import Image from "next/image";
import SellerDashboard from "./dashboard";
import MenuItems from "./menu_items";
import Ulasan from "./ulasan";
import ProfileStall from "./profilStall";

type Stall = {
    stall_id: string;
    owner_id: string;
    block_id: number;
    name: string;
    phone_number: string;
    description: string;
    picture_url: string;
    rating_avg: number;
    is_open: boolean;
    created_at: string;
    min_price: number | null;
    max_price: number | null;
}

export default function Dashboard() {
    const [page, setPage] = useState("dashboard");
    const [stall, setStall] = useState<Stall | null>(null);

    useEffect(() => {
    async function loadStall() {
        try {
            const authResponse = await axios.get(`/api/auth/me`);
            
            if (authResponse.data.success) {
                const userId = authResponse.data.data.user_id; 
                
                const stallResponse = await axios.get(`/api/stalls`, {
                    params: { 
                        user_id: userId,
                        semua: true 
                    }, 
                });

                if (stallResponse.data.success) {
                    const retrievedStall: Stall = stallResponse.data.data[0];
                    setStall(retrievedStall);
                } else {
                    setStall(null);
                }

            } else {
                setStall(null);
            }
        } catch (error) {
            console.error("Gagal memuat data stall:", error);
            setStall(null);
        }
    }

    loadStall();
}, []);

    const renderPage = () => {
        switch (page) {
            case "dashboard":    return <SellerDashboard stall_id={stall?.stall_id}/>;
            case "menu items":   return <MenuItems stall_id={stall?.stall_id}/>;
            case "ulasan":       return <Ulasan stall_id={stall?.stall_id}/>;
            case "profil stall": return <ProfileStall stall_id={stall?.stall_id}/>;
            default:             return <SellerDashboard stall_id={stall?.stall_id}/>;
        }
    };

    const Buttons = ["Dashboard", "Menu Items", "Ulasan", "Profil Stall"];

    return (
        <div className="w-full min-h-screen flex flex-row bg-white">
            <nav className="h-screen w-64 flex flex-col justify-between border-r border-slate-200 py-8">
                <div>
                    <div className="flex flex-row items-center gap-3 mb-10 px-6">
                        <Image src="/makara-ftui.png" alt="Logo" width={32} height={32} className="rounded-md" />
                        <p className="font-bold text-xl text-slate-900 tracking-tight">KanteKuy</p>
                    </div>

                    <div className="flex flex-col w-full gap-2 px-6">
                        {Buttons.map((button) => {
                            const isSelected = page.toLowerCase() === button.toLowerCase();

                            return (
                                <button
                                    key={button}
                                    onClick={() => setPage(button.toLowerCase())}
                                    className={`w-full text-start pl-10 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                                        isSelected
                                            ? "bg-[#0F172A] text-white shadow-sm"
                                            : "text-slate-600 hover:bg-slate-300 hover:text-slate-900"
                                    }`}
                                >
                                    {button}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center border-t border-slate-200 pt-6">
                    <div>
                        <p className="font-bold text-sm text-slate-800">
                            {stall ? stall.name : "Memuat..."}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-500 mt-1">Seller Panel</p>
                    </div>
                </div>
            </nav>

            <main className="flex-1 bg-slate-50 p-8">
                {renderPage()}
            </main>
        </div>
    );
}