import { NextRequest, NextResponse } from "next/server";
import { loginService } from "@/services/authService";

export async function POST(req: NextRequest) {
    try {
        const {username, password} = await req.json();
        const result = await loginService({username, password});
        return NextResponse.json({
            success: true,
            message: "Successfully logged in",
            data: result
        }, {status: 200});
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, {status: 500});
    }
}