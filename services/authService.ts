import bcrypt from 'bcrypt';
import { pool } from '@/lib/db/config';
import { LoginType, RegisterType } from '@/app/types/types';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { JWTPayload } from 'jose';
import axios from 'axios';

export async function registerService({ username, email, password }: RegisterType) {
    const hashed = await bcrypt.hash(password, 10);
    const text = `
        insert into users (username, email, password) values
        ($1, $2, $3)
        returning *
    `;

    const result = await pool.query(text, [username, email, hashed]);
    return result.rows;
}

export async function loginService({ username, password }: LoginType) {
    const cookieStore = await cookies();
    const user = await pool.query(`
            select * from users where username = $1
        `, [username]);

    if (user.rows.length === 0) {
        throw Error('username doesn\'t exist');
    }

    const hashed = user.rows[0].password;
    const benar = await bcrypt.compare(password, hashed);
    if (!benar) {
        throw Error('incorrect password!');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw Error('no secret key');
    }

    const { password: _, ...userData } = user.rows[0];
    const response = await axios.get(`${process.env.WEB_URL}/api/stalls?user_id=${userData.user_id}`);
    let stall_id : string = response.data?.data[0]?.stall_id ? response.data?.data[0]?.stall_id : "";
    userData['stall_id'] = stall_id;
    const payload: JWTPayload = {
        user_id: userData.user_id,
        stall_id: userData.stall_id,
        username: userData.username,
        role: userData.role
    }

    const token = jwt.sign(payload, secret, { expiresIn: '24h' });
    cookieStore.set('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24
    });

    return userData;
}

export async function logoutService() {
    const cookie = await cookies();
    cookie.delete('token');
}