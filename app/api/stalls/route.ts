import { NextRequest, NextResponse } from "next/server";
import { JWTPayload } from "@/app/types/types";
import { getAuth } from "@/lib/auth";
import { createStall, getStall } from "@/services/stallService";

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

        const user: JWTPayload | null = await getAuth();
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized!"
            }, { status: 404 });
        }

        const result = await createStall(user.user_id, {name, description, block_id, phone_number}, file);
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
        const by_rating = searchParams.get('by_rating') === 'true';
        const semua = searchParams.get('semua') !== 'false';
        const limit = searchParams.get('limit');
        const user_id = searchParams.get('user_id');

        const result = await getStall(search, semua, user_id, by_rating, limit);
        return NextResponse.json({
            success: true,
            message: "Successfully retrieved stall data",
            data: result
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        })
    }
}