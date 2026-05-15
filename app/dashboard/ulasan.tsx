"use client";
import { useState, useEffect } from "react";
import { StarIcon } from "lucide-react";
import axios from "axios";

type Ulasan = {
    stall_id?: string;
    item_id?: string;
    username: string;
    comment: string;
    rating: number;
    created_at: string;
}

type Stall = {
    rating_avg: number;
}

type Items = {
    name: string;
    picture_url: string;
    item_id: string;
}

type ItemWithReviews = {
    item: Items;
    reviews: Ulasan[];
}

type UlasanProps = {
    stall_id: string;
}

export default function Ulasan({ stall_id }: UlasanProps){
    const [stallReviews, setStallReviews] = useState<Ulasan[]>([]);
    const [itemsWithReviews, setItemsWithReviews] = useState<ItemWithReviews[]>([]);
    const [stallRating, setStallRating] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<string>("Semua");

    useEffect(() => {
        if (!stall_id) return;

        async function loadStallReviews() {
            try {
                const stallRes = await axios.get(`/api/stalls/${stall_id}`);
                if (stallRes.data.success){
                    const data: Stall = stallRes.data.data;
                    setStallRating(data.rating_avg || 0);
                }

                const response = await axios.get(`/api/reviews`, { params: { stall_id } });
                if (response.data.success){
                    setStallReviews(response.data.data || []);
                }
            } catch (err: any) {
                console.warn("Gagal/Kosong memuat stall review:", err);
            } 
        }

        async function loadItemsReviews() {
            try {
                const fetchItems = await axios.get(`/api/items`, { params: { stall_id } });
                const items: Items[] = fetchItems.data.data || [];

                if (items.length === 0) return;
                
                const reviewPromises = items.map(async (item) => {
                    try {
                        const res = await axios.get(`/api/reviews`, { params: { item_id: item.item_id } });
                        return { 
                            item: item, 
                            reviews: res.data.success ? res.data.data : [] 
                        }; 
                    } catch {
                        return { item: item, reviews: [] };
                    }
                });

                const itemsAndTheirReviews = await Promise.all(reviewPromises);

                const reviewedItemsOnly = itemsAndTheirReviews.filter(data => data.reviews.length > 0);

                setItemsWithReviews(reviewedItemsOnly);
            } catch (err: any) {
                console.warn("Gagal memuat item reviews:", err);
            }
        }

        setLoading(true);
        Promise.all([loadStallReviews(), loadItemsReviews()]).finally(() => {
            setLoading(false);
        });
    }, [stall_id]);

    const formatTanggal = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <main className="flex flex-col w-full h-full p-6 gap-y-3">
            <div className="flex flex-row justify-between items-center border-b border-gray-400 pb-5">
                <div className="flex gap-5 items-center">
                    <h3 className="font-bold text-xl">Ulasan</h3>
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="border border-slate-300 rounded-lg pl-3 pr-4 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                    >
                        <option value="Semua">Semua</option>
                        <option value="Stall">Stall</option>
                        <option value="Item">Item</option>
                    </select>
                </div>
                <span className={`flex justify-start py-2 px-4 border items-center rounded-xl gap-2 font-semibold ${stallRating > 2.5 ? "border-yellow-800 bg-yellow-100 text-yellow-800" : "border-red-900 bg-red-300 text-red-900" }`}>
                    <StarIcon fill={stallRating > 2.5 ? "rgb(153, 102, 0)" : "rgb(204, 0, 0)"} strokeWidth={3} size={15} color={stallRating > 2.5 ? "rgb(153, 102, 0)" : "rgb(204, 0, 0)"}/>
                    {stallRating}
                </span>
            </div>

            { loading && <div className="flex items-center justify-center h-full text-slate-400 text-sm">Memuat Ulasan...</div> }
            { (filter === "Semua" || filter === "Stall") && !loading &&
                <div className="flex flex-col w-full gap-3 mt-2">
                    <span className="font-semibold text-slate-800">Ulasan Stall</span>
                    {stallReviews.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Belum ada ulasan untuk stall ini.</p>
                    ) : (
                        stallReviews.map((review, index) => (
                            <div key={`stall-${index}`} className="flex flex-row justify-between w-full border rounded-lg border-gray-300 px-6 py-4 bg-white shadow-sm">
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-slate-900">{review.username}</span>
                                    <span className="text-sm italic text-gray-600">{ "\"" +  review.comment + "\""}</span>
                                </div>

                                <div className="flex flex-col gap-1 items-end justify-between">
                                    <span className="flex items-center gap-1 font-medium">
                                        <StarIcon fill={review.rating > 2.5 ? "rgb(153, 102, 0)" : "rgb(204, 0, 0)"} strokeWidth={3} size={15} color={review.rating > 2.5 ? "rgb(153, 102, 0)" : "rgb(204, 0, 0)"}/>
                                        {review.rating}
                                    </span>
                                    <span className="text-xs text-gray-500 italic">{formatTanggal(review.created_at)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            }

            { (filter === "Semua" || filter === "Item") && !loading && 
                <div className="flex flex-col w-full gap-3 mt-4">
                    <span className="font-semibold text-slate-800">Ulasan Item</span>
                    
                    {itemsWithReviews.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Belum ada ulasan untuk item.</p>
                    ) : (
                        itemsWithReviews.map((data, itemIndex) => (
                            <div key={`item-group-${itemIndex}`} className="flex flex-col w-full border rounded-lg border-gray-300 p-5 bg-white shadow-sm gap-4">
                                
                                <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-3">
                                    {data.item.picture_url ? (
                                        <img src={data.item.picture_url} alt={data.item.name} className="w-12 h-12 object-cover rounded-md border border-gray-200" />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-[10px] text-gray-400 border border-gray-200">No Img</div>
                                    )}
                                    <span className="font-bold text-slate-800">{data.item.name}</span>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {data.reviews.map((review, reviewIndex) => (
                                        <div key={`review-${itemIndex}-${reviewIndex}`} className="flex flex-row justify-between w-full">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-semibold text-slate-900 text-sm">{review.username}</span>
                                                <span className="text-sm italic text-gray-600">{ "\"" +  review.comment + "\""}</span>
                                            </div>

                                            <div className="flex flex-col gap-1 items-end justify-between">
                                                <span className="flex items-center gap-1 font-medium">
                                                    <StarIcon fill={review.rating > 2.5 ? "rgb(153, 102, 0)" : "rgb(204, 0, 0)"} strokeWidth={3} size={15} color={review.rating > 2.5 ? "rgb(153, 102, 0)" : "rgb(204, 0, 0)"}/>
                                                    {review.rating}
                                                </span>
                                                <span className="text-[10px] text-gray-500 italic">{formatTanggal(review.created_at)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        ))
                    )}
                </div>
            }
        </main>
    )
}