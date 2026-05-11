import { pool } from "@/lib/db/config";
import { uploadPicture } from "./uploadPicture";

export async function createItem(stall_id: string, category_id: string, file: File, name: string, description: string, price: number) {
    if (!file) {
        throw Error('Tidak ada file picture');
    }

    const picture_url = await uploadPicture(file);
    const result = await pool.query(`
            insert into items (stall_id, category_id, name, description, price, picture_url) values
            ($1, $2, $3, $4, $5, $6)
            returning *
        `, [stall_id, category_id, name, description, price, picture_url]);

    return result.rows;
}

export async function getItems(search: string, by_rating: boolean, category: string, stall_id: string, limit: string, item_id: string, by_price: string) {
    let query = `
        select item_id, stall_id, categories.name as category, items.name as name, description, price, rating_avg, picture_url, status, created_at 
        from items 
        join categories
        on categories.category_id = items.category_id
        WHERE 1=1`;
    const values: any[] = [];
    let valueIndex = 1;
    if (search) {
        query += ` AND name ILIKE $${valueIndex}`;
        values.push(`%${search}%`);
        valueIndex++;
    }

    if (stall_id) {
        query += ` AND stall_id = $${valueIndex}`;
        values.push(stall_id);
        valueIndex++;
    }

    if (item_id) {
        query += ` AND item_id = $${valueIndex}`;
        values.push(item_id);
        valueIndex++;
    }

    if (category) {
        query += ` AND categories.name = $${valueIndex}`;
        values.push(category);
        valueIndex++;
    }

    let orderByClauses: string[] = [];
    if (by_price === 'asc' || by_price === 'desc') {
        orderByClauses.push(`price ${by_price.toUpperCase()}`);
    }

    if (by_rating) {
        orderByClauses.push(`rating_avg DESC NULLS LAST`);
    }

    if (orderByClauses.length > 0) {
        query += ` ORDER BY ${orderByClauses.join(', ')}`;
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

export async function getItemById(item_id: string) {
    const result = await pool.query(`
            select * from items where item_id = $1
        `, [item_id]);

    return result.rows;
}

export async function editItem(stall_id: string, category_id: string, file: File, name: string, description: string, price: number, existing_url: string | null, item_id: string) {
    let finalImageUrl;
    if (file instanceof File && file.size > 0) {
        finalImageUrl = await uploadPicture(file);
    } else {
        finalImageUrl = existing_url;
    }

    const res = await pool.query(`
            update items
            set name = $1, description = $2, category_id = $3, price = $4, picture_url = $5
            where item_id = $6 and stall_id = $7
            returning *
        `, [name, description, category_id, price, finalImageUrl, item_id, stall_id]);

    if (res.rows.length == 0) {
        throw Error('item_id atau stall_id tidak cocok');
    }

    return res.rows;
}

export async function deleteItem(item_id: string, stall_id: string) {
    const result = await pool.query(`
            delete from items where item_id = $1 and stall_id = $2
            returning *
        `, [item_id, stall_id]);

    if (result.rows.length === 0) {
        throw Error('item_id dan stall_id tidak cocok');
    }

    return result.rows;
}

export async function setItemStatus(item_id: string, status: string) {
    try {
        const result = await pool.query(`
                update items
                set status = $1
                where item_id = $2
                returning *
            `, [status, item_id]);

        return result.rows;
    } catch (error) {
        throw error;
    }
}