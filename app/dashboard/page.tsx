'use client'
import axios from "axios"
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const result = await axios.post('/api/auth/logout');
            if (result) {
                router.push('/');
            }
        } catch (error: any) {
            alert('error: ' + error.message);
        }
    }

    return (
        <div className="w-full h-screen flex flex-col gap-5 justify-center items-center">
            PAGE DASHBOARD
            <button onClick={handleLogout} className="bg-white text-black">
                LOGOUT
            </button>
        </div>
    )
}