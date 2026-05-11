import { NextRequest, NextResponse } from "next/server";
import { deleteItem, editItem, getItemById, setItemStatus } from "@/services/itemService";
import axios from "axios";
import { getAuth } from "@/lib/auth";

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { id: item_id } = await params;
        const result = await getItemById(item_id);
        return NextResponse.json({
            success: true,
            message: "Successfully retrieved item by id",
            data: result
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        const { id: item_id } = await params;
        const formData = await req.formData();
        const category_id = formData.get('category_id') as string;
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = formData.get('price') as string;
        const file = formData.get('file') as File;
        const existing_url = formData.get('picture_url') as string;
        const priceNumber = parseInt(price);
        if (!name || !price || !category_id || !description) {
            return NextResponse.json({
                success: false,
                message: "Data tidak lengkap"
            }, { status: 400 });
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

        const result = await editItem(user.stall_id, category_id, file, name, description, priceNumber, existing_url, item_id);
        return NextResponse.json({
            success: true,
            message: "Successfully updated item",
            data: result
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const { id: item_id } = await params;
        const cookieHeader = req.headers.get('cookie') ?? '';
        const res = await axios.get(`${process.env.WEB_URL}/api/auth/me`,
            {
                headers: {
                    Cookie: cookieHeader
                }
            }
        );

        const user = res.data.data;

        const result = await deleteItem(item_id, user.stall_id);
        return NextResponse.json({
            success: true,
            message: "Successfully deleted item",
            data: result
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const { id: item_id } = await params;
        const { status } = await req.json();
        const user = await getAuth();
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const result = await setItemStatus(item_id, status);
        return NextResponse.json({
            success: true,
            message: "Successfully set item status",
            data: result
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 })
    }
}
