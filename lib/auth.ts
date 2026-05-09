import { JWTPayload } from "@/app/types/types";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function getAuth(): Promise<JWTPayload | null> {
    const cookie = await cookies();
    const token = cookie.get('token')?.value;
    if (!token) {
        console.log('Unauthorized!');
        return null;
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload as unknown as JWTPayload;
    } catch (error: any) {
        return null;
    }
}