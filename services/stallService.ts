import { StallType } from "@/app/types/types";
import { cloudinary } from "@/lib/cloudinary";
import { pool } from "@/lib/db/config";

export async function createStall(user_id: string, { name, description, block_id, phone_number }: StallType, file: File) {
    if (!file) {
        throw Error('No file uploaded');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64Image, {
        resource_type: "image",
        folder: "uploads",
    });

    const res = await pool.query(`
            insert into stalls (owner_id, name, description, picture_url, block_id, phone_number) values
            ($1, $2, $3, $4, $5, $6)
            returning *
        `, [user_id, name, description, result.secure_url, block_id, phone_number]);

    return res.rows;
}

export async function editStall(user_id: string, stall_id: string, { name, description, block_id, phone_number }: StallType, file: File | null, existing_url: string | null) {
    let finalImageUrl;
    if (file instanceof File && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
        const result = await cloudinary.uploader.upload(base64Image, {
            resource_type: "image",
            folder: "uploads",
        });

        finalImageUrl = result.secure_url;
    } else {
        finalImageUrl = existing_url;
    }

    const res = await pool.query(`
            update stalls
            set name = $1, description = $2, block_id = $3, phone_number = $4, picture_url = $5
            where stall_id = $6 and owner_id = $7
            returning *
        `, [name, description, block_id, phone_number, finalImageUrl, stall_id, user_id]);
    
    if (res.rows.length == 0) {
        throw Error('stall_id dan owner_id tidak cocok');
    }

    return res.rows;
}

export async function getStall(search: string | null, semua: boolean | null, user_id: string | null, by_rating: boolean | null, limit: string | null) {
    let query = `SELECT * FROM stalls WHERE 1=1`;
    const values: any[] = [];
    let valueIndex = 1;
    if (search) {
        query += ` AND name ILIKE $${valueIndex}`;
        values.push(`%${search}%`);
        valueIndex++;
    }

    if (!semua) {
        query += ` AND is_open = true`;
    }

    if (user_id) {
        query += ` AND owner_id = $${valueIndex}`;
        values.push(user_id);
        valueIndex++;
    }

    if (by_rating) {
        query += ` ORDER BY rating DESC NULLS LAST`;
    } else {
        query += ` ORDER BY created_at DESC`;
    }

    if (limit && !isNaN(Number(limit))) {
        query += ` LIMIT $${valueIndex}`;
        values.push(Number(limit));
        valueIndex++;
    }

    const result = await pool.query(query, values);
    return result.rows;
}

export async function getStallById(stall_id: string) {
    const result = await pool.query(`
            select * from stalls where stall_id = $1
        `, [stall_id]);

    return result.rows;
}   

export async function deleteStallById(stall_id: string, user_id: string) {
    const result = await pool.query(`
            delete from stalls where stall_id = $1 and owner_id = $2
            returning *
        `, [stall_id, user_id]);

    if (result.rows.length == 0) {
        throw Error('stall_id dan owner_id tidak cocok');
    }

    return result.rows;
}