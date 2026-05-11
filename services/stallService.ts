import { StallType } from "@/app/types/types";
import { cloudinary } from "@/lib/cloudinary";
import { pool } from "@/lib/db/config";
import { uploadPicture } from "./uploadPicture";

export async function createStall(user_id: string, { name, description, block_id, phone_number }: StallType, file: File) {
    if (!file) {
        throw Error('No file uploaded');
    }

    const image_url = await uploadPicture(file);
    try {
        await pool.query('BEGIN');
        const res = await pool.query(`
                insert into stalls (owner_id, name, description, picture_url, block_id, phone_number) values
                ($1, $2, $3, $4, $5, $6)
                returning *
            `, [user_id, name, description, image_url, block_id, phone_number]);
        
        if (res.rows.length == 0) {
            throw Error('Gagal menginsert stall');
        }

        const updateRole = await pool.query(`
                update users
                set role = 'seller'
                where user_id = $1
            `, [user_id]);
        
        if (res.rows.length == 0) {
            throw Error('Gagal mengupdate role');
        }

        await pool.query('COMMIT');
        return res.rows[0];
    } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
    }
}

export async function editStall(user_id: string, stall_id: string, { name, description, block_id, phone_number }: StallType, file: File | null, existing_url: string | null) {
    let finalImageUrl;
    if (file instanceof File && file.size > 0) {
        finalImageUrl = await uploadPicture(file);
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

    return res.rows[0];
}

export async function getStall(search: string | null, semua: boolean | null, user_id: string | null, by_rating: boolean | null, limit: string | null, block_id: string | null) {
    let query = `
        select stalls.stall_id as stall_id, owner_id, block_id, name, phone_number, description, picture_url, rating_avg, is_open, created_at, min_price_item.min_price as min_price 
        from stalls
        left join (
            select stall_id, min(price) as min_price
            from items
            group by stall_id
        ) as min_price_item
        on stalls.stall_id = min_price_item.stall_id
        where 1=1
    `
    //let query = `SELECT * FROM stalls WHERE 1=1`;
    const values: any[] = [];
    let valueIndex = 1;
    if (search) {
        query += ` AND name ILIKE $${valueIndex}`;
        values.push(`%${search}%`);
        valueIndex++;
    }

    if (block_id && !isNaN(Number(block_id))) {
        query += ` AND block_id = $${valueIndex}`;
        values.push(Number(block_id));
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
        query += ` ORDER BY rating_avg DESC NULLS LAST`;
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
            select stalls.stall_id as stall_id, owner_id, block_id, name, phone_number, description, picture_url, rating_avg, is_open, created_at, min_price_item.min_price as min_price 
            from stalls
            left join (
                select stall_id, min(price) as min_price
                from items
                group by stall_id
            ) as min_price_item
            on stalls.stall_id = min_price_item.stall_id
            where stalls.stall_id = $1
        `, [stall_id]);

    return result.rows[0];
}

export async function deleteStallById(stall_id: string, user_id: string) {
    const result = await pool.query(`
            delete from stalls where stall_id = $1 and owner_id = $2
            returning *
        `, [stall_id, user_id]);

    if (result.rows.length == 0) {
        throw Error('stall_id dan owner_id tidak cocok');
    }

    return result.rows[0];
}

export async function closeStallById(stall_id: string, is_open: string) {
    try {
        await pool.query('BEGIN');
        const closeStall = await pool.query(`
                update stalls
                set is_open = $1
                where stall_id = $2
                returning *
            `, [is_open, stall_id]);

        if (closeStall.rows.length === 0) {
            throw Error('Id salah');
        }

        const valueStatus = is_open === "true" ? "tersedia" : "tutup";
        const updateStatusItem = await pool.query(`
                update items
                set status = $1
                where stall_id = $2
                returning *    
            `, [valueStatus, stall_id]);

        if (updateStatusItem.rows.length === 0) {
            throw Error('Gagal update items');
        }

        await pool.query('COMMIT');
        return closeStall.rows[0];
    } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
    }
}