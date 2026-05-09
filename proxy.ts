import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;
    const isDashboardRoute = pathname.startsWith('/dashboard');
    const isAuthRoute = pathname === '/auth/login' || pathname === '/auth/register';
    if (isDashboardRoute && !token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (token) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
            await jwtVerify(token, secret);
            if (isAuthRoute) {
                return NextResponse.redirect(new URL('/', request.url));
            }

            return NextResponse.next();
        } catch (error) {
            if (isDashboardRoute) {
                const response = NextResponse.redirect(new URL('/auth/login', request.url));
                response.cookies.delete('token'); 
                return response;
            }

            if (isAuthRoute) {
                const response = NextResponse.next();
                response.cookies.delete('token'); 
                return response;
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*', 
        '/auth/login',
        '/auth/login'
    ],
};