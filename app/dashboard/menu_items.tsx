import { useState, useEffect, useRef } from "react";
import axios from "axios";
import TambahMenuModal from "./tambahMenu";
import EditMenuModal from "./editMenu";

type MenuItem = {
    item_id: string;
    stall_id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    status: 'tersedia' | 'tutup';
    picture_url: string | null;
}

type MenuItemsProps = {
    stall_id: string;
}

export default function MenuItems({ stall_id }: MenuItemsProps) {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState("");
    const [selectedItem, setSelectedItem] = useState<MenuItem>();
    

    useEffect(() => {
        const fetchMenuItems = async () => {
            if (!stall_id) return;
            try {
                setLoading(true);
                const response = await axios.get(`/api/items?stall_id=${stall_id}`);
                
                if (response.data.success){
                    setMenuItems(response.data.data); 
                }
            } catch (err: any){
                console.error("Gagal memuat menu:", err);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, [stall_id]);

    const handleSuccessEdit = async () => {
        const menuRes = await axios.get(`/api/items`, { params: { stall_id } });
        if (menuRes.data.success) setMenuItems(menuRes.data.data);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full text-slate-400 text-sm">Memuat menu...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#1E293B] mb-6">Menu Items</h2>
                <button onClick={() => setShowModal("tambah menu")} className="flex items-center gap-1.5 bg-[#0F172A] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                    <span className="text-base leading-none">+</span> Tambah Item
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item) => (
                    <div key={item.item_id} className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-300">
                        <div onClick={() => {
                                        setShowModal("edit menu") 
                                        setSelectedItem(item)
                                    }
                                    } className="px-4 pb-4">
                            {
                                item.picture_url && (
                                    <img 
                                        src={item.picture_url} 
                                        alt={item.name} 
                                        className="w-full h-48 object-cover"
                                    />
                                )
                            }
                            <h3 className="text-lg font-bold text-[#1E293B] mt-5">{item.name}</h3>
                            <p className="text-sm text-slate-600">{item.description}</p>
                            <p className="text-xl font-bold text-[#1E293B] mt-4">Rp {item.price.toLocaleString()}</p>
                            <p className="text-sm font-semibold text-slate-500 mt-2 capitalize">{item.category}</p>
                            <p className={`text-sm font-semibold mt-2 ${item.status === 'tersedia' ? 'text-green-500' : 'text-red-500'}`}>
                                {item.status === 'tersedia' ? 'Tersedia' : 'Kosong'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            
            {showModal === "tambah menu" && (
                <TambahMenuModal
                    onClose={() => setShowModal("")}
                    onSuccess={handleSuccessEdit}
                />
            )}
            {showModal === "edit menu" && (
                <EditMenuModal
                    onClose={() => setShowModal("")}
                    onSuccess={handleSuccessEdit}
                    item={selectedItem}
                />
            )}
        </div>
    );
}