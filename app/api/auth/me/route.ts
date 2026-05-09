import { getAuth } from "@/lib/auth";
import { JWTPayload } from "@/app/types/types";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const user : JWTPayload | null = await getAuth();
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized!"
            }, {status: 404});
        }

        return NextResponse.json({
            success: true,
            message: "Successfully retrieved user data",
            data: user
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        });
    }
}