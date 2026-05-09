import { NextRequest, NextResponse } from "next/server";
import {registerService} from '@/services/authService';

export async function POST(req: NextRequest) {
    try {
        const {username, email, password} = await req.json();
        const result = await registerService({username, email, password});
        return NextResponse.json({
            success: true,
            message: "Successfully registered",
            data: result
        }, {status: 201});
    } catch (error: any) {
        let errorMessage: string = error.message;
        if (errorMessage.startsWith('duplicate')) {
            errorMessage = 'username or email already exists';
        }

        return NextResponse.json({
            success: false,
            error: errorMessage
        }, {status: 500});
    }
}