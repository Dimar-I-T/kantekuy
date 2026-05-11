import { createReview, getReview } from "@/services/reviewService";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    try {
        const { stall_id, item_id, comment, rating } = await req.json();
        const cookieHeader = req.headers.get('cookie') ?? '';
        const res = await axios.get(`${process.env.WEB_URL}/api/auth/me`,
            {
                headers: {
                    Cookie: cookieHeader
                }
            }
        );

        const user = res.data.data;

        const result = await createReview(user.user_id, stall_id, item_id, comment, rating);
        return NextResponse.json({
            success: true,
            message: "Successfully created the review",
            data: result
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const stall_id = searchParams.get('stall_id') as string;
        const item_id = searchParams.get('item_id') as string;

        if (!stall_id && !item_id) {
            return NextResponse.json({
                success: false,
                message: "Harus ada stall_id atau item_id"
            })
        }

        const result = await getReview(stall_id, item_id);
        return NextResponse.json({
            success: true,
            message: "Successfully retrieved reviews",
            data: result
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, {status: 500})
    }
}