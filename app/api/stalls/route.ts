import { NextRequest, NextResponse } from "next/server";
import { createStall, getStall } from "@/services/stallService";
import axios from "axios";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const block_id = formData.get('block_id') as string;
        const phone_number = formData.get('phone_number') as string;
        const file = formData.get('file') as File;
        if (!name || !description || !block_id || !phone_number) {
            return NextResponse.json({
                success: false,
                message: "tidak lengkap"
            });
        }

        const cookieHeader = req.headers.get('cookie') ?? '';
        const res = await axios.get(`${process.env.WEB_URL}/api/auth/me`,
            {
                headers: {
                    Cookie: cookieHeader
                }
            }
        );

        const user = res.data.data;
        const result = await createStall(user.user_id, { name, description, block_id, phone_number }, file);
        return NextResponse.json({
            success: true,
            message: "Successfully created Stall",
            data: result
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const search = searchParams.get('search');
        const block_id = searchParams.get('block_id');
        const by_rating = searchParams.get('by_rating') === 'true';
        const semua = searchParams.get('semua') !== 'false';
        const limit = searchParams.get('limit');
        const user_id = searchParams.get('user_id');

        const result = await getStall(search, semua, user_id, by_rating, limit, block_id);
        return NextResponse.json({
            success: true,
            message: "Successfully retrieved stall data",
            data: result
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, {status: 500})
    }
}