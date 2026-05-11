import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { createItem, getItems } from "@/services/itemService";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const category_id = formData.get('category_id') as string;
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = formData.get('price') as string;
        const file = formData.get('file') as File;
        const priceNumber = parseInt(price);
        if (!name || !price || !category_id || !description || !file) {
            return NextResponse.json({
                success: false,
                message: "Data tidak lengkap"
            }, {status: 400});
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

        const result = await createItem(user.stall_id, category_id, file, name, description, priceNumber);

        return NextResponse.json({
            success: true,
            message: "Successfully created item",
            data: result
        }, {status: 200});
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, {status: 500});
    }
}

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const search = searchParams.get('search') as string;
        const by_rating = searchParams.get('by_rating') === 'true';
        const category = searchParams.get('category') as string;
        const limit = searchParams.get('limit') as string;
        const stall_id = searchParams.get('stall_id') as string;
        const item_id = searchParams.get('item_id') as string;
        const by_price = searchParams.get('by_price') as string;

        const result = await getItems(search, by_rating, category, stall_id, limit, item_id, by_price);
        return NextResponse.json({
            success: true,
            message: "Successfully retrieved items",
            data: result
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, {status: 500})
    }
}
