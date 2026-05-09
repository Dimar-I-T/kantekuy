import { deleteStallById, editStall, getStallById } from "@/services/stallService";
import { NextRequest, NextResponse } from "next/server";
import { JWTPayload } from "@/app/types/types";
import { getAuth } from "@/lib/auth";

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { id: stall_id } = await params;
        const result = await getStallById(stall_id);
        return NextResponse.json({
            success: true,
            message: "Successfully retrieved stall by id",
            data: result
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        const { id: stall_id } = await params;
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const block_id = formData.get('block_id') as string;
        const phone_number = formData.get('phone_number') as string;
        const file = formData.get('file') as File;
        const existing_url = formData.get('picture_url') as string;
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

        const result = await editStall(user.user_id, stall_id, { name, description, block_id, phone_number }, file, existing_url);
        return NextResponse.json({
            success: true,
            message: "Successfully updated Stall",
            data: result
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const { id: stall_id } = await params;
        const user: JWTPayload | null = await getAuth();
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized!"
            }, { status: 404 });
        }

        const result = await deleteStallById(stall_id, user.user_id);
        return NextResponse.json({
            success: true,
            message: "Successfully deleted stall by id",
            data: result
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        })
    }
}