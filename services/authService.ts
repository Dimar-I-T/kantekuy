import bcrypt from 'bcrypt';
import { pool } from '@/lib/db/config';
import { LoginType, RegisterType } from '@/app/types/types';
import { cookies } from 'next/headers';
import { JWTPayload } from 'jose';

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
    const payload: JWTPayload = {
        user_id: userData.user_id,
        role: userData.role
    }

    return payload;
}

export async function getUserData(user_id : string) {
    try {
        const result = await pool.query(`
                select user_id, username, email, role, stall_id
                from users
                left join stalls
                on users.user_id = stalls.owner_id
                where user_id = $1
            `, [user_id]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

export async function logoutService() {
    const cookie = await cookies();
    cookie.delete('token');
}