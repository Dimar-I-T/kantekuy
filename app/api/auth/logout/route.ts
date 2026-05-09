import { logoutService } from "@/services/authService";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        await logoutService();
        return NextResponse.json({
            success: true,
            message: "Successfully logged out"
        }, {status: 200});
    } catch (error: any) {
        console.log(error.message)
        return NextResponse.json({
            success: false,
            message: error.message
        }, {status: 500});
    }
}